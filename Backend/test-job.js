require("dotenv").config();
const connectDB = require("./src/config/db.config");
const JobRepository = require("./src/repositories/JobRepository.repository");

connectDB().then(async () => {
  const repo = new JobRepository();

  // Test 1: single save
  await repo.save({
    sourceId: "repo-test-1",
    source: "manual-test",
    title: "Test Repo Job",
    company: "Test Co",
    url: "https://example.com",
  });
  console.log("Single save done");

  // Test 2: saveMany with one intentionally broken job (missing required field)
  await repo.saveMany([
    { sourceId: "repo-test-2", source: "manual-test", title: "Job A", url: "https://example.com" },
    { sourceId: "repo-test-2", source: "manual-test", title: "Job A UPDATED", url: "https://example.com" }, // same id -> should UPDATE not duplicate
    { sourceId: "repo-test-3", source: "manual-test", title: "Job B", url: "https://example.com" },
  ]);

  process.exit(0);
});