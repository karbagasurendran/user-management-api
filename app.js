var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var Config = require('./JWTconfig');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};
var app = express();

// DB setup
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGODB_URI || Config.mongodb_Url, { promiseLibrary: require('bluebird') })
  .then(() => console.log("Connection Successfull"))
  .catch((err) => console.log(err));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(allowCrossDomain);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/public',express.static(path.join(__dirname, '/public')));
app.use(jwt({ secret: Config.secret, algorithms: ['HS256'] })
  .unless({
    path: [
      '/','/public/*','/api/users/register','/api/users/profile','/api/users/login','/tokens','/api/users/delete-user/:id', /^\/users\/.*/,
    ]
  }));

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use('/', indexRouter);
app.use('/api/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
