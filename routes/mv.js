const express = require('express');
const router = express.Router();
const request  = require('../util/request');

// 获取 mv 信息
router.get('/', async (req, res) => {
  const { id, raw } = req.query;

  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空'
    })
  }

  const result = await request({
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      data: JSON.stringify({
        comm: {
          ct: 24,
          cv: 4747474
        },
        mvinfo: {
          module: "video.VideoDataServer",
          method: "get_video_info_batch",
          param: {
            vidlist: [ id ],
            required: ["vid","type","sid","cover_pic","duration","singers","video_switch","msg","name","desc","playcnt","pubdate","isfav","gmid"]
          },
        },
        other: {
          module: "video.VideoLogicServer",
          method: "rec_video_byvid",
          param: {
            vid :id,
            required: ["vid","type","sid","cover_pic","duration","singers","video_switch","msg","name","desc","playcnt","pubdate","isfav","gmid","uploader_headurl","uploader_nick","uploader_encuin","uploader_uin","uploader_hasfollow","uploader_follower_num"],
            support: 1
          }
        }
      })
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: {
        info: result.mvinfo.data[id] || {},
        recommend: result.other.data.list || [],
      }
    });
  }
});

// 获取 mv 链接
router.get('/url', async (req, res, next) => {

  const { id, raw } = req.query;

  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空',
    })
  }

  const result = await request({
    url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      data: JSON.stringify({
        getMvUrl: {
          module: "gosrf.Stream.MvUrlProxy",
          method: "GetMvUrls",
          param: {
            vids: id.split(','),
            request_typet: 10001
          }
        }
      }),
    }
  });

  if (Number(raw)) {
    return res.send(result);
  }

  const mvData = result.getMvUrl.data;
  Object.keys(mvData).forEach((vid) => {
    const mp4Arr = [];
    (mvData[vid].mp4 || []).forEach((obj) => {
      if (obj.freeflow_url && obj.freeflow_url.length > 0)
        mp4Arr.push(obj.freeflow_url[obj.freeflow_url.length - 1]);
    });
    mvData[vid] = mp4Arr;
  });

  res.send({
    result: 100,
    data: mvData,
  })
});

module.exports = router;
