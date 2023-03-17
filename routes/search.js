module.exports = {
  '/': async ({req, res, request, globalCookie, cache}) => {
    const obj = {...req.query, ...req.body};
    let { uin, qqmusic_key } = globalCookie.userCookie();
    if (Number(obj.ownCookie)) {
      uin = req.cookies.uin || uin;
    }

    const {
      pageNo = 1,
      pageSize = 20,
      key,
      t = 0, // 0：单曲，2：歌单，7：歌词，8：专辑，9：歌手，12：mv
      raw
    } = req.query;
    let total = 0;

    if (!key) {
      return res.send({
        result: 500,
        errMsg: '关键词不能为空',
      });
    }

    // 缓存
    const cacheKey = `search_${key}_${pageNo}_${pageSize}_${t}`;
    const cacheData = cache.get(cacheKey);
    if (cacheData) {
      res && res.send(cacheData);
      return cacheData;
    }

    const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'

    const typeMap = {
      0: 'song',
      2: 'album',
      1: 'singer',
      3: 'songlist',
      7: 'lyric',
      12: 'mv',
    };
    if (!typeMap[t]) {
      return res.send({
        result: 500,
        errMsg: '搜索类型错误，检查一下参数 t',
      });
    }

    const params = {
      req_1: {
        method: "DoSearchForQQMusicDesktop",
        module: "music.search.SearchCgiService",
        param: {
          num_per_page: Number(pageSize),
          page_num: Number(pageNo),
          query: key,
          search_type: Number(t)
        }
      }
    }
    let result = {}

    try {     
      result = await request({
        url,
        method: 'POST',
        data: params,
        headers: {
          Referer: 'https://y.qq.com'
        },
      });
    } catch (error) {
      return res.send({
        result: 400,
        error
      })
    }

    // 直接返回原生数据
    if (Number(raw)) {
      return res.send(result);
    }
    const response = {
      result: 100,
      data: {
        list: Number(t) === 0 ? formatSongList(result.req_1.data.body[typeMap[t]].list) : result.req_1.data.body[typeMap[t]].list,
        pageNo,
        pageSize,
        total: result.req_1.data.meta.sum,
        key: result.req_1.data.meta.query || key,
        t,
        type: typeMap[t],
      },
    }
    res.send(response);
  },

  // 热搜词
  '/hot': async ({req, res, request}) => {
    const {raw} = req.query;
    const result = await request({
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg',
    });
    if (Number(raw)) {
      return res.send(result);
    }
    res.send({
      result: 100,
      data: result.data.hotkey,
    });
  },

  // 快速搜索
  '/quick': async ({req, res, request}) => {
    const {raw, key} = req.query;
    if (!key) {
      return res.send({
        result: 500,
        errMsg: 'key ?',
      });
    }
    const result = await request(
      `https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg?key=${key}&g_tk=5381`,
    );
    if (Number(raw)) {
      return res.send(result);
    }
    return res.send({
      result: 100,
      data: result.data,
    });
  },
}

function formatSongList(list) {
  if (!Array.isArray(list)) {
    return []
  }
  return list.map((item) => {
    // 美化歌曲数据
    return {
      singer: item.singer, // 、
      name: item.title,
      songid: item.id,
      songmid: item.mid,
      songname: item.title,

      albumid: item.album.id,
      albummid: item.album.mid,
      albumname: item.album.name,
      interval: item.interval,

      strMediaMid: item.file.media_mid,
      size128: item.file.size_128mp3,
      size320: item.file.size_320mp3,
      sizeape: item.file.size_ape,
      sizeflac: item.file.size_flac,
      pay: item.pay || {}
    }
  })
}