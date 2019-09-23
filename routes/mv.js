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

// 获取 mv 分类
router.get('/category', async (req, res) => {
  const { raw } = req.query;
  const result = await request({
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      data: JSON.stringify({"comm":{"ct":24},"mv_tag":{"module":"MvService.MvInfoProServer","method":"GetAllocTag","param":{}}}),
    },
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    res.send({
      result: 100,
      data: result.mv_tag.data,
    });
  }
});

// 根据分类获取 mv 列表
router.get('/list', async (req, res) => {
  const { raw, pageNo = 1, pageSize = 20, version = 7, area = 15 } = req.query;
  const result = await request({
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    data: {
      data: JSON.stringify({
        comm: {
          ct: 24
        },
        mv_list: {
          module: "MvService.MvInfoProServer",
          method: "GetAllocMvInfo",
          param: {
            start: (pageNo - 1) * pageSize,
            size: pageSize / 1,
            version_id: version / 1,
            area_id: area / 1,
            order: 1
          }
        }
      }),
    }
  });

  if (Number(raw)) {
    res.send(result);
  } else {
    const { list, total } = result.mv_list.data;
    res.send({
      reuslt: 100,
      data: {
        list,
        total,
        area: area / 1,
        version: version / 1,
        pageNo: pageNo / 1,
        pageSize: pageSize / 1,
      },
    })
  }
});

module.exports = router;
