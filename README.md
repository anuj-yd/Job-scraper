<div align="center">
  <h1>🚀 Job Scraper Backend Service</h1>
  <p><strong>A robust, resilient, and extensible service for aggregating job listings.</strong></p>
</div>

---

## 📖 Overview

Welcome to the **Job Scraper Backend**! This project is a Node.js/Express service designed to fetch, validate, and store job listings from various remote platforms (like RemoteOK and Arbeitnow) in a completely automated and reliable way.

---

## ✨ Key Features

- 🔄 **Automated Scheduled Fetching**: Runs continuously in the background using `node-cron`.
- 🛡️ **Data Validation**: Enforces strict payload schemas using `Zod` to maintain database integrity.
- 🚦 **Resilient Fetching**: Implements an **exponential backoff** retry mechanism to gracefully handle rate limits and network drops.
- 📝 **Robust Logging**: Uses `Winston` for structured terminal logging and persistent file logs (`scraper.log`).
- 🧩 **Extensible Architecture**: Built with Dependency Injection. New job sources can be added by simply extending the `IJobSource` interface without touching core orchestration logic.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js & Express** | Server & REST API framework |
| **MongoDB & Mongoose** | Database & ODM for fast, schema-based storage |
| **Zod** | Type-safe schema validation |
| **Winston** | Production-grade logging |
| **Axios** | Promise-based HTTP client for data fetching |

---

## 📡 API Endpoints

### `GET /health`
Sanity check endpoint to verify the server is alive.
```json
{ "status": "ok" }
```

### `GET /jobs`
Fetches the 50 most recently scraped and validated jobs from the database.

### `GET /scrape/run`
Manually triggers a scraper execution. It fetches listings with exponential backoff, validates them, saves them to MongoDB, and returns a summary:
```json
{ "success": true, "count": 124 }
```

---

## 📚 Deep Dives

Want to know more about how this system was designed? Check out the architectural documents:
- 🏗️ [**Design Document**](DESIGN.md) - Details on ingestion strategy, anti-bot mitigation, and resilience.
- ⚖️ [**Decisions & Trade-offs**](DECISIONS.md) - Explains why the interface pattern was chosen and the trade-offs made.

---

## 🌐 Live Demo

The API is deployed and running live on Render. There's no UI at the root path — hit these endpoints directly:
- **Health check:** https://job-scraper-66rz.onrender.com/health
- **Recent jobs:** https://job-scraper-66rz.onrender.com/jobs
- **Trigger a scrape:** https://job-scraper-66rz.onrender.com/scrape/run

> Note: the free Render tier sleeps after periods of inactivity, so the first request after a while may take 30–60 seconds to wake the server up.

---

## 🚀 Getting Started (Local Setup)

The repository is configured for easy setup. The actual server code lives inside the `Backend` folder.

1. Clone the repository.
2. Run `npm install` in the root folder (it will automatically install backend dependencies too).
3. Create a `.env` file inside the `Backend` directory with: