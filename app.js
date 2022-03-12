/**
 * 
 * 
 *  
 **/

var createError  = require('http-errors');
var express      = require('express');
var session      = require('express-session');
var MySQLStore   = require('express-mysql-session')(session);
var cors         = require('cors')
var bodyParser   = require('body-parser');
var mysqlpool    = require('./db');
var path         = require('path');
var cookieParser = require('cookie-parser');
var logger       = require('morgan');

var authRouter    = require('./routes/auth');
var indexRouter   = require('./routes/index');
var usersRouter   = require('./routes/users');
var webhookRouter = require('./routes/webhook');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// Necesario para poder obtener el "raw body" y así pode validar webhooks y otro tipo de peticiones
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}));

app.use(cookieParser());

var sessionStore = new MySQLStore({}, mysqlpool);
app.use(session({
  key: 'user_shop_session',
  secret: "THisIsUseslles?",
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/webhook', cors({
  origin: 'https://pullupinaporsche.com*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}), webhookRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log("--General Error Handler--");
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('react');
});

module.exports = app;
