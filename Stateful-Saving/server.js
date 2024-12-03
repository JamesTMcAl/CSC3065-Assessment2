const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb"); // MongoDB client

let nanoid;
import("nanoid").then((module) => {
    nanoid = module.nanoid; // Dynamically load nanoid
});

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB Setup
const mongoURI = "mongodb://localhost:27017"; // Update with your MongoDB URI
const dbName = "textDB";
let db;

// Connect to MongoDB
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    db = client.db(dbName); // Access the database
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow all origins (use a specific domain in production)
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow specific HTTP methods
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers
    if (req.method === "OPTIONS") {
        return res.status(200).end(); // Respond to preflight requests
    }
    next();
});

// Save Text Endpoint
app.post("/save-text", async (req, res) => {
    const { text, id } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    const identifier = id && id.trim() !== "" ? id : nanoid(); // Use the provided ID or generate a new one

    try {
        const collection = db.collection("texts");
        const existingText = await collection.findOne({ _id: identifier });
        if (existingText) {
            return res.status(400).json({ error: "Identifier already exists. Please use a unique identifier." });
        }
        await collection.insertOne({ _id: identifier, content: text });
        res.json({ id: identifier });
    } catch (error) {
        console.error("Error saving text:", error);
        res.status(500).json({ error: "Failed to save text" });
    }
});

// Retrieve Text Endpoint
app.get("/get-text/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const collection = db.collection("texts");
        const document = await collection.findOne({ _id: id });

        if (!document) {
            return res.status(404).json({ error: "Text not found" });
        }
        res.json({ text: document.content });
    } catch (error) {
        console.error("Error retrieving text:", error);
        res.status(500).json({ error: "Failed to retrieve text" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
