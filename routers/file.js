const express = require('express');
const multer = require('multer');
const s3 = require('../cloudstorage/aws');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const FileInfo = require('../models/fileinfo');
const { isAuthenticated, isFaculty } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.get('/retrievelist', isAuthenticated, async (req, res) => {
  try {
    const filelist = await FileInfo.find({
      ...req.query,
    })
      .populate({
        path: 'subject',
        select: 'title',
      })
      .populate({
        path: 'owner',
        select: 'firstname lastname',
      })
      .sort({ createdAt: 'desc' });
    res.status(200).send(filelist);
  } catch (e) {
    res.status(400).send(e);
  }
});

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.post('/add', isAuthenticated, upload.single('multerkey'), function (
  req,
  res,
  next
) {
  const uniqueid = uuidv4();
  const extension = req.file.originalname.split('.').pop();

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: uniqueid,
    Body: req.file.buffer,
  };

  s3.upload(params, async function (err, data) {
    if (err) {
      throw err;
    }
    const file = new FileInfo({
      ...req.query,
      uuid: uniqueid,
      filename: req.file.originalname,
      extension: extension,
      owner: req.user._id,
    });
    try {
      await file.save();
      res.status(201).json('uploaded successfully');
    } catch (e) {
      res.status(400).send(e);
    }
  });
});

router.get('/getdownloadtoken/:fileid', isAuthenticated, (req, res) => {
  var downloadtoken = jwt.sign(
    { fileid: req.params.fileid },
    process.env.JWT_DOWNLOAD_SECRET,
    {
      expiresIn: 200,
    }
  );
  res.json(downloadtoken);
});

router.get('/download/:token', isAuthenticated, async (req, res) => {
  try {
    var { fileid } = jwt.verify(
      req.params.token,
      process.env.JWT_DOWNLOAD_SECRET
    );
    var { filename } = await FileInfo.findOne({ uuid: fileid }).select(
      'filename'
    );
  } catch (e) {
    res.status(400).send(e);
  }

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileid,
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

router.delete('/remove/:fileid', isAuthenticated, async (req, res) => {
  var fileid = req.params.fileid;
  try {
    var result = await FileInfo.deleteOne({ uuid: fileid });
  } catch (err) {
    res.status(500).send(err);
  }
  var params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileid,
  };
  if (result.deletedCount === 1) {
    s3.deleteObject(params, function (err, data) {
      if (data) {
        res.status(200).json('Deletion successful');
      } else {
        res.status(500).send(err);
      }
    });
  } else {
    res.status(500).send();
  }
});

module.exports = router;
