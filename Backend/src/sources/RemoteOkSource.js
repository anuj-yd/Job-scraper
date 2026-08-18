const axios = require('axios');
const IJobSource = require('./IJobSource');

class RemoteOkSource extends IJobSource {
  async fetchListings() {
    try {
      const response = await axios.get('https://remoteok.com/api', {
        headers: {
          'User-Agent': 'job-scraper-demo/1.0'
        }
      });

      const data = response.data;
      if (!Array.isArray(data) || data.length <= 1) {
        return [];
      }

      // Skip the first element which is metadata
      const jobsData = data.slice(1);

      return jobsData.map((job) => ({
        sourceId: String(job.id),
        source: 'remoteok',
        title: job.position,
        company: job.company,
        location: job.location || 'Remote',
        url: job.url,
        postedAt: job.date ? new Date(job.date) : new Date()
      }));
    } catch (error) {
      console.error('Error fetching jobs from RemoteOk:', error.message);
      return [];
    }
  }
}

module.exports = RemoteOkSource;
