const express = require('express');
const Announcement = require('../models/announcement');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const s3 = require('../cloudstorage/aws');
var multers3 = require('multer-s3');
const router = new express.Router();

const uploadS3 = multer({
  storage: multers3({
    s3: s3,
    bucket: 'portal1919',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      file.uniqueid = Date.now().toString() + '-' + file.originalname;
      cb(null, 'announcement/' + file.uniqueid);
    },
  }),
});

router.post(
  '/upload',
  isAuthenticated,
  uploadS3.single('file'),
  async (req, res) => {
    // console.log(req.file);
    let filename = '';
    if (req.file) filename = req.file.uniqueid;
    const announcement = new Announcement({
      title: req.query.title,
      content: req.query.content,
      publisher: req.user._id,
      filename: filename,
    });
    try {
      await announcement.save();
      res.status(201).json('Data uploaded');
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: 'failure' });
    }
  }
);

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
    const { skip, limit, ...filterOptions } = req.query;
    var announcementList = Announcement.find({ ...filterOptions })
      .populate({
        path: 'publisher',
        select: 'firstname lastname',
      })
      .sort({ createdAt: 'desc' })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const numOfAnnouncements = Announcement.find({
      ...filterOptions,
    }).countDocuments();

    Promise.all([announcementList, numOfAnnouncements]).then((response) => {
      res.status(200).send({
        announcementList: response[0],
        numOfAnnouncements: response[1],
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/details/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const announcement = await Announcement.findById(id).populate({
      path: 'publisher',
      select: 'firstname lastname',
    });
    if (announcement !== null) res.status(200).json(announcement);
    else res.status(400).json('Not found');
  } catch (e) {
    res.status(400).json('Not Found');
  }
});

router.get('/attachment', isAuthenticated, async (req, res) => {
  const filename = req.query.filename;
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: 'announcement/' + filename,
  };
  s3.getObject(params, function (err, data) {
    if (err === null) {
      res.attachment(filename);
      res.send(data.Body);
    } else {
      res.status(500).send(err);
    }
  });
});

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
    console.log(err);
    res.status(500).send();
  }
});

module.exports = router;
