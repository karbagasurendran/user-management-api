var express = require('express');
var config = require('../config');
var Token = require('../models/token');
var router = express.Router();


router.get('/tokens', function(req, res) {
        if(req.headers.password == config.secret) {
            Token.find(function(err, tokens) {
                if(err)
                    res.emit(err)
                res.json(tokens);
            })
        }
        else
            res.sendStatus(401);
    })

module.exports = router;