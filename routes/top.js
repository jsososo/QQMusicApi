const express = require('express');
const router = express.Router();
const request  = require('../util/request');
const cheerio = require('cheerio');
const moment = require('moment');

router.get('/', async (req, res, next) => {
  const { id = 4, pageNo = 1, pageSize = 100, time = moment().format('YYYY-MM-DD'), raw } = req.query;

  let timeType = '';

  switch (Number(id)) {
    case 4:
    case 27:
    case 62:
      timeType = 'YYYY-MM-DD';
      break;
    default:
      timeType = 'YYYY_W';
  }
  const result = await request({
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      g_tk: 5381,
      data: JSON.stringify({
        "detail": {
          "module": "musicToplist.ToplistInfoServer",
          "method": "GetDetail",
          "param": {
            "topId": Number(id),
            "offset": (pageNo - 1) * pageSize,
            "num": Number(pageSize),
            "period": moment(time).format(timeType),
          },
        },
        "comm": { "ct": 24, "cv": 0 }
      }),
    },
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    const resData = result.detail.data;
    res.send({
      result: 100,
      data: {
        info: {
          title: resData.data.title,
          subTitle: resData.data.titleSub,
          titleDetail: resData.data.titleDetail,
          desc: resData.data.intro,
        },
        list: resData.songInfoList,
        total: resData.data.totalNum,
        listenNum: resData.data.listenNum,
        time: resData.data.period,
        update: resData.data.updateTime,
        timeType,
        id: resData.data.topId,
        pageNo,
        pageSize,
      }
    })
  }
});

// 获取各种排行榜
router.get('/category', async (req, res) => {
  const result = await request('https://y.qq.com/n/yqq/toplist/4.html', { dataType: 'raw' });
  const $ = cheerio.load(result);
  const data = [];
  // 每一个分类
  $('.toplist_nav__list').each((cI, category) => {
    const $category = cheerio.load(category);
    const list = [];
    // 分类下的每一个榜单
    $category('.toplist_nav__item .toplist_nav__link').each((iI, item) => {
      const hrefArr = item.attribs.href.split('.');
      const value = hrefArr.pop();

      if (value === 'mv_toplist') {
        return;
      }
      list.push({
        value,
        label: item.children[0].data,
      })
    });
    data.push({
      title: $category('.toplist_nav__tit').text(),
      list,
    });
  });
  res.send({
    result: 100,
    data,
  })
});

module.exports = router;
