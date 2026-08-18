const Job = require("../models/Job.model");

const getAlljobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  getAlljobs,
};
