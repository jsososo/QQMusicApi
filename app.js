const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const dataRecord = require('./util/dataStatistics').dataRecord;
const dataSave = require('./util/dataStatistics').dataSave;
const jsonFile = require('jsonfile');
const moment = require('moment');

const app = express();

jsonFile.readFile('data/allData.json')
  .then((res) => {
    global.dataStatistics = res;
  }, (err) => {
    if (err.code === 'ENOENT') {
      global.dataStatistics = { date: {}, recordTime: moment().format('YYYY-MM-DD HH:mm:ss') };
      jsonFile.writeFile('data/allData.json', {});
    }
  });

// 每三小时存一下数据
setInterval(dataSave, 3600000 * 3);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(dataRecord);

fs.readdirSync(path.join(__dirname, 'routes')).reverse().forEach(file => {
  const filename = file.replace(/\.js$/, '');
  app.use(`/${filename}`, (req, res, next) => {
    global.cookies = req.cookies;
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
