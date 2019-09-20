const express = require('express');
const router = express.Router();
const request  = require('../util/request');

router.get('/', async (req, res, next) => {

  const { id, raw } = req.query;

  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空',
    })
  }

  const result = await request({
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      data: JSON.stringify({
        getMvUrl: {
          module: "gosrf.Stream.MvUrlProxy",
          method: "GetMvUrls",
          param: {
            vids: id.split(','),
            request_typet: 10001
          }
        }
      }),
    }
  });

  if (Number(raw)) {
    return res.send(result);
  }

  const mvData = result.getMvUrl.data;
  Object.keys(mvData).forEach((vid) => {
    const mp4Arr = [];
    (mvData[vid].mp4 || []).forEach((obj) => {
      if (obj.freeflow_url && obj.freeflow_url.length > 0)
        mp4Arr.push(obj.freeflow_url[obj.freeflow_url.length - 1]);
    });
    mvData[vid] = mp4Arr;
  });

  res.send({
    result: 100,
    data: mvData,
  })
});

module.exports = router;
