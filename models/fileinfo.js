const mongoose = require('mongoose');

const submittedAssignmentsSchema = new mongoose.Schema({
  filename: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  firstname: {
    type: String,
    default: '',
  },
  lastname: {
    type: String,
    default: '',
  },
});

const fileInfoSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
    },
    extension: {
      type: String,
    },
    category: {
      type: String,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: '5f9887f1a71e98361c68da85',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    submittedassignments: [submittedAssignmentsSchema],
  },
  {
    timestamps: true,
  }
);

const FileInfo = mongoose.model('File', fileInfoSchema);

module.exports = FileInfo;
