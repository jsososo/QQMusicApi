const express = require('express');
const router = express.Router();
const request  = require('../util/request');
const moment = require('moment');

router.get('/', async (req, res, next) => {
  const { id = 4, pageNo = 1, pageSize = 100, period, time = moment().format('YYYY-MM-DD'), raw } = req.query;

  let timeType = '';

  let postPeriod = (period || moment(time).format(timeType));
  switch (Number(id)) {
    case 4:
    case 27:
    case 62:
      timeType = 'YYYY-MM-DD';
      break;
    default:
      timeType = 'YYYY_W';
  }

  const reqFunc = async () => request({
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
            "period": postPeriod,
          },
        },
        "comm": { "ct": 24, "cv": 0 }
      }),
    },
  });
  let result = await reqFunc();

  if (result.detail.data.data.period !== postPeriod) {
    postPeriod = result.detail.data.data.period;
    result = await reqFunc();
  }


  if (result.detail.data.data.period)
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
        list: resData.data.song.map((o, i) => (
          {
            ...o,
            ...(resData.songInfoList[i]),
          }
        )),
        total: resData.data.totalNum,
        listenNum: resData.data.listenNum,
        period: postPeriod,
        update: resData.data.updateTime,
        id: resData.data.topId,
        pageNo,
        pageSize,
      }
    })
  }
});

// 获取各种排行榜
router.get('/category', async (req, res) => {
  const { raw, showDetail = 0 } = req.query;
  const result = await request('https://u.y.qq.com/cgi-bin/musicu.fcg?_=1577086820633&data={%22comm%22:{%22g_tk%22:5381,%22uin%22:956581739,%22format%22:%22json%22,%22inCharset%22:%22utf-8%22,%22outCharset%22:%22utf-8%22,%22notice%22:0,%22platform%22:%22h5%22,%22needNewCode%22:1,%22ct%22:23,%22cv%22:0},%22topList%22:{%22module%22:%22musicToplist.ToplistInfoServer%22,%22method%22:%22GetAll%22,%22param%22:{}}}');

  if (Number(raw)) {
    return res.send(result);
  }

  res.send({
    result: 100,
    data: result.topList.data.group.map((o) => ({
      title: o.groupName,
      list: o.toplist.map((t) => ({
        value: t.topId,
        topId: t.topId,
        label: t.title,
        intro: Number(showDetail) ? t.intro : undefined,
        period: t.period,
        updateTime: t.updateTime,
        listenNum: t.listenNum,
        song: Number(showDetail) ? t.song : undefined,
        picUrl: t.headPicUrl,
      }))
    })),
  })
});

module.exports = router;
