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

// the below code is a more efficent proxy code to handle errors
// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// const app = express();

// app.use(cors());

// app.get("/api/klines", async (req, res) => {
//   try {
//     const { symbol, interval, limit } = req.query;

//     const response = await axios.get("https://api.binance.com/api/v3/klines", {
//       params: {
//         symbol,
//         interval,
//         limit,
//       },
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching from Binance:", error.message);
//     res.status(error.response?.status || 500).json({
//       error: error.message,
//       details: error.response?.data,
//     });
//   }
// });

// app.listen(5000, () => console.log("Proxy server running on port 5000"));
