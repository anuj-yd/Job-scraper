const express = require("express");
const router = express.Router();
const getjobsMiddleware = require("../middleware/getAlljob.middleware");

// @route   GET /api/jobs
// @desc    Get all jobs from the database
// @access  Public
router.get("/",getjobsMiddleware.getAlljobs);

module.exports = router;
