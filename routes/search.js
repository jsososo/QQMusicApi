const express = require('express');
const request = require('../util/request');
const router = express.Router();

router.get('/', async (req, res) => {
  let {
    pageNo = 1,
    pageSize = 20,
    key,
    t = 0, // 0：单曲，2：歌单，7：歌词，8：专辑，12：mv
    raw,
  } = req.query;
  let total = 0;

  if (!key) {
    return res.send({
      result: 500,
      errMsg: '关键词不能为空',
    });
  }

  const url = {
    2: 'http://c.y.qq.com/soso/fcgi-bin/client_music_search_songlist',
    // 3: 'http://c.y.qq.com/soso/fcgi-bin/client_search_user',
  }[t] || 'http://c.y.qq.com/soso/fcgi-bin/client_search_cp';

  const typeMap = {
    0: 'song',
    2: 'songlist',
    7: 'lyric',
    8: 'album',
    12: 'mv',
  };

  if (!typeMap[t]) {
    return res.send({
      result: 500,
      errMsg: '搜索类型错误，检查一下参数 t'
    })
  }

  let data = {
    format: 'json', // 返回json格式
    n: pageSize, // 一页显示多少条信息
    p: pageNo, // 第几页
    w: key, // 搜索关键词
    cr: 1, // 不知道这个参数什么意思，但是加上这个参数你会对搜索结果更满意的
    t,
  };

  if (Number(t) === 2) {
    data = {
      query: key,
      page_no: pageNo - 1,
      num_per_page: pageSize,
    }
  }

  const result = await request({
    url,
    method: 'get',
    data,
    headers: {
      Referer: 'https://y.qq.com'
    }
  });

  if (Number(raw)) {
    return res.send(result);
  }

  // 下面是数据格式的美化
  const { keyword } = result.data;
  const keyMap = {
    0: 'song',
    2: '',
    7: 'lyric',
    8: 'album',
    12: 'mv',
  };
  const searchResult = (keyMap[t] ? result.data[keyMap[t]] : result.data) || [];
  const { list, curpage, curnum, totalnum, page_no, num_per_page, display_num } = searchResult;

  switch (Number(t)) {
    case 2:
      pageNo = page_no + 1;
      pageSize = num_per_page;
      total = display_num;
      break;
    default:
      pageNo = curpage;
      pageSize = curnum;
      total = totalnum;
      break;
  }
  res.send({
    result: 100,
    data: {
      list,
      pageNo,
      pageSize,
      total,
      key: keyword || key,
      t,
      type: typeMap[t],
    }
  });
});

module.exports = router;
