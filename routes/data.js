const express = require('express');
const router = express.Router();
const ipPrivateKey = require('../util/privateKey').ipPrivateKey;

router.get('/', async (req, res) => {
  const now = new Date();
  let { type = 'ip', startTime = now, endTime = now, condition = '{}' } = req.query;
  const data = global.dataStatistics.getRecord({ startTime, endTime, type, condition });

  res.send({
    result: 100,
    data,
  })
});

const listHandle = ({ func, type, req, res }) => {
  const { dataStatistics: dataHandle } = global;
  const { ip, key } = req.query;
  if (key !== ipPrivateKey || !ip) {
    return res.send({
      result: 400,
      data: '你想干嘛？'
    })
  }
  dataHandle[func](ip, type);
  res.send({
    result: 100,
    data: '就当成功了吧',
  })
};

router.get('/addWhiteList', (req, res) => listHandle({ func: 'addList', req, res, type: 'whiteList'}));
router.get('/addBlackList', (req, res) => listHandle({ func: 'addList', req, res, type: 'blackList'}));
router.get('/removeWhiteList', (req, res) => listHandle({ func: 'removeList', req, res, type: 'whiteList'}));
router.get('/removeBlackList', (req, res) => listHandle({ func: 'removeList', req, res, type: 'blackList'}));
router.get('/whiteList', (req, res) => {
  res.send({
    result: 100,
    data: global.dataStatistics.getList('whiteList'),
  })
});
router.get('/blackList', (req, res) => {
  res.send({
    result: 100,
    data: global.dataStatistics.getList('blackList'),
  })
});

module.exports = router;
