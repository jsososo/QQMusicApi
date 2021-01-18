const request  = require('../util/request');
const json2html = require('node-json2html');

let template_table_header = {
    "<>": "tr", "html": [
        {"<>": "th", "html": "序号"},
        {"<>": "th", "html": "歌名"},
        {"<>": "th", "html": "巅峰指数"},
        {"<>": "th", "html": "收听人数"},
        {"<>": "th", "html": "总收听量"}
    ]
}

let template_table_body = {
    "<>": "tr", "html": [
        {"<>": "td", "html": "${index}"},
        {"<>": "td", "html": "${name}"},
        {"<>": "td", "html": "${score}"},
        {"<>": "td", "html": "${listenCnt}"},
        {"<>": "td", "html": "${listen_count}"}
    ]
}

function writeHtmlFromScoresJson(data) {

    const date = new Date();
    let table_header = json2html.transform(data.details[0], template_table_header);
    let table_body = json2html.transform(data.details, template_table_body);

    let header = `<!DOCTYPE html>
                        <html>
                            <head>
                                <title>周深QQ音乐数据</title>
                                <meta charset="utf-8">
                                <style>
                                    table {
                                        font-family: arial, sans-serif;
                                        border-collapse: collapse;
                                        width: 100%;
                                    }

                                    title, h1, p {
                                        font-family: arial, sans-serif;
                                    }
                                    td, th {
                                        border: 1px solid #dddddd;
                                        text-align: left;
                                        padding: 8px;
                                    }

                                    tr:nth-child(even) {
                                        background-color: #dddddd;
                                    }
                                </style>
                            </head>`;
    let body = `<h1>周深QQ音乐数据</h1>
                <p>时间：${date.toLocaleString('zh-CN')}</p>
                <p>粉丝总数：${data.fans}</p>
                <p>过去24小时总收听人数：${data.totalListenCount}</p><br>
                <p>累计收听量Top20 (收听人数为过去24小时；总收听量统计方法未知，推测为过去7-10天累计)：</p>
                <table id="my_table"><thead>${table_header}</thead><tbody>${table_body}</tbody></table>`;
    body = `<body>${body}</body>`

    let html = header + body + '</html>';

    return html;
}

module.exports = {

    '/hotsongs': async (req, res) => {
        const singermid = '003fA5G40k6hKc';
        const { num = 20, page = 1 } = req.query;
        const { cache } = global;
        let cacheKey = `zs_${num}_${page}`;
        let cacheData = cache.get(cacheKey)

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
            picked.index = index+1;
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
        //res.send(cacheData);
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });

        let html = writeHtmlFromScoresJson( cacheData.data );
        res.end(html);
        cache.set(cacheKey, html);
  }
}
