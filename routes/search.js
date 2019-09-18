const express = require('express');
const request = require('../util/request');
const router = express.Router();

router.get('/', async (req, res) => {
  const {
    pageNo = 1,
    pageSize = 20,
    key,
    t = 0, // 0: 单曲，8: 专辑
  } = req.query;

  if (!key) {
    return res.send({
      result: 500,
      errMsg: '关键词不能为空',
    });
  }

  const result = await request({
    url: 'http://c.y.qq.com/soso/fcgi-bin/client_search_cp',
    method: 'get',
    data: {
      format: 'json', // 返回json格式
      n: pageSize, // 一页显示多少条信息
      p: pageNo, // 第几页
      w: key, // 搜索关键词
      cr: 1, // 不知道这个参数什么意思，但是加上这个参数你会对搜索结果更满意的
      t,
    }
  });
  res.send(result);
});

module.exports = router;
