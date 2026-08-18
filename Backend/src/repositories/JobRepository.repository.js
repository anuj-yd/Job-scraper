const Job = require("../models/Job.model");

class JobRepository {
  async save(job) {
    // Upserts the job: if sourceId + source match, it updates. Otherwise it inserts.
    return await Job.updateOne(
      { sourceId: job.sourceId, source: job.source },
      { $set: job },
      { upsert: true }
    );
  }

  async saveMany(jobs) {
    if (!jobs || jobs.length === 0) {
      console.log("[JobRepository] No jobs to save.");
      return;
    }

    // Process all saves concurrently, but don't fail the whole batch if one fails
    const results = await Promise.allSettled(
      jobs.map((job) => this.save(job))
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`[JobRepository] saveMany finished: ${succeeded} succeeded, ${failed} failed.`);

    if (failed > 0) {
      results.forEach((r) => {
        if (r.status === "rejected") {
          console.error("[JobRepository] Save failed:", r.reason.message || r.reason);
        }
      });
    }
  }
}

module.exports = JobRepository;
