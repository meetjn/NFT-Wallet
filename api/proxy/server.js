// Using Express.js as a proxy server
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());

app.get("/api/klines", async (req, res) => {
  try {
    const response = await axios.get("https://api.binance.com/api/v3/klines", {
      params: req.query,
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Proxy server running on port 5000"));
