const userAgent = require('useragent');
const jsonFile = require('jsonfile');
const moment = require('moment');

// 数据统计
const dataRecord = (req, res, next) => {
  const agent = userAgent.parse(req.headers['user-agent']);
  const os = agent.os;
  const { dataStatistics } = global;
  const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddres || req.socket.remoteAddress || '';

  // 自己调用自己接口的方法就算了
  if (ip === '::ffff:127.0.0.1') {
    next();
  }
  const data = {
    browser: agent.family,
    browserVersion: agent.major,
    browserVersionDetail: `${agent.family} ${agent.major}.${agent.minor}.${agent.patch}`,
    os: os.family,
    osVersion: os.major,
    osVersionDetail: `${os.family} ${os.major}.${os.minor}.${os.patch}`,
    ip: ip,
    path: req.path,
    url: req.url,
    host: req.headers.host,
    time: new Date().getTime(),
  };
  const now = moment();
  const nowYMD = now.format('YYYYMMDD');

  if (!dataStatistics.date[nowYMD]) {
    dataStatistics.date[nowYMD] = [];
  }
  dataStatistics.date[nowYMD].push(data);
  dataStatistics.recordTime = now.format('YYYY-MM-DD HH:mm:ss');

  next();
};

const dataSave = async () => {
  global.dataStatistics.recordTime = moment().format('YYYY-MM-DD HH:mm:ss');
  return jsonFile.writeFile('data/allData.json', global.dataStatistics)
};

module.exports = {
  dataRecord,
  dataSave,
};