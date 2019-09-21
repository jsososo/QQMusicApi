const express = require('express');
const router = express.Router();
const request  = require('../util/request');

router.get('/songs', async (req, res, next) => {
  const { type = 5, raw } = req.query;

  const newType = {
    0: 5, // 最新
    1: 1, // 内地
    2: 6, // 港台
    3: 2, // 欧美
    4: 4, // 韩国
    5: 3, // 日本
  }[type];

  if (!newType) {
    return res.send({
      result: 500,
      errMsg: 'type 不合法'
    })
  }

  const result = await request({
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      data: JSON.stringify({
        comm: {
          ct: 24
        },
        new_song: {
          module: "newsong.NewSongServer",
          method: "get_new_song_info",
          param: {
            type: newType,
          }
        }
      })
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    const { lan, type, songlist } = result.new_song.data;
    res.send({
      result: 100,
      data: {
        lan,
        list: songlist,
        type,
      },
    })
  }

});

router.get('/album', async (req, res) => {
  const { type = 1, num = 10, raw } = req.query;

  const typeName = {
    1: '内地',
    2: '港台',
    3: '欧美',
    4: '韩国',
    5: '日本',
    6: '其他',
  }[type];

  if (!typeName) {
    return res.send({
      result: 500,
      errMsg: 'type 不合法'
    })
  }

  const result = await request({
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      platform: 'yqq.json',
      needNewCode: 0,
      data: JSON.stringify({
        comm: {
          ct: 24
        },
        new_album: {
          module: "newalbum.NewAlbumServer",
          method: "get_new_album_info",
          param: {
            area: type / 1,
            sin: 0,
            num: num / 1
          }
        }
      }),
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: {
        list: result.new_album.data.albums,
        type: type / 1,
        typeName,
      }
    })
  }
});

router.get('/mv', async (req, res) => {
  const { raw, type = 0 } = req.query;

  const typeName = {
    0: '精选',
    1: '内地',
    2: '港台',
    3: '欧美',
    4: '韩国',
    5: '日本',
  }[type];

  const lan = {
    0: 'all',
    1: 'neidi',
    2: 'gangtai',
    3: 'oumei',
    4: 'korea',
    5: 'janpan'
  }[type];

  if (!lan) {
    return res.send({
      result: 500,
      errMsg: 'type 不合法'
    })
  }

  const result = await request({
    url: 'https://c.y.qq.com/mv/fcgi-bin/getmv_by_tag',
    data: {
      cmd: 'shoubo',
      lan,
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    const { mvlist: list } = result.data;
    res.send({
      resultL: 100,
      data: {
        list,
        lan: result.data.lan,
        typeName,
      }
    })
  }
});

module.exports = router;
