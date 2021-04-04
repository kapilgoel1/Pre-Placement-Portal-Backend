const express = require('express');
const Internship = require('../models/internship');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.post('/add', isAuthenticated, async (req, res) => {
  const internship = new Internship({
    ...req.body,
    publisher: req.user._id,
  });
  try {
    await internship.save();
    res.status(201).json('Data uploaded');
  } catch (e) {
    res.status(400).send();
  }
});

router.get('/retrieve', isAuthenticated, async (req, res) => {
  try {
    const { skip, limit, ...filterOptions } = req.query;
    var internships = Internship.find({ ...filterOptions })
      .populate({
        path: 'publisher',
        select: 'firstname lastname',
      })
      .sort({ createdAt: 'desc' })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const numOfPostings = Internship.find({
      ...filterOptions,
    }).countDocuments();

    Promise.all([internships, numOfPostings]).then((response) => {
      const modifiedInternships = response[0].map((internship) => {
        internship = internship.toObject();
        let appliedbyuser = false;
        if (internship.applicants.includes(req.user._id)) appliedbyuser = true;
        return {
          ...internship,
          applicants: internship.applicants.length,
          appliedbyuser,
        };
      });
      res
        .status(200)
        .send({ postings: modifiedInternships, numOfPostings: response[1] });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/retrieveoptimised', isAuthenticated, async (req, res) => {
  try {
    const { skip, limit, ...filterOptions } = req.query;
    var internships = Internship.find({ ...filterOptions }).sort({
      createdAt: 'desc',
    });

    Promise.all([internships]).then((response) => {
      const modifiedInternships = response[0].map((internship) => {
        internship = internship.toObject();
        let appliedbyuser = false;
        if (internship.applicants.includes(req.user._id)) appliedbyuser = true;
        return {
          ...internship,
          applicants: internship.applicants.length,
          appliedbyuser,
        };
      });
      res.status(200).send({ postings: modifiedInternships });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/details/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    // const Internship = await Internship.findById(id).populate({
    //   path: 'publisher',
    //   select: 'firstname lastname',
    // });
    const internship = await Internship.findById(id).populate('applicants');
    if (internship !== null) res.status(200).json(internship);
    else res.status(400).json('Not found');
  } catch (e) {
    console.log(e);
    res.status(400).json('Not Found');
  }
});

router.post('/apply/:id', isAuthenticated, async (req, res) => {
  const id = req.params.id;
  try {
    const internship = await Internship.findById(id);
    if (internship.applicants.includes(req.user._id))
      res.send({
        message: 'Your internship application has already been submitted!',
      });
    else {
      internship.applicants.push(req.user._id);
      await internship.save();
      res.send({
        message:
          'Your application for the internship has been successfully submitted!',
      });
    }
  } catch (err) {
    res.status(400).send({ error: 'failure' });
  }
});

router.get('/checkresumepresence', isAuthenticated, async (req, res) => {
  if (req.user.hasresume === false) res.send({ hasresume: false });
  else res.send({ hasresume: true });
});

router.delete('/remove/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Internship.deleteOne({ _id: id });

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
