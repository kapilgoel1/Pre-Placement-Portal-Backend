const express = require('express');
const Announcement = require('../models/subject');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.post('/subject', isAuthenticated, async (req, res) => {
  const subject = new Subject({ ...req.body });
  try {
    await subject.save();
    res.status(201).send('Data uploaded');
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/subject', isAuthenticated, async (req, res) => {
  try {
    var result = await Subject.find({ ...req.query });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
