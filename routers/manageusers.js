const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { isAuthenticated, isAdmin } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.get('/retrieve', isAuthenticated, async (req, res) => {
  const { skip, limit, username, ...filterOptions } = req.query;

  let filterArray = [];

  if (username) {
    const re = new RegExp(username, 'gmi');
    filterArray.push({ firstname: re });
  }
  filterArray.push(filterOptions);

  try {
    const userlist = User.find({
      $and: filterArray,
    })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const numOfUsers = User.find({
      $and: filterArray,
    }).countDocuments();

    Promise.all([userlist, numOfUsers]).then((response) => {
      res.status(200).send({ userlist: response[0], numOfUsers: response[1] });
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/details/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user !== null) res.status(200).json(user);
    else res.status(400).json({ error: 'not found' });
  } catch (e) {
    res.status(400).json({ error: 'not found' });
  }
});

router.post('/updateprofile/:id', isAuthenticated, async (req, res) => {
  const id = req.params.id;
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }
  try {
    await User.updateOne({ _id: id }, { ...req.body });
  } catch (err) {
    res.status(404).send({ error: 'failure' });
  }
  res.status(200).json('Data updated');
});

let upload = multer();

router.post(
  '/bulkregister',
  isAuthenticated,
  isAdmin,
  upload.single('userdata'),
  async (req, res) => {
    const ValidateEmail = (mail) => {
      if (
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
          mail
        )
      ) {
        return true;
      }
      return false;
    };
    try {
      const workbook = XLSX.read(req.file.buffer);
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);
      if (sheet.length === 0) return res.send({ error: 'Empty sheet' });
      for (let i = 0; i < sheet.length; i++) {
        // console.log(sheet[i]);
        if (
          !(
            sheet[i].Email_Id &&
            sheet[i].Password &&
            (sheet[i].Type_Of_User === 'student' ||
              sheet[i].Type_Of_User === 'faculty') &&
            ValidateEmail(sheet[i].Email_Id)
          )
        )
          return res.send({ error: `Incorrect format at row ${i + 1}` });
      }

      sheet.map(async (user) => {
        let pass;
        let obj = {};
        if (user.First_Name) obj.firstname = user.First_Name;
        if (user.Last_Name) obj.lastname = user.Last_Name;
        try {
          pass = await bcrypt.hash(user.Password.toString(), 10);
          User.findOneAndUpdate(
            { email: user.Email_Id },
            {
              email: user.Email_Id,
              password: pass,
              role: user.Type_Of_User,
              ...obj,
            },
            { upsert: true },
            () => {}
          );
        } catch (e) {
          console.log(e);
        }
      });
      res.send({ message: 'success' });
    } catch (e) {
      console.log(e);
    }
  }
);

router.get('/sampleusersfile', function (req, res) {
  // var options = {
  //   root: path.join(__dirname),
  // };

  // var fileName = 'users.xlsx';
  // res.sendFile(fileName, options, function (err) {
  //   if (err) {
  //     next(err);
  //   } else {
  //     console.log('Sent:', fileName);
  //   }
  // });
  res.download(path.join(__dirname, 'users.xlsx'), 'users.xlsx');
});

module.exports = router;
