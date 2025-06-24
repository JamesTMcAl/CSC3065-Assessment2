import express from "express";
import axios from "axios";
import fs from "fs/promises";
import { checkServiceHealth, getHealthStatus } from "./monitoring.mjs"; // Import from monitoring.mjs
import configJson from "./config.json" assert { type: "json" };

const app = express();
const PORT = 8085;

// Load initial configuration
let config = configJson;
setInterval(() => checkServiceHealth(config), 10000); // Calling the imported function
checkServiceHealth(config); // Calling the imported function

// Middleware to parse JSON bodies
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

// Health Monitoring Endpoint
app.get("/monitor", (req, res) => {
    res.json(getHealthStatus());
});

app.get("/monitor-page", (req, res) => {
    const healthData = getHealthStatus();
    const html = `
        <html>
        <head>
            <title>Service Monitoring</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f4f4f4; }
                .up { color: green; }
                .down { color: red; }
            </style>
        </head>
        <body>
            <h1>Service Monitoring</h1>
            <table>
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Latency</th>
                        <th>Last Response/Error</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(healthData).map(([service, data]) => `
                        <tr>
                            <td>${service}</td>
                            <td class="${data.status === "Up" ? "up" : "down"}">${data.status}</td>
                            <td>${data.latency || "N/A"}</td>
                            <td>${data.lastResponse || data.error || "N/A"}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </body>
        </html>
    `;
    res.send(html);
});

// Dynamic route handler
app.all("/:service", (req, res) => dynamicRouteHandler(req, res));
app.all("/:service/*", (req, res) => dynamicRouteHandler(req, res));

async function dynamicRouteHandler(req, res) {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    console.log(`Requested service: ${req.params.service}`);
    console.log(`Available services:`, config.routes);

    const service = req.params.service;
    let targetUrl = config.routes[service];

    if (!targetUrl) {
        console.error(`Service ${service} not found.`);
        return res.status(404).json({ error: `Service ${service} not found.` });
    }

    const queryParams = new URLSearchParams(req.query);
    if (!queryParams.has('text') || queryParams.get('text').trim() === "") {
        console.error(`Missing 'text' parameter for service ${service}.`);
    return res.status(400).json({ error: "'text' parameter is required." });
    }
    targetUrl = `${targetUrl}?${queryParams.toString()}`;

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body, // Forward request body (if applicable)
            headers: req.headers // Forward headers (important for CORS and authentication)
        });
        console.log(`Response from backend:`, response.data);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`Error calling service ${service}:`, error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Internal server error." });
        }
    }
}

// Endpoint to reload configuration dynamically
app.post("/reload-config", (req, res) => {
    try {
        config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
        console.log("Configuration successfully reloaded.");
        res.status(200).json({ success: true, message: "Configuration reloaded." });
    } catch (error) {
        console.error("Failed to reload configuration:", error.message);
        res.status(500).json({ error: "Failed to reload configuration.", details: error.message });
    }
});

app.get("/services", (req, res) => {
    console.log("Fetching available services...");
    res.status(200).json(Object.keys(config.routes));
});

// Start the proxy server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Reverse proxy running on http://localhost:${PORT}`);
});

export default app; // Export for testing
