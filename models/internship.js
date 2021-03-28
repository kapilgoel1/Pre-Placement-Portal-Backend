const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
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
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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

const Internship = mongoose.model('Internship', internshipSchema);

module.exports = Internship;
