
// Load environment variables from .env
require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Import router
const router = require("./routes/router");

// Middleware to parse JSON body payloads from incoming requests
app.use(express.json());

// Serve static frontend files (html, js, images) from the sibling 'frontend' directory
app.use(express.static(path.join(__dirname, "../frontend")));

// ==========================================
// STORE API ENDPOINTS (with JSON.stringify console logging & file writing)
// ==========================================

const storeFilePath = path.join(__dirname, "store.json");

// GET: Fetch all products from store.json
app.get("/api/store", (req, res) => {
    try {
        if (!fs.existsSync(storeFilePath)) {
            return res.json([]);
        }
        const fileData = fs.readFileSync(storeFilePath, "utf8");
        const products = JSON.parse(fileData);
        res.json(products);
    } catch (error) {
        console.error("Error reading store.json:", error);
        res.status(500).json({ success: false, message: "Failed to load store items" });
    }
});

// POST: Receive new product from store.html, stringify it, log it, and save to store.json
app.post("/api/store", (req, res) => {
    try {
        const newProduct = req.body;

        // Use JSON.stringify to format the incoming product data for the console
        console.log("================================");
        console.log(" NEW STORE PRODUCT RECEIVED:");
        console.log("================================");
        console.log(JSON.stringify(newProduct, null, 2));
        console.log("================================");

        let currentProducts = [];
        if (fs.existsSync(storeFilePath)) {
            const fileData = fs.readFileSync(storeFilePath, "utf8");
            currentProducts = JSON.parse(fileData);
        }

        // Push new product into array
        currentProducts.push(newProduct);

        // Save entire updated product array to store.json
        fs.writeFileSync(storeFilePath, JSON.stringify(currentProducts, null, 2));

        console.log("Updated store.json successfully.");

        res.status(200).json({ 
            success: true, 
            message: "Product saved successfully", 
            products: currentProducts 
        });

    } catch (error) {
        console.error("Error saving store product:", error);
        res.status(500).json({ success: false, message: "Failed to save product" });
    }
});

// ==========================================

// Mount external API router under /api (if you have other routes like login/signup there)
app.use("/api", require("./router"));

// Default route serving login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

// Start Express server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});