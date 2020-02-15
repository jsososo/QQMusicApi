const express = require('express');
const router = express.Router();
const request  = require('../util/request');

const handleResult = (res, result, errMsg, successMsg) => {
  if (result.code === 1000) {
    return res.send({
      result: 301,
      errMsg: '未登陆',
    })
  } else if (result.code) {
    return res.send({
      result: 200,
      errMsg: result.msg || errMsg,
    })
  } else {
    return res.send({
      result: 100,
      data: successMsg,
    })
  }
}

router.get('/', async (req, res) => {
  const { id, pageNo = 1, pageSize = 20, type = 0, raw, biztype = 1 } = req.query;
  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空',
    });
  }

  const result = await request({
    url: 'http://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg',
    data: {
      biztype,
      topid: id,
      loginUin: req.cookies.uin,
      cmd: {
        1: [8, 6], // 歌曲
        2: [8, 9], // 专辑
        3: [8, 9], // 歌单
        4: [8, 9], // 排行榜
        5: [8, 6], // mv
      }[biztype][type],
      pagenum: pageNo - 1,
      pagesize: pageSize,
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: {
        comment: result.comment,
        hotComment: result.hot_comment,
        name: result.topic_name,
      },
    })
  }
});

// 发送评论
router.post('/send', async (req, res) => {
  const { id, biztype, content } = req.query;
  if (!id || !biztype || !content) {
    return res.send({
      result: 500,
      errMsg: '看看是不是什么参数不对！',
    })
  }
  if (content.length > 300) {
    return res.send({
      result: 500,
      errMsg: '话有点多了！300以内！',
    })
  }
  req.query.ownCookie = 1;
  const result = await request({
    url: 'https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg',
    data: {
      g_tk: 1157392233,
      loginUin: req.cookies.uin,
      hostUin: 0,
      format: 'json',
      inCharset: 'utf8',
      outCharset: 'GB2312',
      cmd: 1,
      reqtype: 2,
      biztype,
      topid: id,
      content: encodeURIComponent(content),
    },
    headers: {
      Referer: 'https://y.qq.com',
    },
  });

  handleResult(res, result, '反正是发送失败了', {
    message: '发送成功',
    newCommentId: result.newcommentid,
  });
});

// 删除评论
router.get('/del', async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id ?'
    })
  }
  req.query.ownCookie = 1;
  const result = await request({
    url: 'https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg',
    data: {
      g_tk: 1157392233,
      loginUin: req.cookies.uin,
      hostUin: 0,
      format: 'json',
      inCharset: 'utf8',
      outCharset: 'GB2312',
      cmd: 3,
      commentid: id,
    }
  });

  handleResult(res, result, '反正是删除失败了', '删除成功');
});

router.get('/like', async (req, res) => {
  const { id, type = 1 } = req.query;
  req.query.ownCookie = 1;
  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id ?'
    })
  }
  const result = await request({
    url: 'https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_praise_h5.fcg',
    data: {
      g_tk: 1157392233,
      loginUin: req.cookies.uin,
      format: 'json',
      inCharset: 'utf8',
      outCharset: 'GB2312',
      cmd: type,
      reqtype: 2,
      commentid: id,
    }
  });
  handleResult(res, result, '反正是操作失败了', '操作成功');
});

module.exports = router;
