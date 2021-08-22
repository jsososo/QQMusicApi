const jsonFile = require('jsonfile');
const getSign = require('../util/sign');

const user = {
  '/cookie': ({req, res, globalCookie}) => {
    res.send({
      result: 100,
      data: req.cookies
    });
  },

  '/refresh': async ({req, res, request}) => {
    const {uin, qm_keyst, qqmusic_key} = req.cookies
    if (!uin || !(qm_keyst || qqmusic_key)) {
      return res.send({
        result: 301,
        errMsg: '未登陆'
      })
    }
    const data = {
      req1: {
        module: "QQConnectLogin.LoginServer",
        method: "QQLogin",
        param: {
          expired_in: 7776000, //不用管
          // onlyNeedAccessToken: 0, //不用管
          // forceRefreshToken: 0, //不用管
          // access_token: "6B0C62126368CA1ACE16C932C679747E", //access_token
          // refresh_token: "25BACF1650EE2592D06BCC19EEAD7AD6", //refresh_token
          musicid: uin, //uin或者web_uin 微信没试过
          musickey: qm_keyst || qqmusic_key, //key
        },
      },
    };
    const sign = getSign(data);
    let url = `https://u6.y.qq.com/cgi-bin/musics.fcg?sign=${sign}&format=json&inCharset=utf8&outCharset=utf-8&data=${encodeURIComponent(
      JSON.stringify(data)
    )}`;

    const result = await request({url})

    if (result.req1 && result.req1.data && result.req1.data.musickey) {
      const musicKey = result.req1.data.musickey;
      ['qm_keyst', 'qqmusic_key'].forEach((k) => {
        res.cookie(k, musicKey, {expires: new Date(Date.now() + 86400000)})
      })
      return res.send({
        result: 100,
        data: {
          musickey: result.req1.data.musickey,
        }
      });
    }
    return res.send({
      result: 200,
      errMsg: '刷新失败，建议重新设置cookie'
    })
  },

  '/getCookie': ({req, res, globalCookie}) => {
    const {id} = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id ?'
      });
    }

    const cookieObj = globalCookie.allCookies()[id] || {};
    Object.keys(cookieObj).forEach((k) => {
      // 有些过大的cookie 对登录校验无用，但是会导致报错
      if (cookieObj[k].length < 255) {
        res.cookie(k, cookieObj[k], {expires: new Date(Date.now() + 86400000)});
      }
    });
    return res.send({
      result: 100,
      message: '设置 cookie 成功',
    })
  },

  '/setCookie': ({req, res, globalCookie}) => {
    const {data} = req.body;
    const allCookies = globalCookie.allCookies();
    const userCookie = {};
    data.split('; ').forEach((c) => {
      const arr = c.split('=');
      userCookie[arr[0]] = arr[1];
    });

    if (Number(userCookie.login_type) === 2) {
      userCookie.uin = userCookie.wxuin;
    }
    userCookie.uin = (userCookie.uin || '').replace(/\D/g, '');
    allCookies[userCookie.uin] = userCookie;
    jsonFile.writeFile('data/allCookies.json', allCookies);

    // 这里写死我的企鹅号，作为存在服务器上的cookie
    if (String(userCookie.uin) === String(global.QQ)) {
      globalCookie.updateUserCookie(userCookie);
      jsonFile.writeFile('data/cookie.json', userCookie);
    }
    res.set('Access-Control-Allow-Origin', 'https://y.qq.com');
    res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.send({
      result: 100,
      data: '操作成功',
    })
  },

  // 获取用户歌单
  '/detail': async ({req, res, request}) => {
    const {id} = req.query;

    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id 不能为空',
      })
    }
    const result = await request({
      url: 'http://c.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg',
      data: {
        cid: 205360838, // 管他什么写死就好了
        userid: id, // qq号
        reqfrom: 1,
      }
    });

    if (result.code === 1000) {
      res && res.send({
        result: 301,
        errMsg: '未登陆',
        info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
      })
      return {};
    }

    result.result = 100;
    res && res.send(result);
    return result;
  },

  // 获取用户创建的歌单
  '/songlist': async ({req, res, request}) => {
    const {id, raw} = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id ?',
      })
    }
    const result = await request({
      url: 'https://c.y.qq.com/rsc/fcgi-bin/fcg_user_created_diss',
      data: {
        hostUin: 0,
        hostuin: id,
        sin: 0,
        size: 200,
        g_tk: 5381,
        loginUin: 0,
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq.json',
        needNewCode: 0,
      },
      headers: {
        Referer: 'https://y.qq.com/portal/profile.html',
      },
    });

    if (Number(raw)) {
      return res.send(result);
    }

    if (result.code === 4000) {
      return res.send({
        result: 100,
        data: {
          list: [],
          message: '这个人不公开歌单',
        },
      })
    }
    if (!result.data) {
      return res.send({
        result: 200,
        errMsg: '获取歌单出错',
      })
    }
    let favDiss = result.data.disslist.find((v) => v.dirid === 201);

    if (favDiss) {
      favDiss.diss_cover = 'http://y.gtimg.cn/mediastyle/global/img/cover_like.png';
    } else {
      try {
        const detail = await user["/detail"]({req: {query: {id}}, request});
        console.log(detail);
        const fav = detail.data.mymusic[0];
        favDiss = {
          "diss_name": "我喜欢",
          "diss_cover": "http://y.gtimg.cn/mediastyle/y/img/cover_qzone_130.jpg",
          "song_cnt": fav.num0,
          "listen_num": 0,
          "dirid": 201,
          "tid": fav.id,
          "dir_show": 1
        }
        result.data.disslist.unshift(favDiss);
      } catch (err) {
        console.log('获取主页信息，我喜欢的音乐失败：', err);
      }
    }
    return res.send({
      result: 100,
      data: {
        list: result.data.disslist,
        creator: {
          hostuin: id, // 这里不采用 result.data.hostuin, 因为微信登录的超长id超出了js安全数字范围
          encrypt_uin: result.data.encrypt_uin,
          hostname: result.data.hostname,
        }
      }
    })
  },

  // 获取用户收藏的歌单
  '/collect/songlist': async ({req, res, request}) => {
    const {id = req.cookies.uin, pageNo = 1, pageSize = 20, raw} = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id ? '
      })
    }
    const result = await request({
      url: 'https://c.y.qq.com/fav/fcgi-bin/fcg_get_profile_order_asset.fcg',
      data: {
        ct: 20,
        cid: 205360956,
        userid: id,
        reqtype: 3,
        sin: (pageNo - 1) * pageSize,
        ein: pageNo * pageSize,
      }
    });
    if (Number(raw)) {
      return res.send(result);
    }
    const {totaldiss, cdlist} = result.data;
    return res.send({
      result: 100,
      data: {
        list: cdlist,
        total: totaldiss,
        pageNo,
        pageSize,
      }
    })
  },

  // 获取用户收藏的专辑
  '/collect/album': async ({req, res, request}) => {
    const {id = req.cookies.uin, pageNo = 1, pageSize = 20, raw} = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id ? '
      })
    }
    const result = await request({
      url: 'https://c.y.qq.com/fav/fcgi-bin/fcg_get_profile_order_asset.fcg',
      data: {
        ct: 20,
        cid: 205360956,
        userid: id,
        reqtype: 2,
        sin: (pageNo - 1) * pageSize,
        ein: pageNo * pageSize - 1,
      }
    });
    if (Number(raw)) {
      return res.send(result);
    }
    const {totalalbum, albumlist} = result.data;
    return res.send({
      result: 100,
      data: {
        list: albumlist,
        total: totalalbum,
        pageNo,
        pageSize,
      }
    })
  },

  // 获取关注的歌手
  '/follow/singers': async ({req, res, request}) => {
    const {id = req.cookies.uin, pageNo = 1, pageSize = 20, raw} = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id 不能为空',
      })
    }

    const result = await request({
      url: 'https://c.y.qq.com/rsc/fcgi-bin/fcg_order_singer_getlist.fcg',
      data: {
        utf8: 1,
        page: pageNo,
        perpage: pageSize,
        uin: id,
        g_tk: 5381,
        format: 'json',
      }
    });

    if (result.code === 1000) {
      return res.send({
        result: 301,
        errMsg: '未登陆',
        info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
      })
    }

    if (raw) {
      return res.send(result);
    }

    res.send({
      total: result.num,
      pageNo: Number(pageNo),
      pageSize: Number(pageSize),
      data: result.list,
    })
  },

  // 关注歌手操作
  '/follow': async ({req, res, request}) => {
    const {singermid, raw, operation = 1, type = 1} = req.query;

    const urlMap = {
      12: 'https://c.y.qq.com/rsc/fcgi-bin/fcg_order_singer_del.fcg',
      11: 'https://c.y.qq.com/rsc/fcgi-bin/fcg_order_singer_add.fcg',
    };

    if (!singermid) {
      return res.send({
        result: 500,
        errMsg: 'singermid 不能为空',
      });
    }

    const url = urlMap[(type * 10) + (operation * 1)];
    const result = await request({
      url,
      data: {
        g_tk: 5381,
        format: 'json',
        singermid,
      }
    });

    if (Number(raw)) {
      return res.send(result);
    }

    switch (result.code) {
      case 1000:
        return res.send({
          result: 301,
          errMsg: '未登陆',
          info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
        });
      case 0:
        return res.send({
          result: 100,
          data: '操作成功',
          message: 'success',
        });
      default:
        return res.send({
          result: 200,
          errMsg: '未知异常',
          info: result,
        })
    }
  },

  // 获取关注的用户
  '/follow/users': async ({req, res, request}) => {
    const {id = req.cookies.uin, pageNo = 1, pageSize = 20, raw} = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id 不能为空',
      })
    }

    const result = await request({
      url: 'https://c.y.qq.com/rsc/fcgi-bin/friend_follow_or_listen_list.fcg',
      data: {
        utf8: 1,
        start: (pageNo - 1) * pageSize,
        num: pageSize,
        uin: id,
        format: 'json',
        g_tk: 5381,
      }
    });

    if (result.code === 1000) {
      return res.send({
        result: 301,
        errMsg: '未登陆',
        info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
      })
    }

    if (Number(raw)) {
      return res.send(result);
    }

    res.send({
      result: 100,
      pageNo: pageNo / 1,
      pageSize: pageSize / 1,
      data: result.list,
    })
  },

  // 获取用户粉丝
  '/fans': async ({req, res, request}) => {
    const {id = req.cookies.uin, pageNo = 1, pageSize = 20, raw} = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id 不能为空',
      })
    }

    const result = await request({
      url: 'https://c.y.qq.com/rsc/fcgi-bin/friend_follow_or_listen_list.fcg',
      data: {
        utf8: 1,
        start: (pageNo - 1) * pageSize,
        num: pageSize,
        uin: id,
        format: 'json',
        g_tk: 5381,
        is_listen: 1,
      }
    });

    if (result.code === 1000) {
      return res.send({
        result: 301,
        errMsg: '未登陆',
        info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
      })
    }

    if (Number(raw)) {
      return res.send(result);
    }

    res.send({
      result: 100,
      pageNo: pageNo / 1,
      pageSize: pageSize / 1,
      data: result.list,
    })
  },
};

module.exports = user;
