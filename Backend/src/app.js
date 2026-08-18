const express = require("express");
const app = express();
const jobRoutes = require("./routes/jobs.routes");
const logger = require("./middleware/logger.middleware");
const errorHandler = require("./middleware/errorHandler.middleware");

// Init Middleware
app.use(express.json());
app.use(logger);

// Define Routes
app.use("/api/jobs", jobRoutes);

// A simple root route for testing
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error Handler Middleware (must be after all routes)
app.use(errorHandler);

module.exports = app;
