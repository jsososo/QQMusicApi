const express = require('express');
const router = express.Router();
const request  = require('../util/request');

router.get('/playlist', async (req, res, next) => {
  const {
    raw,
    pageNo = 1,
    pageSize = 20,
    id = 3317, // 3317: 官方歌单，59：经典，71：情歌，3056：网络歌曲，64：KTV热歌
  } = req.query;

  const data = {
    data: JSON.stringify({
      comm: {
        ct: 24
      },
      playlist: {
        method: "get_playlist_by_category",
        param: {
          id: id / 1,
          curPage: pageNo / 1,
          size: pageSize / 1,
          order: 5,
          titleid: id / 1,
        },
        module: "playlist.PlayListPlazaServer"
      }
    }),
  };

  const result = await request({
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    data,
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    const { total, v_playlist } = result.playlist.data;
    res.send({
      result: 100,
      data: {
        total,
        list: v_playlist,
        id,
        pageNo,
        pageSize,
      }
    })
  }

});

router.get('/playlist/u', async (req, res, next) => {
  const { raw } = req.query;

  const data = {
    data: JSON.stringify({
      comm: {
        ct: 24
      },
      recomPlaylist: {
        method: "get_hot_recommend",
        param: {
          async: 1,
          cmd: 2
        },
        module: "playlist.HotRecommendServer"
      }
    })
  };

  const result = await request({
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    data,
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    const list = result.recomPlaylist.data.v_hot;
    res.send({
      result: 100,
      data: {
        list,
        count: list.length,
      }
    })
  }
});

module.exports = router;
