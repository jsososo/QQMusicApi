const express = require('express');
const router = express.Router();
const request  = require('../util/request');

// 根据 id 获取歌单详情
router.get('/', async (req, res, next) => {
  const { id, raw } = req.query;
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

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: result.cdlist[0] || {},
    })
  }

});

// 获取歌单分类
router.get('/category', async (req, res) => {
  const { raw } = req.query;

  const result = await request({
    url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_tag_conf.fcg?format=json&inCharset=utf8&outCharset=utf-8',
    headers: {
      Referer: 'https://y.qq.com/'
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: result.data.categories.map((item) => ({
        type: item.categoryGroupName,
        list: (item.items || []).map((obj) => ({
          id: obj.categoryId,
          name: obj.categoryName,
        }))
      })),
    })
  }
});

// 根据歌单分类筛选歌单
router.get('/list', async (req, res) => {
  const { raw, num = 20, sort = 5, category = 10000000 } = req.query;

  const result = await request({
    url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg',
    data: {
      inCharset: 'utf8',
      outCharset: 'utf-8',
      sortId: sort,
      categoryId: category,
      ein: num - 1,
    },
    headers: {
      Referer: 'https://y.qq.com',
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    const { list = [], sortId, categoryId, ein, sum } = result.data;
    res.send({
      result: 100,
      data: {
        list,
        sort: sortId,
        category: categoryId,
        num: ein + 1,
        total: sum,
      }
    });
  }
});

// 这是一个把网易云歌单进行简单搬运到qq音乐的功能，运行的比较慢，看到的人感兴趣的就自己研究一下吧
router.get('/move', async (req, res) => {
  const { id } = req.query;
  const url = `http://music.jsososo.com/api/playlist/detail?id=${id}`;

  const result = await request(url);
  const list = [];

  for (let index = 0; index < result.playlist.tracks.length; index++) {
    const item = result.playlist.tracks[index];
    const song = {
      name: item.name,
      artist: item.ar.map(a => a.name).join('/'),
      album: item.al.name,
    };
    const key = `${song.name} ${song.artist} ${song.album}`;
    try {
      const obj = await request(`http://music.jsososo.com/apiQ/song/find?key=${key}`);
      if (obj.data && obj.data.songmid) {
        console.log(obj.data.songmid);
        list.push(obj.data.songmid);
        await request({
          url: 'http://127.0.0.1:3300/songlist/add',
          data: {
            mid: obj.data.songmid,
            dirid: 201,
          }
        });
      }
      console.log(list.length, index, result.playlist.tracks.length);
    } catch (e) {

    }
  }

  res.send(list);
});

// 把歌曲添加到歌单，这个接口要用cookie的
router.get('/add', async (req, res) => {
  const { mid, dirid } = req.query;
  const result = await request({
    url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_music_add2songdir.fcg?g_tk=5381',
    method: 'get',
    data: {
      loginUin: req.cookies.uin,
      hostUin: 0,
      format: 'json',
      inCharset: 'utf8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'yqq.post',
      needNewCode: 0,
      uin: req.cookies.uin,
      midlist: mid,
      typelist: new Array(mid.split(',').length).fill(13).join(','),
      dirid: 201,
      addtype: '',
      formsender: 4,
      source,
      r2: 0,
      r3: 1,
      utf8: 1,
      g_tk: 5381,
    }
  }, {
    raw: true,
  });

  res.send(result);
});

module.exports = router;
