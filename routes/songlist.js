const StringHelper = require('../util/StringHelper');

module.exports = {
  // 根据 id 获取歌单详情
  '/': async ({req, res, request}) => {
    const {id, raw} = req.query;
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
      const resData = {
        result: 100,
        data: result.cdlist[0] || {},
      };
      res && res.send(resData)
      return resData;
    }

  },

  // 获取歌单分类
  '/category': async ({req, res, request}) => {
    const {raw} = req.query;

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
  },

  // 根据歌单分类筛选歌单
  '/list': async ({req, res, request}) => {
    const {raw, num = 20, pageSize = num, pageNo = 1, sort = 5, category = 10000000} = req.query;

    const result = await request({
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg',
      data: {
        inCharset: 'utf8',
        outCharset: 'utf-8',
        sortId: sort,
        categoryId: category,
        sin: pageSize * (pageNo - 1),
        ein: pageNo * pageSize - 1,
      },
      headers: {
        Referer: 'https://y.qq.com',
      }
    });

    if (Number(raw)) {
      res.send(result);
    } else {
      const {list = [], sortId, categoryId, ein, sum} = result.data;
      res.send({
        result: 100,
        data: {
          list,
          sort: sortId,
          category: categoryId,
          pageNo,
          pageSize,
          total: sum,
        }
      });
    }
  },

  // 获取歌单中 mid 和 id 强制使用传过来的cookie
  '/map': async ({req, res, request}) => {
    const {dirid = 201, raw} = req.query;
    req.query.ownCookie = 1;
    const result = await request({
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_musiclist_getmyfav.fcg',
      data: {
        dirid,
        dirinfo: 1,
        g_tk: 5381,
        format: 'json',
      },
      headers: {
        Referer: 'https://y.qq.com/n/yqq/playlist',
      },
    });
    if (result.code === 1000) {
      return res.send({
        result: 301,
        errMsg: '未登陆',
      })
    }
    if (Number(raw)) {
      return res.send(result);
    }
    return res.send({
      result: 100,
      data: {
        id: result.map,
        mid: result.mapmid,
      }
    })
  },

  // 把歌曲添加到歌单，强制使用传过来的cookie
  '/add': async ({req, res, request}) => {
    const {mid, dirid} = req.query;
    if (!mid || !dirid) {
      return res.send({
        result: 500,
        errMsg: 'mid ? dirid ?'
      })
    }
    req.query.ownCookie = 1;
    const result = await request({
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_music_add2songdir.fcg?g_tk=5381',
      method: 'get',
      data: {
        midlist: mid,
        typelist: new Array(mid.split(',').length).fill(13).join(','),
        dirid,
        addtype: '',
        formsender: 4,
        r2: 0,
        r3: 1,
        utf8: 1,
        g_tk: 5381,
      }
    }, {
      raw: true,
    });

    switch (Number(result.code)) {
      case 0:
        return res.send({
          message: '删除成功',
          result: 100,
        });
      case 1000:
        return res.send({
          result: 301,
          errMsg: '先登录！'
        });
      default:
        return res.send({
          result: 200,
          errMsg: `删除出错: ${result.msg}`,
        })
    }
  },

  // 从歌单中删除歌曲，强制使用传过来的cookie
  '/remove': async ({req, res, request}) => {
    const {id, dirid} = req.query;
    if (!id || !dirid) {
      return res.send({
        result: 500,
        errMsg: 'id ? dirid ?'
      })
    }
    req.query.ownCookie = 1;
    const result = await request({
      url: 'https://c.y.qq.com/qzone/fcg-bin/fcg_music_delbatchsong.fcg?g_tk=5381',
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
        dirid,
        ids: id,
        source: 103,
        types: new Array(id.split(',').length).fill(3).join(','),
        formsender: 4,
        flag: 2,
        utf8: 1,
        from: 3,
      }
    });

    switch (Number(result.code)) {
      case 0:
        return res.send({
          message: '删除成功',
          result: 100,
        });
      case 1000:
        return res.send({
          result: 301,
          errMsg: '先登录！'
        });
      default:
        return res.send({
          result: 200,
          errMsg: `删除出错: ${result.msg}`,
        })
    }
  },

  // 新建歌单 强制使用传过来的cookie
  '/create': async ({req, res, request}) => {
    req.query.ownCookie = 1;
    const {name} = req.query;
    if (!name) {
      return res.send({
        result: 500,
        errMsg: 'name ? '
      })
    }
    const result = await request({
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/create_playlist.fcg?g_tk=5381',
      method: 'post',
      data: StringHelper.changeUrlQuery({
        loginUin: req.cookies.uin,
        hostUin: 0,
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'utf8',
        notice: 0,
        platform: 'yqq',
        needNewCode: 0,
        g_tk: 5381,
        uin: req.cookies.uin,
        name,
        show: 1,
        formsender: 1,
        utf8: 1,
        qzreferrer: 'https://y.qq.com/portal/profile.html#sub=other&tab=create&',
      }, '?').slice(1),
      headers: {
        Referer: 'https://y.qq.com/n/yqq/playlist',
      },
    });
    switch (Number(result.code)) {
      case 21:
        return res.send({
          result: 200,
          errMsg: '重名啦！',
        });
      case 0:
        return res.send({
          data: {
            dirid: result.dirid,
            message: '创建成功',
          },
          result: 100,
        });
      case 1:
        return res.send({
          result: 301,
          errMsg: '先登录！'
        });
      default:
        return res.send({
          result: 200,
          errMsg: `创建出错: ${result.msg}`,
        })
    }
  },

  // 删除歌单 强制使用传过来的Cookie
  '/delete': async ({req, res, request}) => {
    req.query.ownCookie = 1;
    const {dirid} = req.query;
    if (!dirid) {
      return res.send({
        result: 500,
        errMsg: 'dirid ?',
      })
    }
    let result = await request({
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_fav_modsongdir.fcg?g_tk=5381',
      method: 'post',
      data: StringHelper.changeUrlQuery({
        loginUin: req.cookies.uin,
        hostUin: 0,
        format: 'fs',
        inCharset: 'GB2312',
        outCharset: 'gb2312',
        notice: 0,
        platform: 'yqq',
        needNewCode: 0,
        g_tk: 5381,
        uin: req.cookies.uin,
        delnum: 1,
        deldirids: dirid,
        forcedel: 1,
        formsender: 1,
        source: 103,
      }, '?').slice(1),
      headers: {
        Referer: 'https://y.qq.com/n/yqq/playlist',
      },
    }, {
      dataType: 'raw',
    });
    result = JSON.parse(result.replace(/(^.+\()|(\).+$)/g, ''));

    switch (Number(result.code)) {
      case 0:
        return res.send({
          message: '删除成功',
          result: 100,
        });
      case 1:
        return res.send({
          result: 301,
          errMsg: '先登录！'
        });
      default:
        return res.send({
          result: 200,
          errMsg: `删除出错: ${result.msg}`,
        })
    }
  },

  // 收藏歌单 强制使用传过来的Cookie
  '/collect': async ({req, res, request}) => {
    req.query.ownCookie = 1;
    // op: 1 收藏，2 取消收藏
    const {id, op} = req.query;
    if (!id || op === undefined) {
      return res.send({
        result: 500,
        errMsg: 'id or op?',
      })
    }
    const result = await request({
      url: 'https://c.y.qq.com/folder/fcgi-bin/fcg_qm_order_diss.fcg',
      data: {
        loginUin: req.cookies.uin,
        hostUin: 0,
        inCharset: 'GB2312',
        outCharset: 'utf8',
        platform: 'yqq',
        format: 'json',
        g_tk: 799643780,
        uin: req.cookies.uin,
        dissid: id,
        notice: 0,
        needNewCode: 0,
        from: 1,
        optype: String(op),
        utf8: 1,
        qzreferrer: `https://y.qq.com/n/yqq/playlist/${id}.html`,
      },
      headers: {
        Referer: `https://y.qq.com/n/yqq/playlist/${id}.html`,
        origin: 'https://imgcache.qq.com',
        'content-type': 'application/x-www-form-urlencoded',
      }
    }, {
      dataType: 'raw'
    });
    if (result.code) {
      return res.send({
        result: 200,
        errMsg: result.msg,
      })
    }
    return res.send({
      result: 100,
      data: {
        message: '操作成功',
      }
    });
  },

  // 这是一个把网易云歌单进行简单搬运到qq音乐的功能，运行的比较慢，看到的人感兴趣的就自己研究一下吧
  // '/move': async ({req, res, request}) => {
  //   const {id} = req.query;
  //   const url = `http://music.jsososo.com/api/playlist/detail?id=${id}`;
  //
  //   const result = await request(url);
  //   const list = [];
  //
  //   for (let index = 0; index < result.playlist.tracks.length; index++) {
  //     const item = result.playlist.tracks[index];
  //     const song = {
  //       name: item.name,
  //       artist: item.ar.map(a => a.name).join('/'),
  //       album: item.al.name,
  //     };
  //     const key = `${song.name} ${song.artist} ${song.album}`;
  //     try {
  //       const obj = await request(`http://music.jsososo.com/apiQ/song/find?key=${key}`);
  //       if (obj.data && obj.data.songmid) {
  //         list.push(obj.data.songmid);
  //         await request({
  //           url: `http://127.0.0.1:${global.PORT}/songlist/add`,
  //           data: {
  //             mid: obj.data.songmid,
  //             dirid: 201,
  //           }
  //         });
  //       }
  //     } catch (e) {
  //
  //     }
  //   }
  //
  //   res.send(list);
  // },
}
