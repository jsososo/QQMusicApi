const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const DataStatistics = require('./util/dataStatistics');
const jsonFile = require('jsonfile');
const Feedback = require('./util/feedback');
const Cache = require('./util/cache');
const config = require('./bin/config');

const app = express();
const dataHandle = new DataStatistics();
global.dataStatistics = dataHandle;
global.feedback = new Feedback();
global.cache = new Cache();

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

// 每10分钟存一下数据
config.useDataStatistics && setInterval(() => dataHandle.saveInfo(), 60000 * 10);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

config.useDataStatistics && app.use((req, res, next) => dataHandle.record(req, res, next));

const corsMap = {
  '/user/setCookie': true,
}
fs.readdirSync(path.join(__dirname, 'routes')).forEach(file => {
  const filename = file.replace(/\.js$/, '');
  const RouterMap = require(`./routes/${filename}`);
  Object.keys(RouterMap).forEach((path) => {
    app.use(`/${filename}${path}`, (req, res, next) => {
      const router = express.Router();
      global.response = res;
      global.req = req;
      req.query = {
        ...req.query,
        ...req.body,
        ownCookie: 1,
      };
      // qq 登录
      let uin = (req.cookies.uin || '');
      // login_type 2 微信登录
      if (Number(req.cookies.login_type) === 2) {
        uin = req.cookies.wxuin;
      }
      req.cookies.uin = uin.replace(/\D/g, '');
      const func = RouterMap[path];

      router.post('/', (req, res, next) => func(req, res, next));
      router.get('/', (req, res, next) => func(req, res, next));
      if (corsMap[`/${filename}${path}`]) {
        router.options('/', (req, res) => {
          res.set('Access-Control-Allow-Origin', 'https://y.qq.com');
          res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
          res.set('Access-Control-Allow-Headers', 'Content-Type');
          res.set('Access-Control-Allow-Credentials','true');
          res.sendStatus(200);
        })
      }
      router(req, res, next);
    })
  });
});

app.use('/', (req, res, next) => {
  const router = express.Router();
  router.get('/', (req, res) => require('./routes/index')['/'](req, res))
  router(req, res, next);
});

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
