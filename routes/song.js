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

router.get('/batch', async (req, res) => {
  const { songmids } = req.query;
  if (!songmids) {
    return res.send({
      result: 500,
      errMsg: 'songmids 不能为空',
    })
  }
  const midArr = songmids.split(',');
  const resultObj = {};
  let count = 0;
  const finishCb = () => {
    if (count !== midArr.length)
      return;

    res.send({
      result: 100,
      data: resultObj,
    });
  };
  midArr.forEach((mid) => {
    request(`http://127.0.0.1:3300/song?songmid=${mid}`)
      .then((res) => {
        if (res.result === 100) {
          resultObj[mid] = res.data;
        }
        count += 1;
        finishCb();
      }, (err) => {
        count += 1;
        finishCb();
      })
  })
});

router.get('/find', async (req, res) => {
  const { key } = req.query;
  const obj = await request(`http://127.0.0.1:3300/search?key=${key}&pageNo=1`);
  const song = obj.data.list[0];
  if (!song) {
    res.send({
      result: 100,
      data: {},
    })
  } else {
    const result = {
      result: 100,
      data: song,
    };
    const urlResult = await request(`http://127.0.0.1:3300/song/urls?id=${song.songmid}`);
    result.data.url = urlResult.data[song.songmid];
    res.send(result);
  }
});

router.post('/finds', async (req, res) => {
  const { data } = req.body;
  const keys = Object.keys(data);

  let count = 0;
  for (let i = 0; i < keys.length; i++) {
    request({
      url: `http://127.0.0.1:3300/song/find?key=${encodeURIComponent(data[keys[i]])}`,
    }).then((result) => {
      data[keys[i]] = result.data || {};
      count += 1;

      if (count === keys.length) {
        res.send({
          result: 100,
          data,
        })
      }
    }, (err) => {
      data[keys[i]] = {};
      count += 1;

      if (count === keys.length) {
        res.send({
          result: 100,
          data,
        })
      }
    });

  }
});

// 批量获取歌曲 url
const getUrls = async (req, res) => {
  const obj = { ...req.query, ...req.body };

  const { id } = obj;
  const idArr = id.split(',');
  let count = 0;
  const idStr = idArr.map((id) => `"${id}"`).join(',');
  let url = `https://u.y.qq.com/cgi-bin/musicu.fcg?-=getplaysongvkey2682247447678878&g_tk=5381&loginUin=956581739&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0&data=%7B"req_0"%3A%7B"module"%3A"vkey.GetVkeyServer"%2C"method"%3A"CgiGetVkey"%2C"param"%3A%7B"guid"%3A"2796982635"%2C"songmid"%3A%5B${idStr}%5D%2C"songtype"%3A%5B0%5D%2C"uin"%3A"956581739"%2C"loginflag"%3A1%2C"platform"%3A"20"%7D%7D%2C"comm"%3A%7B"uin"%3A956581739%2C"format"%3A"json"%2C"ct"%3A24%2C"cv"%3A0%7D%7D`
  let isOk = false;
  let result = null;

  const reqFun = async () => {
    count += 1;
    result = await request(url);
    if (result.req_0.data.testfile2g) {
      isOk = true;
    }
  };

  while (!isOk && count < 10) {
    await reqFun();
  }

  // const domain = result.req_0.data.sip[0];
  const domain = 'http://122.226.161.16/amobile.music.tc.qq.com/';

  const data = {};
  result.req_0.data.midurlinfo.forEach((item) => {
    if (item.purl) {
      data[item.songmid] = `${domain}${item.purl}`;
    }
  });

  res.send({
    data,
    result: 100,
  });
};

// 新版获取 url 的方法
const getUrlNew = async (req, res) => {
  const obj = { ...req.query, ...req.body };

  const { id, type = '128', mediaId = id } = obj;
  const typeMap = {
    m4a: {
      s: 'C400',
      e: '.m4a',

    },
    128: {
      s: 'M500',
      e: '.mp3',
    },
    320: {
      s: 'M800',
      e: '.mp3',
    },
    ape: {
      s: 'A000',
      e: '.ape',
    },
    flac: {
      s: 'F000',
      e: '.flac',
    }
  };
  const typeObj = typeMap[type];

  if (!typeObj) {
    return res.send({
      result: 500,
      errMsg: 'type 传错了，看看文档去',
    })
  }
  const file = `${typeObj.s}${mediaId}${typeObj.e}`;
  const guid = (Math.random() * 10000000).toFixed(0);

  const url = `http://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?g_tk=1722049047&loginUin=956581739&needNewCode=0&cid=205361747&uin=323&songmid=${id}&filename=${file}&guid=${guid}`;
  const result = await request(url);
  let vkey = '';

  if (result.data && result.data.items && result.data.items[0]) {
    vkey = result.data.items[0].vkey;
    if (vkey.indexOf(' ') > -1) {
      vkey = '';
    }
  }
  if (!vkey) {
    return res.send({
      result: 400,
      errMsg: '获取播放链接出错',
    })
  }

  res.send({
    data: `http://122.226.161.16/amobile.music.tc.qq.com/${file}?guid=${guid}&vkey=${vkey}&uin=323&fromtag=66`,
    result: 100,
  });
};

router.get('/urls', getUrls);

router.post('/urls', getUrls);

router.get('/url', getUrlNew);

router.post('/url', getUrlNew);

// 相似歌曲
router.get('/similar', async (req, res) => {
  const { id, raw } = req.query;
  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id ?'
    })
  }
  const result = await request({
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    data: JSON.stringify({"comm":{
        "g_tk":5381,
        "format":"json",
        "inCharset":"utf-8",
        "outCharset":"utf-8",
        "notice":0,
        "platform":"h5",
        "needNewCode":1
      },
      "simsongs":{
        "module":"rcmusic.similarSongRadioServer",
        "method":"get_simsongs",
        "param":{
          "songid":Number(id)
        }
      }}),
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }, {
    dataType: 'raw',
  });

  if (Number(raw)) {
    return res.send(result);
  }
  return res.send({
    result: 100,
    data: result.simsongs.data.songInfoList,
  });
});

// 相关歌单
router.get('/playlist', async (req, res) => {
  const { id, raw } = req.query;
  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id ?'
    })
  }
  const result = await request({
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    data: JSON.stringify({"comm":{
        "g_tk":5381,
        "format":"json",
        "inCharset":"utf-8",
        "outCharset":"utf-8",
        "notice":0,
        "platform":"h5",
        "needNewCode":1
      },
      "gedan":{
        "module":"music.mb_gedan_recommend_svr",
        "method":"get_related_gedan",
        "param":{
          "sin":0,
          "last_id":0,
          "song_type":1,
          "song_id":Number(id)
        }
      }}),
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }, {
    dataType: 'raw',
  });

  if (Number(raw)) {
    return res.send(result);
  }
  return res.send({
    result: 100,
    data: result.gedan.data.vec_gedan,
  });
});

// 相关 mv
router.get('/mv',  async (req, res) => {
  const { id, raw } = req.query;
  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id ?'
    })
  }
  const result = await request({
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    data: JSON.stringify({"comm":{
        "g_tk":5381,
        "format":"json",
        "inCharset":"utf-8",
        "outCharset":"utf-8",
        "notice":0,
        "platform":"h5",
        "needNewCode":1
      },
      "video":{
        "module":"MvService.MvInfoProServer",
        "method":"GetSongRelatedMv",
        "param":{
          "songid":id,
          "songtype":1,
          "lastmvid":0,
          "num":10
        }
      }}),
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }, {
    dataType: 'raw',
  });

  if (Number(raw)) {
    return res.send(result);
  }
  return res.send({
    result: 100,
    data: result.video.data.list,
  });
});

module.exports = router;
