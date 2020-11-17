const express = require('express');
const Announcement = require('../models/announcement');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.post('/add', isAuthenticated, async (req, res) => {
  const announcement = new Announcement({
    ...req.body,
    publisher: req.user._id,
  });
  try {
    await announcement.save();
    res.status(201).json('Data uploaded');
  } catch (e) {
    res.status(400).send();
  }
});

router.get('/retrieve', isAuthenticated, async (req, res) => {
  try {
    const { skip, limit, ...filterOptions } = req.query
    var announcementList = Announcement.find({ ...filterOptions })
      .populate({
        path: 'publisher',
        select: 'firstname lastname',
      })
      .sort({ createdAt: 'desc' })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const numOfAnnouncements = Announcement.find({
      ...filterOptions
    }).countDocuments();  
    
    Promise.all([announcementList, numOfAnnouncements]).then(response => {
      res.status(200).send({announcementList: response[0], numOfAnnouncements: response[1]});
    })

  } catch (err) {
    console.log(err)
    res.status(500).send();
  }
});

router.get('/details/:id', isAuthenticated, async (req, res) => {
  try {
  const id = req.params.id;
  const announcement = await Announcement.findById(id)
    .populate({
      path: 'publisher',
      select: 'firstname lastname',
    })
  if(announcement !== null)  
  res.status(200).json(announcement);
  else
  res.status(400).json('Not found')
} catch (e) {
  res.status(400).json('Not Found');
}  
})

router.delete('/remove/:announcementid', isAuthenticated, async (req, res) => {
  try {
    const announcementid = req.params.announcementid;
    const result = await Announcement.deleteOne({ _id: announcementid });
    
    if (result.deletedCount === 1) {      
      res.status(200).json('Deletion successful');
    } else {
      res.status(500).json('No such file exists');
    }
  } catch (err) {
    console.log(err)
    res.status(500).send();
  }
  });

module.exports = router;
