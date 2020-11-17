const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true
    },
    jobprofile: {
      type: String,
    },
    package: {
      type: String,
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const JobPosting = mongoose.model('Job Posting', jobPostingSchema);

module.exports = JobPosting;