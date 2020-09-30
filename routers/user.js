const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const bcrypt = require('bcryptjs');
const router = new express.Router();

// Routes
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) throw err;
    if (!user) res.send('No User Exists');
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send('Successfully Authenticated');
        console.log(req.user);
      });
    }
  })(req, res, next);
});

router.post('/register', (req, res, next) => {
  let newUser;
  User.findOne({ email: req.body.email }, async (err, doc) => {
    if (err) throw err;
    if (doc) {
      console.log('adsa');
    }
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;

      newUser = new User({
        ...req.body,
      });
      await newUser.save();
      req.login(newUser, function (err) {
        if (err) {
          return next(err);
        }
        res.status(200).send('successful');
      });
    }
  });
});

router.get('/userdetails', isAuthenticated, (req, res) => {
  res.send(req.user); // The req.user stores the entire user that has been authenticated inside of it.
});

router.get('/logout', (req, res) => {
  req.logout();
  res.send('logged out');
});

router.post('/updateprofile', isAuthenticated, async (req, res) => {
  if (req.body.email || req.body.role || req.body.admin || req.body._id) {
    res.status(500).send('Invalid Operation!');
  }
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.passwordupdated = true;
  }
  try {
    await User.updateOne({ _id: req.user._id }, { ...req.body });
  } catch (err) {
    res.status(404).send(err);
  }
  res.status(200).send('Data updated');
});

module.exports = router;
