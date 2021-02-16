const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  fromYear: {
    type: String,
    default: '',
  },
  toYear: {
    type: String,
    default: '',
  },
  qualification: {
    type: String,
    default: '',
  },
  institute: {
    type: String,
    default: '',
  },
});

const workExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: '',
  },
  fromYear: {
    type: String,
    default: '',
  },
  toYear: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  responsibility1: {
    type: String,
    default: '',
  },
  responsibility2: {
    type: String,
    default: '',
  },
  responsibility3: {
    type: String,
    default: '',
  },
  responsibility4: {
    type: String,
    default: '',
  },
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  technologiesUsed: {
    type: String,
    default: '',
  },
});

const resumeSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
    uppercase: true,
  },
  address: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  careerObjective: {
    type: String,
    default: '',
  },
  skills: [String],
  education: [educationSchema],
  workExperience: [workExperienceSchema],
  achievements: [String],
  projects: [projectSchema],
  dob: {
    type: String,
  },
  languagesKnown: {
    type: String,
    default: '',
  },
  hobbies: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const resume = mongoose.model('Resume', resumeSchema);

module.exports = resume;
