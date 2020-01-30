const express = require('express');
const router = express.Router();
const request  = require('../util/request');

router.get('/', async (req, res, next) => {
  const { id, pageNo = 1, pageSize = 20, type = 0, raw, biztype = 1 } = req.query;

  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空',
    });
  }

  const result = await request({
    url: 'http://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg',
    data: {
      biztype,
      topid: id,
      cmd: {
        1: [8, 6], // 歌曲
        2: [8, 9], // 专辑
        3: [8, 9], // 歌单
        4: [8, 9], // 排行榜
        5: [8, 6], // mv
      }[biztype][type],
      pagenum: pageNo - 1,
      pagesize: pageSize,
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: {
        comment: result.comment,
        hotComment: result.hot_comment,
        name: result.topic_name,
      },
    })
  }
});

module.exports = router;
