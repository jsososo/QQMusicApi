const express = require('express');
const router = express.Router();
const request  = require('../util/request');

// 获取歌手介绍
router.get('/desc', async (req, res, next) => {
  const { singermid } = req.query;

  if (!singermid) {
    return res.send({
      result: 500,
      errMsg: 'singermid 不能为空',
    })
  }
  const result = await request({
    url: 'http://c.y.qq.com/splcloud/fcgi-bin/fcg_get_singer_desc.fcg',
    data: {
      singermid,
      format: 'xml',
      utf8: 1,
      outCharset: 'utf-8',
    },
    headers: {
      Referer: 'https://y.qq.com',
    }
  }, {
    dataType: 'xml',
  });

  res.send(result);
});

// 获取歌手专辑
router.get('/album', async (req, res, next) => {
  const { singermid, pageNo = 1, pageSize = 20 } = req.query;

  if (!singermid) {
    return res.send({
      result: 500,
      errMsg: 'singermid 不能为空',
    })
  }

  const result = await request({
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      data: JSON.stringify({
        comm: {
          ct: 24,
          cv: 0
        },
        singerAlbum: {
          method: "get_singer_album",
          param: {
            singermid,
            order: "time",
            begin: (pageNo - 1) * pageSize,
            num: pageSize / 1,
            exstatus: 1
          },
          module: "music.web_singer_info_svr"
        }
      })
    }
  });

  res.send(result);
});

// 相似歌手
router.get('/sim', async (req, res, next) => {
  const { singermid } = req.query;

  if (!singermid) {
    return res.send({
      result: 500,
      errMsg: 'singermid 不能为空',
    })
  }

  const result = await request({
    url: 'http://c.y.qq.com/v8/fcg-bin/fcg_v8_simsinger.fcg',
    data: {
      singer_mid: singermid,
      num: 10,
    }
  });

  res.send(result);
});

module.exports = router;
