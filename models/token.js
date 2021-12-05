var mongoose = require('mongoose');

var tokenSchema = new mongoose.Schema({

    token: String,
    issuedAt: String,
    requestOriginIP: String,
    validity: String

});

var Token = mongoose.model('Token', tokenSchema);
module.exports = Token;