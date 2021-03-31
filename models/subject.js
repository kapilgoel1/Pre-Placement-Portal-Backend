const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
