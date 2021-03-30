const express = require('express');
const multer = require('multer');
const s3 = require('../cloudstorage/aws');
var multerS3 = require('multer-s3');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const FileInfo = require('../models/fileinfo');
const { isAuthenticated, isFaculty } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.get('/retrievelist', isAuthenticated, async (req, res) => {
  const { skip, limit, filename, myfiles, ...filterOptions } = req.query;
  if (myfiles) {
    filterOptions.owner = req.user._id;
  }
  let filterArray = [];

  if (filename) {
    const re = new RegExp(filename, 'gmi');
    filterArray.push({ filename: re });
  }
  filterArray.push(filterOptions);

  try {
    const filelist = FileInfo.find({
      $and: filterArray,
    })
      .populate({
        path: 'subject',
        select: 'title',
      })
      .populate({
        path: 'owner',
        select: 'firstname lastname',
      })
      .sort({ createdAt: 'desc' })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const numOfFiles = FileInfo.find({
      $and: filterArray,
    }).countDocuments();

    Promise.all([filelist, numOfFiles]).then((response) => {
      const modifiedfilelist = response[0].map((file) => {
        const fileObj = file.toObject();
        return {
          ...fileObj,
          submittedassignments: fileObj.submittedassignments.length,
        };
      });
      res
        .status(200)
        .send({ filelist: modifiedfilelist, numOfFiles: response[1] });
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/filedetails/:fileid', isAuthenticated, async (req, res) => {
  var fileid = req.params.fileid;
  try {
    const file = await FileInfo.findById(fileid)
      .populate({
        path: 'subject',
        select: 'title',
      })
      .populate({
        path: 'owner',
        select: 'firstname lastname',
      });
    if (file !== null) res.status(200).json(file);
    else res.status(400).json('Not Found');
  } catch (e) {
    res.status(400).json('Not Found');
  }
});

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      file.uniqueid = uuidv4();
      cb(null, 'files/' + file.uniqueid);
    },
  }),
  limits: { fileSize: 20971520 },
});

router.post(
  '/add',
  isAuthenticated,
  upload.array('multerkey', 2),
  async function (req, res) {
    let filesArr = req.files.map((file) => {
      return {
        ...req.query,
        uuid: file.uniqueid,
        filename: file.originalname,
        extension: file.originalname.split('.').pop(),
        size: file.size,
        owner: req.user._id,
      };
    });

    try {
      await FileInfo.insertMany(filesArr);
      res.status(201).json('uploaded successfully');
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  }
);

router.get('/download/:fileid', isAuthenticated, async (req, res) => {
  var fileid = req.params.fileid;

  try {
    var { filename, uuid } = await FileInfo.findOne({ _id: fileid }).select(
      'filename uuid'
    );
  } catch (e) {
    console.log(e);
    // res.status(400).send(e);
  }

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: 'files/' + uuid,
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

router.delete('/remove/:uuid', isAuthenticated, async (req, res) => {
  var uuid = req.params.uuid;
  try {
    var result = await FileInfo.deleteOne({ uuid: uuid });
  } catch (err) {
    res.status(500).send(err);
  }
  var params = {
    Bucket: process.env.BUCKET_NAME,
    Key: 'files/' + uuid,
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

const uploadassignmentS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      file.uniqueid = Date.now().toString() + '-' + file.originalname;
      cb(null, 'submittedassignments/' + file.uniqueid);
    },
  }),
  limits: { fileSize: 20971520 },
});

router.post(
  '/submitassignment/:id',
  isAuthenticated,
  uploadassignmentS3.single('file'),
  async (req, res) => {
    // console.log(req.file);
    if (req.file) {
      const filename = req.file.uniqueid;

      const assign = await FileInfo.findById(req.params.id);
      assign.submittedassignments.push({
        filename,
        email: req.user.email,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
      });

      try {
        await assign.save();
        res.status(201).json('Data uploaded');
      } catch (e) {
        console.log(e);
        res.status(400).json({ error: 'failure' });
      }
    } else res.status(400).json({ error: 'failure' });
  }
);

router.get('/submittedassignment', isAuthenticated, async (req, res) => {
  const filename = req.query.filename;
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: 'submittedassignments/' + filename,
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

router.get('/test', isAuthenticated, (req, res) => {
  res.json('hello');
});

module.exports = router;
