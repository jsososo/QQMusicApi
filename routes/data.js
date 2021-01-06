const ipPrivateKey = require('../util/privateKey').ipPrivateKey;

const listHandle = ({func, type, req, res}) => {
  const {dataStatistics: dataHandle} = global;
  const {ip, key} = req.query;
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

module.exports = {
  '/': async (req, res) => {
    const now = new Date();
    let {type = 'ip', startTime = now, endTime = now, condition = '{}'} = req.query;
    const data = global.dataStatistics.getRecord({startTime, endTime, type, condition});

    res.send({
      result: 100,
      data,
    })
  },

  '/addWhiteList': (req, res) => listHandle({func: 'addList', req, res, type: 'whiteList'}),

  '/addBlackList': (req, res) => listHandle({func: 'addList', req, res, type: 'blackList'}),

  '/removeWhiteList': (req, res) => listHandle({func: 'removeList', req, res, type: 'whiteList'}),

  '/removeBlackList': (req, res) => listHandle({func: 'removeList', req, res, type: 'blackList'}),

  '/whiteList': (req, res) => {
    res.send({
      result: 100,
      data: global.dataStatistics.getList('whiteList'),
    })
  },

  '/blackList': (req, res) => {
    res.send({
      result: 100,
      data: global.dataStatistics.getList('blackList'),
    })
  },
}
