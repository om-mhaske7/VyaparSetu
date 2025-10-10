const express = require("express");
const cors = require("cors");

const app = express();

// Configure CORS properly for production
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173", // Vite dev server
    "https://vendor-mitra-five.vercel.app", // Your Vercel domain (removed trailing slash)
    "https://*.vercel.app", // Any Vercel subdomain
    process.env.FRONTEND_URL // Add your specific Vercel URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// Add a root route to prevent 404 on /
app.get("/", (req, res) => {
  res.json({
    message: "VendorMitra API Server is running!",
    status: "healthy",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/prod",
      orders: "/api/orders",
      users: "/api/users",
      admin: "/api/admin"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const routes = require("./routes"); // Assuming this is your index router file
app.use("/api", routes);

module.exports = app;
