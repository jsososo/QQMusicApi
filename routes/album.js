const cheerio = require('cheerio');

const album = {
  // 专辑信息
  '/': async ({req, res, request}) => {
    const {albummid} = req.query;

    if (!albummid) {
      return res.send({
        result: 500,
        errMsg: 'albummid 不能为空',
      });
    }

    try {
      const pageInfo = await request(`https://y.qq.com/n/yqq/album/${albummid}.html`, {dataType: 'raw'});
      const $ = cheerio.load(pageInfo);
      let albumInfo = {};
      try {
        $('script').each((i, content) => {
          content.children.forEach(({data = ''}) => {
            if (data.includes('window.__USE_SSR__')) {
              const {detail} = eval(data.replace(/window\.__/g, 'window__'));
              albumInfo = {
                ...detail,
                name: detail.albumName,
                subTitle: detail.title,
                ar: detail.singer,
                mid: detail.albumMid,
                publishTime: detail.ctime,
              }
              delete albumInfo.singer;
              delete albumInfo.albumMid;
            }
          })
        })
      } catch (err) {
        console.log(err);
      }

      res.send({
        result: 100,
        data: albumInfo,
      })
    } catch (err) {
      res.send({
        result: 400,
        errMsg: err.message,
      })
    }

  },

  // 专辑的歌曲信息
  '/songs': async ({req, res, request}) => {
    const {raw, albummid} = req.query;

    if (!albummid) {
      return res.send({
        result: 500,
        errMsg: 'albummid 不能为空',
      });
    }
    const result = await request({
      url: 'https://u.y.qq.com/cgi-bin/musicu.fcg?g_tk=5381&format=json&inCharset=utf8&outCharset=utf-8',
      data: {
        data: JSON.stringify({
          comm: {
            ct: 24,
            cv: 10000
          },
          albumSonglist: {
            method: "GetAlbumSongList",
            param: {
              albumMid: albummid,
              albumID: 0,
              begin: 0,
              num: 999,
              order: 2
            },
            module: "music.musichallAlbum.AlbumSongList"
          }
        })
      }
    });

    if (Number(raw)) {
      return res.send(result);
    }

    const resData = {
      result: 100,
      data: {
        list: result.albumSonglist.data.songList.map((item) => item.songInfo),
        total: result.albumSonglist.data.totalNum,
        albummid: result.albumSonglist.data.albumMid,
      }
    };

    res && res.send(resData);
    return resData;
  }
};

module.exports = album

