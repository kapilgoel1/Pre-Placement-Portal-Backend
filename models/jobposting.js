const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    salaryrange: {
      type: String,
    },
    role: {
      type: String,
    },
    requirements: {
      type: String,
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const JobPosting = mongoose.model('Job Posting', jobPostingSchema);

module.exports = JobPosting;
