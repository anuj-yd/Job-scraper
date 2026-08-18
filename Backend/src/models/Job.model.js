const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  sourceId: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  title: String,
  company: String,
  location: String,
  url: String,
  postedAt: Date,
  fetchedAt: {
    type: Date,
    default: Date.now
  }
});

jobSchema.index({ sourceId: 1, source: 1 }, { unique: true });

module.exports = mongoose.model("Job", jobSchema);
