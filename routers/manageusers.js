const express = require('express');
const User = require('../models/user');
const { isAuthenticated } = require('../middleware/checkauthlevel');
const router = new express.Router();

router.get('/retrieve', isAuthenticated, async (req, res) => {
    const { skip, limit, username,  ...filterOptions } = req.query
  
    let filterArray = [];
    
    if(username) {
    const re = new RegExp(username, 'gmi');
    filterArray.push({firstname: re });
    }
    filterArray.push(filterOptions);
  
    try {
      const userlist = User.find({
        $and: filterArray
      })
        .skip(parseInt(skip))
        .limit(parseInt(limit));
  
        const numOfUsers = User.find({
          $and: filterArray
        }).countDocuments();
  
        Promise.all([userlist, numOfUsers]).then(response => {
          res.status(200).send({userlist: response[0], numOfUsers: response[1]});
        })
  
      
    } catch (e) {
      res.status(400).send(e);
    }
  });

  router.get('/details/:id', isAuthenticated, async (req, res) => {
    try {
    const id = req.params.id;
    const user = await User.findById(id)
    if(user !== null)  
    res.status(200).json(user);
    else
    res.status(400).json('Not found')
  } catch (e) {
    res.status(400).json('Not Found');
  }  
  })

module.exports = router;
