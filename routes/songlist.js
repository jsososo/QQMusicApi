const express = require('express');
const router = express.Router();
const request  = require('../util/request');

router.get('/', async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空',
    })
  }
  const result = await request({
    url: 'http://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
    data: {
      type: 1,
      utf8: 1,
      disstid: id, // 歌单的id
      loginUin: 0,
    },
    headers: {
      Referer: 'https://y.qq.com/n/yqq/playlist',
    },
  });
  res.send(result);
});

module.exports = router;
