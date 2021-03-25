const mongoose = require('mongoose');

const externalResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    link: {
      type: String,
      required: true,
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: '5f9887f1a71e98361c68da85',
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

const externalResource = mongoose.model(
  'External Resource',
  externalResourceSchema
);

module.exports = externalResource;
