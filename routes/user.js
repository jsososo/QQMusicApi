const express = require('express');
const router = express.Router();
const request  = require('../util/request');

router.get('/', (req, res, next) => {
  res.send(req.cookies);
});

// 获取用户歌单
router.get('/detail', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空',
    })
  }
  const result = await request({
    url: 'http://c.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg',
    data: {
      cid: 205360838, // 管他什么写死就好了
      userid: id, // qq号
      reqfrom: 1,
    }
  });

  if (result.code === 1000) {
    return res.send({
      result: 301,
      errMsg: '未登陆',
      info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
    })
  }

  res.send(result);
});

module.exports = router;
