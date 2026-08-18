const express = require("express");
const RemoteOkSource = require("./sources/RemoteOkSource.source");
const JobRepository = require("./repositories/JobRepository.repository");
const ScraperService = require("./services/ScraperService.service");
const Job = require("./models/Job.model");

const app = express();

app.use(express.json());

const scraper = new ScraperService(new RemoteOkSource(), new JobRepository());

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Job Scraper API</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #333; }
          h1 { color: #2563eb; }
          a { color: #3b82f6; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .endpoint { background: #f1f5f9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
          code { background: #e2e8f0; padding: 0.2rem 0.4rem; border-radius: 4px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>🚀 Job Scraper API is running!</h1>
        <p>Welcome to the automated job scraper backend.</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
          <code><a href="/jobs">GET /jobs</a></code>
          <p>Fetches the 50 most recently scraped job listings from the database as a JSON array.</p>
        </div>

        <div class="endpoint">
          <code><a href="/health">GET /health</a></code>
          <p>Basic sanity check to verify the server is alive.</p>
        </div>

        <div class="endpoint">
          <code><a href="/scrape/run">GET /scrape/run</a></code>
          <p>Manually triggers a scraper execution (fetches, validates, and saves jobs).</p>
        </div>
      </body>
    </html>
  `);
});

app.get("/scrape/run", async (req, res) => {
  try {
    const result = await scraper.run();
    if (result.success === false) {
      return res.status(500).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ fetchedAt: -1 }).limit(50);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = { app, scraper };
