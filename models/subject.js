const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
  },
  programme: {
    type: String,
  },
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
