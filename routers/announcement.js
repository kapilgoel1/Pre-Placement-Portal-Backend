const express = require('express');
const Announcement = require('../models/announcement');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.post('/announcement', isAuthenticated, async (req, res) => {
  const announcement = new Announcement({
    ...req.body,
    publisher: req.user._id,
  });
  try {
    await announcement.save();
    res.status(201).send('Data uploaded');
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/announcement', isAuthenticated, async (req, res) => {
  try {
    var result = await Announcement.find({ ...req.query })
      .populate({
        path: 'publisher',
        select: 'firstname lastname',
      })
      .sort({ createdAt: 'desc' });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
