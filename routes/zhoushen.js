const request  = require('../util/request');
const json2html = require('node-json2html');

let template_table_header = {
    "<>": "tr", "html": [
        {"<>": "th", "html": "序号"},
        {"<>": "th", "html": "歌名"},
        {"<>": "th", "html": "总收听量"},
        {"<>": "th", "html": "巅峰指数"},
        {"<>": "th", "html": "收听人数"}
    ]
}

let template_table_body = {
    "<>": "tr", "html": [
        {"<>": "td", "html": "${index}"},
        {"<>": "td", "html": "${name}"},
        {"<>": "td", "html": "${listen_count}"},
        {"<>": "td", "html": "${score}"},
        {"<>": "td", "html": "${listenCnt}"}
    ]
}

function writeHtmlFromJson(data) {
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
                <p>时间：${data.date}</p>
                <p>粉丝总数：${data.fans}</p>
                <p>过去24小时总收听人数：${data.totalListenCount}</p><br>
                <p>累计收听量Top${data.details.length} (收听人数为过去24小时；总收听量统计方法未知，推测为过去7-10天累计)：</p>
                <table id="my_table"><thead>${table_header}</thead><tbody>${table_body}</tbody></table>`;
    body = `<body>${body}</body>`

    let html = header + body + '</html>';

    return html;
}

async function _getHitSongs ( { singermid='003fA5G40k6hKc', num=20, page=1 } ) {
    return request({
        url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
        data: {
            data: JSON.stringify({
            comm: {
                ct: 24,
                cv: 0
            },
            singer: {
                method: "get_singer_detail_info",
                module: "music.web_singer_info_svr",
                param: {
                    sort: 5,
                    singermid,
                    sin:  (page - 1) * num,
                    num,
                }
            }
            })
        }
    });
}
async function _getHitInfo(param) {
    return request({
        url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
        data: {
            data: JSON.stringify({
                comm: {
                    ct: 24,
                    cv: 0
                },
                singer: {
                    method: "GetPlayTopData",
                    module: "music.musicToplist.PlayTopInfoServer",
                    param
                }
            })
        }
    })
}

function _getReportData({ hitSongs, hitInfo }) {
    let totalListenCount = 0;
    const { songlist, extras } = hitSongs.singer.data;
    
    songlist.forEach((o, i) => {
        // add total play count into result body
        Object.assign(o, extras[i] || {});
    });
    const details = songlist.map( ( song, index ) => {
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
    data = {
        date: ( new Date() ).toLocaleString('zh-CN'),
        totalListenCount: totalListenCount + 'w+',
        fans: hitSongs.singer.data.singer_info.fans,
        details,
    };
    return data;
}
module.exports = {

    '/hitsongs': async (req, res) => {
        const hitSongs = await _getHitSongs( req.query );
        const songMidList = hitSongs.singer.data.songlist.map( song => song.mid);
        const hitInfo = await _getHitInfo({ songMidList });
        const html = writeHtmlFromJson( _getReportData( { hitSongs, hitInfo } ) );
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(html);
  }
}
