const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const DataStatistics = require('./util/dataStatistics');
const jsonFile = require('jsonfile');
const Feedback = require('./util/feedback');

const app = express();
const dataHandle = new DataStatistics();
global.dataStatistics = dataHandle;
global.feedback = new Feedback();

jsonFile.readFile('data/allCookies.json')
  .then((res) => {
    global.allCookies = res;
  }, (err) => {
    global.allCookies = {};
  });

jsonFile.readFile('data/cookie.json')
  .then((res) => {
    global.userCookie = res;
  }, (err) => {
    global.userCookie = {}
  });

// 每5分钟存一下数据
setInterval(() => dataHandle.saveInfo(), 60000 * 5);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => dataHandle.record(req, res, next));

fs.readdirSync(path.join(__dirname, 'routes')).reverse().forEach(file => {
  const filename = file.replace(/\.js$/, '');
  app.use(`/${filename}`, (req, res, next) => {
    global.response = res;
    global.req = req;
    req.query = {
      ...req.query,
      ...req.body,
    };
    const callback = require(`./routes/${filename}`);
    callback(req, res, next);
  });
});

app.use('/', require('./routes/index'));

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
