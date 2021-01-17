const request  = require('../util/request');

module.exports = {
    '/hotsongs': async (req, res) => {
        const singermid = '003fA5G40k6hKc';
        const { num, page = 1 } = req.query;
        const { cache } = global;
        let cacheKey = `zs_${num}_${page}`;
        let cacheData = cache.get(cacheKey)
        if (cacheData) {
            return res.send(cacheData);
        }

        // get top 20 hot songs
        const result = await request({
            url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
            data: {
                data: JSON.stringify({
                comm: {
                    ct: 24,
                    cv: 0
                },
                singer: {
                    method: "get_singer_detail_info",
                    param: {
                    sort: 5,
                    singermid,
                    sin:  (page - 1) * num,
                    num,
                    },
                    module: "music.web_singer_info_svr"
                }
                })
            }
        });
    
        const { songlist: list, extras } = result.singer.data;
        list.forEach((o, i) => {
            Object.assign(o, extras[i] || {});
        });

        const songMidList = list.map( song => {
            return song.mid;
        })

        //get hit info
        const hitInfo = await request({
            url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
            data: {
                data: JSON.stringify({
                comm: {
                    ct: 24,
                    cv: 0
                },
                singer: {
                    method: "GetPlayTopData",
                    param: {
                    songMidList,
                    },
                    module: "music.musicToplist.PlayTopInfoServer"
                }
                })
            }
        });

        let totalListenCount = 0;
        const details = list.map( ( song, index ) => {
            const picked = (({ mid, name, listen_count }) => ({ mid, name, listen_count }))(song);
            const { record, score, listenCnt } = hitInfo.singer.data.data[song.mid] || {};
            picked.record = record ? record.data : undefined;
            picked.score = score;
            picked.listenCnt = listenCnt;
            picked.index = index;
            if( listenCnt ) {
                let [ count ] = listenCnt.match(/\d+/g);
                totalListenCount += parseInt( count );
            }
            return picked;
        });
        cacheData = {
            result: details.length,
            data: {
                totalListenCount: totalListenCount + 'w+',
                fans: result.singer.data.singer_info.fans,
                details,
            }
        };
        res.send(cacheData);
        cache.set(cacheKey, cacheData);
  }
}
