const express = require("express");
const RemoteOkSource = require("./sources/RemoteOkSource.source");
const JobRepository = require("./repositories/JobRepository.repository");
const ScraperService = require("./services/ScraperService.service");
const Job = require("./models/Job.model");

const app = express();

app.use(express.json());

const scraper = new ScraperService(new RemoteOkSource(), new JobRepository());

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
