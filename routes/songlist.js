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

module.exports = router;
