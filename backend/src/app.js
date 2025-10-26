const express = require("express");
const cors = require("cors");

const app = express();

// Configure CORS properly for production
// Allow explicit localhost dev origins, an exact FRONTEND_URL (set in env on Render),
// and any Vercel-hosted subdomain (e.g. https://vyapaarsetu.vercel.app).
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://vyapaarsetu.vercel.app',
  // process.env.FRONTEND_URL // Add your specific Vercel URL via environment variable
].filter(Boolean);

const vercelOriginRegex = /https:\/\/[\w-]+\.vercel\.app(:\d+)?$/i;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser (server-to-server) requests with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || vercelOriginRegex.test(origin)) {
      return callback(null, true);
    }

    // Not allowed
    return callback(new Error('CORS policy: This origin is not allowed'), false);
  },
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
