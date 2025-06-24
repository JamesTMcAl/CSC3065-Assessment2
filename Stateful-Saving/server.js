const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose(); // Import SQLite

const app = express();
const PORT = 3000;

// Import nanoid for generating unique identifiers
let nanoid;
import("nanoid").then((module) => {
    nanoid = module.nanoid;
});

// Middleware
app.use(bodyParser.json());

// Database Setup: Create or connect to a file-based SQLite database
const db = new sqlite3.Database("./texts.db", (err) => {
    if (err) {
        console.error("Failed to connect to SQLite", err);
        process.exit(1);
    }
    console.log("Connected to SQLite database");
});

// Initialize Database Schema
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS texts (id TEXT PRIMARY KEY, content TEXT)", (err) => {
        if (err) {
            console.error("Failed to create texts table", err);
        }
    });
});

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow specific HTTP methods
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers
    if (req.method === "OPTIONS") {
        return res.status(200).end(); // Respond to preflight requests
    }
    next();
});

// Save Text Endpoint
app.post("/save-text", (req, res) => {
    const { text, id } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Text is required" });
    }

    const identifier = id && id.trim() !== "" ? id : nanoid(); // Use the provided ID or generate a new one
    db.run("INSERT INTO texts (id, content) VALUES (?, ?)", [identifier, text.trim()], (err) => {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(400).json({ error: "Identifier already exists. Please use a unique identifier." });
            }
            return res.status(500).json({ error: "Failed to save text" });
        }

        res.json({ id: identifier });
    });
});

// Retrieve Text Endpoint
app.get("/get-text/:id", (req, res) => {
    const { id } = req.params;

    db.get("SELECT content FROM texts WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Failed to retrieve text" });
        }
        if (!row) {
            return res.status(404).json({ error: "Text not found" });
        }

        res.json({ text: row.content });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


