require("dotenv").config();
const { app, scraper } = require("./app");
const connectDB = require("./config/db.config");
const startScheduler = require("./services/scheduler.service");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startScheduler(scraper);
  });
}).catch((err) => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});
