var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    userId: Number,
    userName: String,
    password: String,
    emailId: String,
    mobileNumber: Number,
    image: String,
});

var Users = mongoose.model('Users', userSchema);
module.exports = Users;