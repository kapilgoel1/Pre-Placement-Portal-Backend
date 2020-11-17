const express = require('express');
const Test = require('../models/test');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.post('/add', isAuthenticated, async (req, res) => {
    const test = new Test({
      ...req.body,
      publisher: req.user._id,
    });
    try {
      await test.save();
      res.status(201).json('Data uploaded');
    } catch (e) {
      res.status(400).send();
    }
  });
  
router.get('/retrieve', isAuthenticated, async (req, res) => {
    try {
      const { skip, limit, ...filterOptions } = req.query
      var testList = Test.find({ ...filterOptions })
        .populate({
          path: 'publisher',
          select: 'firstname lastname',
        })
        .sort({ createdAt: 'desc' })
        .skip(parseInt(skip))
        .limit(parseInt(limit));
  
      const numOfTests = Test.find({
        ...filterOptions
      }).countDocuments();  
      
      Promise.all([testList, numOfTests]).then(response => {
        res.status(200).send({testList: response[0], numOfTests: response[1]});
      })
  
    } catch (err) {
      console.log(err)
      res.status(500).send();
    }
  });

  router.delete('/remove/:testid', isAuthenticated, async (req, res) => {
    try {
      const testid = req.params.testid;
      const result = await Test.deleteOne({ _id: testid });
      
      if (result.deletedCount === 1) {      
        res.status(200).json('Deletion successful');
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
    }
    });

  module.exports = router;
