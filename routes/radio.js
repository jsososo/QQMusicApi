const express = require('express');
const router = express.Router();
const request  = require('../util/request');

// 获取分类
router.get('/category', async (req, res, next) => {
  const { raw } = req.query;
  const result = await request({
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      data: JSON.stringify({
        songlist: {
          module: "mb_track_radio_svr",
          method: "get_radio_track",
          param: {
            id: 99,
            firstplay: 1,
            num: 15
          },
        },
        radiolist: {
          module: "pf.radiosvr",
          method: "GetRadiolist",
          param: {
            ct: "24"
          },
        },
        comm: {
          ct: 24,
          cv: 0
        }
      })
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: result.radiolist.data.radio_list
    });
  }
});

// 获取电台歌曲
router.get('/', async (req, res) => {
  const { id, raw } = req.query;

  if (!id) {
    res.send({
      result: 500,
      errMsg: 'id 不能为空',
    })
  }
  const result = await request({
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      data: JSON.stringify({
        songlist: {
          module: "mb_track_radio_svr",
          method: "get_radio_track",
          param: {
            id: id / 1,
            firstplay: 1,
            num: 15
          },
        },
        radiolist: {
          module: "pf.radiosvr",
          method: "GetRadiolist",
          param: {
            ct: "24"
          },
        },
        comm: {
          ct: 24,
          cv: 0
        },
      })
    },

  });

  if (Number(raw)) {
    return res.send(result);
  }

  res.send({
    result: 100,
    data: result.songlist.data,
  })
});

module.exports = router;
