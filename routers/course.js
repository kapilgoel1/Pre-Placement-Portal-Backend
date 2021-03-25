const express = require('express');
const Course = require('../models/course');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.post('/add', isAuthenticated, async (req, res) => {
  const course = new Course({ ...req.body });
  try {
    await course.save();
    res.status(201).json('Data uploaded');
  } catch (e) {
    res.status(400).send({ error: 'failure' });
  }
});

router.get('/retrieve', async (req, res) => {
  try {
    var result = await Course.find({ ...req.query });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ error: 'failure' });
  }
});

module.exports = router;
