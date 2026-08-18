const validateJob = require("../utils/jobValidator.util");
const retryWithBackoff = require("../utils/retry.util");
const logger = require("../utils/logger.util");

class ScraperService {
  constructor(source, repository) {
    this.source = source;
    this.repository = repository;
  }

  async run() {
    try {
      const rawJobs = await retryWithBackoff(() => this.source.fetchListings(), 3, 1000);

      if (!rawJobs || rawJobs.length === 0) {
        logger.warn("Empty response from source — skipping this run");
        return { success: false, count: 0 };
      }

      const validJobs = rawJobs.map(validateJob).filter((job) => job !== null);

      logger.info(`${validJobs.length}/${rawJobs.length} jobs passed validation`);

      await this.repository.saveMany(validJobs);

      return { success: true, count: validJobs.length };
    } catch (err) {
      logger.error(err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = ScraperService;
