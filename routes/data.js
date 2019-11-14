const express = require('express');
const router = express.Router();
const request  = require('../util/request');
const jsonFile = require('jsonfile');
const dataSave = require('../util/dataStatistics').dataSave;
const moment = require('moment');

router.get('/', async (req, res) => {
  const now = new Date();
  let { type = 'ip', startTime = now, endTime = now } = req.query;
  const data = {};
  const endStr = moment(endTime).format('YYYYMMDD');

  let time = moment(startTime).format('YYYYMMDD');
  do {
    const list = global.dataStatistics.date[time] || [];
    list.forEach((obj) => {
      const val = obj[type];
      if (!data[val]) {
        data[val] = 1;
      } else {
        data[val] += 1;
      }
    });

    time = moment(time).add(1, 'd').format('YYYYMMDD');
  } while (time <= endStr);

  res.send({
    result: 100,
    data,
    recordTime: global.dataStatistics.recordTime,
  })
});

router.get('/save', (req, res) => {
  dataSave()
    .then(() => {
      res.send({
        result: 100,
        data: '操作成功',
      })
    })
});

module.exports = router;
