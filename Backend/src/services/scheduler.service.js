const cron = require("node-cron");
const logger = require("../utils/logger.util");

function startScheduler(scraperService) {
  console.log("Scheduler started — running every 30 minutes");
  cron.schedule("*/30 * * * *", async () => {
    try {
      logger.info("Scheduled scrape starting...");
      const result = await scraperService.run();
      logger.info(`Scheduled scrape result: ${JSON.stringify(result)}`);
    } catch (err) {
      logger.error(`Scheduled scrape failed: ${err.message}`);
    }
  });
}

module.exports = startScheduler;
