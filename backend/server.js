const express = require("express");
const cors = require("cors");
app.use(cors());
const connectDB = require("./config/db");
const videoRoutes = require("./routes/videoRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB()
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1); // Exit process if DB connection fails
  });

// API Routes
app.use("/api", videoRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
