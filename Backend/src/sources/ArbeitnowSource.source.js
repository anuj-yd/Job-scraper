const axios = require("axios");
const IJobSource = require("./IJobSource.source");

class ArbeitnowSource extends IJobSource {
  async fetchListings() {
    try {
      const response = await axios.get("https://arbeitnow.com/api/job-board-api");
      
      const jobs = response.data.data.map(job => {
        return {
          sourceId: String(job.slug),
          source: "arbeitnow",
          title: job.title,
          company: job.company_name,
          location: job.location || "Remote",
          url: job.url,
          postedAt: job.created_at ? new Date(job.created_at * 1000) : new Date()
        };
      });

      return jobs;
    } catch (error) {
      console.error("[ArbeitnowSource] Error fetching jobs:", error.message);
      return [];
    }
  }
}

module.exports = ArbeitnowSource;
