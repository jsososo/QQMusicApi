const express = require('express');
const router = express.Router();
const request  = require('../util/request');
const cheerio = require('cheerio');

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

// 日推
router.get('/daily', async (req, res) => {
  req.query.ownCookie = 1;
  const page = await request('https://c.y.qq.com/node/musicmac/v6/index.html', {
    dataType: 'raw',
  })
  const $ = cheerio.load(page);
  const firstList = $('.mod_for_u .playlist__item').first();
  let id = '';
  if (firstList.find('.playlist__name').text() === '今日私享') {
    id = firstList.find('.playlist__link').data('rid');
  }
  if (!id) {
    return res.send({
      result: 301,
      errMsg: '未登录'
    })
  }
  const listInfo = await request(`http://127.0.0.1:${global.PORT}/songlist?id=${id}`);
  return res.send(listInfo);
});

// banner 日推
router.get('/banner', async (req, res) => {
  req.query.ownCookie = 1;
  const page = await request('https://c.y.qq.com/node/musicmac/v6/index.html', {
    dataType: 'raw',
  })
  const $ = cheerio.load(page);
  const result = [];
  $('.focus__box .focus__pic').each((a, b) => {
    const domA = cheerio(b).find('a');
    const domImg = cheerio(b).find('img');
    const [type, id] = [domA.attr('data-type'), domA.attr('data-rid')];
    const obj = {
      type,
      id,
      picUrl: domImg.attr('src'),
      h5Url: {
        10002: `https://y.qq.com/musicmac/v6/album/detail.html?albumid=${id}`
      }[type] || undefined,
      typeStr: {
        10002: 'album'
      }[type] || undefined
    }
    result.push(obj);
  })

  res.send({
    result: 100,
    data: result,
  })
})

module.exports = router;
