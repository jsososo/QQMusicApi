const express = require('express');
const router = express.Router();
const request  = require('../util/request');

router.get('/', async (req, res, next) => {
  const url = "http://u.y.qq.com/cgi-bin/musicu.fcg";
  const { songmid, raw } = req.query;

  if (!songmid) {
    return res.send({
      result: 500,
      errMsg: 'songmid 不能为空',
    })
  }
  const data = {
    data: JSON.stringify({
      songinfo: {
        method: "get_song_detail_yqq",
        module: "music.pf_song_detail_svr",
        param: {
          song_mid: songmid,
        }
      }
    }),
  };

  const result = await request({ url, data });

  if (Number(raw)) {
    return res.send(result);
  }

  res.send({
    result: 100,
    data: result.songinfo.data,
  })
});

module.exports = router;
