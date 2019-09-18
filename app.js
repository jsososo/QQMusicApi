const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

fs.readdirSync(path.join(__dirname, 'routes')).reverse().forEach(file => {
  const filename = file.replace(/\.js$/, '')
  app.use(`/${filename}`, (req, res, next) => {
    `ts_uid=7230012975; tvfe_boss_uuid=3fe8afd0640fa5b0; uin=956581739; userAction=1; qqmusic_fromtag=66; yq_index=0; yqq_stat=0; player_exist=1; pgv_info=ssid=s2313432492; pgv_pvid=2796982635; ptisp=ctc; RK=tHhAJrF5O0; ptcz=392dde7db8d973728b39edc013f69ba627abe2ac759c1e667d91520ca58545c7; psrf_musickey_createtime=1568721243; psrf_qqopenid=239ACC14853AA1038A3A539429D0AC48; psrf_qqaccess_token=6B0C62126368CA1ACE16C932C679747D; psrf_access_token_expiresAt=1576497243; psrf_qqrefresh_token=25BACF1650EE2592D06BCC19EEAD7AD6; psrf_qqunionid=B727DBE86225939A050C84A13D0A3A05; qm_keyst=Q_H_L_2iLo0s50eO0Pm7Y8MFgODU_69pKGY4dhgCtI2RbS1EGUXo4iMQkLC9fROfI2tGC; yplayer_open=0; ts_last=y.qq.com/; ts_refer=music.qq.com/`
      .split(' ').forEach((k) => {
        res.append('Set-Cookie', k);
    });
    global.cookies = req.cookies;
    // res.append('Set-Cookie', 'ts_uid=7230012975;tvfe_boss_uuid=3fe8afd0640fa5b0; uin=956581739; userAction=1; qqmusic_fromtag=66; yq_index=0; yqq_stat=0; player_exist=1; pgv_info=ssid=s2313432492; pgv_pvid=2796982635; ptisp=ctc; RK=tHhAJrF5O0; ptcz=392dde7db8d973728b39edc013f69ba627abe2ac759c1e667d91520ca58545c7; psrf_musickey_createtime=1568721243; psrf_qqopenid=239ACC14853AA1038A3A539429D0AC48; psrf_qqaccess_token=6B0C62126368CA1ACE16C932C679747D; psrf_access_token_expiresAt=1576497243; psrf_qqrefresh_token=25BACF1650EE2592D06BCC19EEAD7AD6; psrf_qqunionid=B727DBE86225939A050C84A13D0A3A05; qm_keyst=Q_H_L_2iLo0s50eO0Pm7Y8MFgODU_69pKGY4dhgCtI2RbS1EGUXo4iMQkLC9fROfI2tGC; yplayer_open=0; ts_last=y.qq.com/; ts_refer=music.qq.com/');
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
