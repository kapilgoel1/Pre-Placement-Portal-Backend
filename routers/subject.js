const express = require('express');
const Subject = require('../models/subject');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.post('/add', isAuthenticated, async (req, res) => {
  const subject = new Subject({ ...req.body });
  try {
    await subject.save();
    res.status(201).json('Data uploaded');
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/retrieve', isAuthenticated, async (req, res) => {
  try {
    var result = await Subject.find({ ...req.query });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
