const express = require('express');
const ExternalResource = require('../models/externalresource');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.post('/add', isAuthenticated, async (req, res) => {
    const resource = new ExternalResource({
      ...req.body,
      publisher: req.user._id,
    });
    try {
      await resource.save();
      res.status(201).json('Data uploaded');
    } catch (e) {
      res.status(400).send();
    }
  });
  
router.get('/retrieve', isAuthenticated, async (req, res) => {
    try {
      const { skip, limit, ...filterOptions } = req.query
      var resourceList = ExternalResource.find({ ...filterOptions })
        .populate({
          path: 'publisher',
          select: 'firstname lastname',
        })
        .sort({ createdAt: 'desc' })
        .skip(parseInt(skip))
        .limit(parseInt(limit));
  
      const numOfResources = ExternalResource.find({
        ...filterOptions
      }).countDocuments();  
      
      Promise.all([resourceList, numOfResources]).then(response => {
        res.status(200).send({resourceList: response[0], numOfResources: response[1]});
      })
  
    } catch (err) {
      console.log(err)
      res.status(500).send();
    }
  });

  router.delete('/remove/:id', isAuthenticated, async (req, res) => {
    try {
      const id = req.params.id;
      const result = await Test.deleteOne({ _id: id });
      
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
