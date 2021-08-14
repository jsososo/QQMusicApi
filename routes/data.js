const ipPrivateKey = require('../util/privateKey').ipPrivateKey;

const listHandle = ({func, type, req, res, dataStatistics}) => {
  const {ip, key} = req.query;
  if (key !== ipPrivateKey || !ip) {
    return res.send({
      result: 400,
      data: '你想干嘛？'
    })
  }
  dataStatistics[func](ip, type);
  res.send({
    result: 100,
    data: '就当成功了吧',
  })
};

module.exports = {
  '/': async ({req, res, dataStatistics}) => {
    const now = new Date();
    let {type = 'ip', startTime = now, endTime = now, condition = '{}'} = req.query;
    const data = dataStatistics.getRecord({startTime, endTime, type, condition});

    res.send({
      result: 100,
      data,
    })
  },

  '/addWhiteList': (args) => listHandle({func: 'addList', ...args, type: 'whiteList'}),

  '/addBlackList': (args) => listHandle({func: 'addList', ...args, type: 'blackList'}),

  '/removeWhiteList': (args) => listHandle({func: 'removeList', ...args, type: 'whiteList'}),

  '/removeBlackList': (args) => listHandle({func: 'removeList', ...args, type: 'blackList'}),

  '/whiteList': ({res, dataStatistics}) => {
    res.send({
      result: 100,
      data: dataStatistics.getList('whiteList'),
    })
  },

  '/blackList': ({res, dataStatistics}) => {
    res.send({
      result: 100,
      data: dataStatistics.getList('blackList'),
    })
  },
}
