const express = require('express');
const router = express.Router();
const request  = require('../util/request');

// 获取歌手介绍
router.get('/desc', async (req, res, next) => {
  const { singermid, raw } = req.query;

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

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: result.result.data.info,
    })
  }
});

// 获取歌手专辑
router.get('/album', async (req, res, next) => {
  const { singermid, pageNo = 1, pageSize = 20, raw } = req.query;

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

  if (Number(raw)) {
    res.send(result);
  } else {
    const { list, singer_id: id, singer_mid: singermid, singer_name: name, total } = result.singerAlbum.data;
    res.send({
      result: 100,
      data: {
        list,
        id,
        singermid,
        name,
        total,
        pageNo,
        pageSize,
      }
    })
  }
});

// 获取热门歌曲
router.get('/songs', async (req, res) => {
  const { singermid, num = 20, raw } = req.query;

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
        singer: {
          method: "get_singer_detail_info",
          param: {
            sort: 5,
            singermid,
            sin: 0,
            num,
          },
          module: "music.web_singer_info_svr"
        }
      })
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    const { songlist: list, singer_info: singer, singer_brief, desc, total_song: total, extras } = result.singer.data;
    list.forEach((o, i) => {
      Object.assign(o, extras[i] || {});
    });

    res.send({
      result: 100,
      data: {
        list,
        singer,
        desc,
        total,
        num,
        singermid,
      }
    })
  }
});

// 获取mv
router.get('/mv', async (req, res) => {
  const { singermid, pageNo = 1, pageSize = 20, raw } = req.query;

  if (!singermid) {
    return res.send({
      result: 500,
      errMsg: 'singermid 不能为空',
    })
  }

  const result = await request({
    url: 'http://c.y.qq.com/mv/fcgi-bin/fcg_singer_mv.fcg',
    data: {
      singermid,
      order: 'time',
      begin: (pageNo - 1) * pageSize,
      num: pageSize,
      cid: 205360581,
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: {
        ...result.data,
        pageNo,
        pageSize,
        singermid,
      }
    })
  }

});

// 相似歌手
router.get('/sim', async (req, res, next) => {
  const { singermid, raw } = req.query;

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
      utf8: 1,
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: {
        list: result.singers.items,
        singermid,
      }
    })
  }
});

module.exports = router;
