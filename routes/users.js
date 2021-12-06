var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var Token = require('../models/token');
var jwt = require('jsonwebtoken');
var jwtOne = require('express-jwt');
const saltRounds = 14;
var JWTconfig = require('../JWTconfig');
var bcrypt = require('bcryptjs');
const multer = require("multer");
const fs = require("fs");
var sheetdb = require('sheetdb-node');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('noSecret');

// create a config file
var config = {
  address: 'aq1yokl2u49so',
};

// Create new client
var client = sheetdb(config);


/* Whole Data Controller*/

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  }
});
 
var upload = multer({ storage: storage }).single('file');

router.post('/profile', (req, res) => {
  upload(req, res, err => {
    if(err) {
      return res.json({ err })
    }
    var fullUrl = req.protocol + '://' + req.get('host')+ '/' + req.file.path;
    return res.json(fullUrl);
  })
});


// register
router.post('/register', function (req, res) {
  var body = req.body
  console.log(body);
  const encryptedString = cryptr.encrypt(body.password);
    body.password = encryptedString;
    Users.create(body, function (err, users) {
      if (err) {
        res.emit(err)
      }
      client.create(users).then(function(data) {
        console.log(data);
      }, function(err){
        console.log(err);
      });
      console.log(users);
      res.json(users)
    })
})


router.get('/user-list', function(req, res){
  Users.find({
        active: {
            $in: true
        }
    }, function (err, user) {
        if (err) {
            res.emit(err)   
        }
        res.json(user)
    })
})

router.post('/update-user/:id', function (req, res) {
  // Update all columns where 'name' is 'Smith' to have 'score' = 99 and 'comment' = 'Griffin'
client.update(
  '_id', // column name
  req.params.id, // value to search for
  req.body // object with updates
).then(function(data) {
  console.log(data);
}, function(err){
  console.log(err);
});

  Users.findByIdAndUpdate(req.params.id, req.body, function (err, employee) {
      if (err) {
          res.emit(err)
      }
      res.json(employee)
  })
})

router.get('/delete-user/:id', function (req, res) {
  // Delete all rows where 'name' equals 'Smith'
  console.log(req.params.id);
client.delete(
  '_id', // column name
  req.params.id // value to search for
).then(function(data) {
  console.log(data);
}, function(err){
  console.log(err);
});

 Users.findByIdAndDelete(req.params.id, function (err) {
      console.log(req.params.id)
      if (err) {
          res.emit(err)
      }
      res.json({result: "Delete successfully"})
  })
})
/* login */
router.post('/login', function (req, res, next) {
  var userName = req.body.userName;
  var password = req.body.password;
  console.log(userName, password)
  var ip = req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  Users.findOne({
    "userName": userName
  }, function (err, post) {
    if (err)
      res.send(err);
    if (post != null) {
      const decryptedString = cryptr.decrypt(post.password);
        console.log(post.password);
        if (decryptedString == password) {
          var payload = {
            id: post._id,
          };
          var token = jwt.sign(payload, JWTconfig.secret);
          var d = new Date();
          Token.create({
            token: token,
            issuedAt: d.toLocaleString(),
            requestOriginIP: ip,
            validity: "Valid"
          });
          res.json({
            message: "ok",
            token: token,
            _id: post.id,
            user : post.userName
          });
        } else {
          res.json({
            message: "passwords did not match"
          });
        }
    } else {
      res.json({
        message: 'Incorrect Username'
      });
    }

  });

})

module.exports = router;
