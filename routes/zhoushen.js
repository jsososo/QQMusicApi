const request  = require('../util/request');
const moment = require('moment-timezone');

function _getTableBody( data ) {
    const transformed = data.map( ({index, name, favCount, weeklyListenCount, score='无数据', hitListenCount='无数据' }) => {
        return `<li class="list-li">
            <span class="list-span index">${index}</span>
            <span class="list-span song">${name}</span>
            <span class="list-span song">${favCount}</span>
            <span class="list-span song">${weeklyListenCount}</span>
            <span class="list-span song">${score}</span>
            <span class="list-span last">${hitListenCount}</span>
        </li>`;
    });
    return transformed.join('\n');
}
function writeHtmlFromJson(data) {
    const listHeader = `<ul class="list-ul list-title">
                            <li class="list-li">
                                <span class="list-span index">序号</span>
                                <span class="list-span song">歌曲</span>
                                <span class="list-span song">收藏</span>
                                <span class="list-span song">总收听</span>
                                <span class="list-span song">巅峰指数</span>
                                <span class="list-span last">收听人数</span>
                            </li>
                        </ul>`;
    let listBody = _getTableBody( data.details );
    let header = `<!DOCTYPE html>
                        <html>
                            <head>
                                <title>周深QQ音乐数据</title>
                                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                                <style>
                                    * {
                                        box-sizing: border-box;
                                        font-family: "microsoft yahei", arial, sans-serif;
                                    }
                                    
                                    body {
                                        margin: 0;
                                        padding: 0;
                                    }
                                    
                                    /*light skin*/
                                    
                                    .scroll-skin-light::-webkit-scrollbar {
                                        width: 4px;
                                        height: 4px;
                                        background-color: #f5f5f5;
                                    }
                                    
                                    .scroll-skin-light::-webkit-scrollbar-track {
                                        border-radius: 2px;
                                        background-color: #f5f5f5;
                                    }
                                    
                                    .scroll-skin-light::-webkit-scrollbar-thumb {
                                        border-radius: 2px;
                                        background-color: #d5e3ff;
                                    }
                                    
                                    
                                    .content {
                                        /*padding: 20px;*/
                                    }
                                    
                                    .title {
                                        font-size: 16px;
                                        background: rgb(102, 146, 228);
                                        border-radius: 0 0 15px 15px;
                                        line-height: 50px;
                                        padding: 0 20px;
                                        color: #fff;
                                        /*font-family: "microsoft yahei";*/
                                    }
                                    .ad {
                                        font-size: 16px;
                                        padding: 0 20px;
                                        color: rgb(102, 146, 228);
                                    }
                                    
                                    .time,
                                    .fans,
                                    .num {
                                        text-align: right;
                                        margin: 10px 20px;
                                        font-size: 14px;
                                        color: rgb(102, 146, 228);
                                    }
                                    
                                    .table-title {
                                        font-size: 16px;
                                        margin: 0 0 0 20px;
                                        color: rgb(102, 146, 228);
                                    }
                                    
                                    .title-tip {
                                        font-size: 12px;
                                        color: #B2D4FF;
                                        padding: 0 20px;
                                    }
                                    
                                    .list-ul {
                                        padding: 0;
                                        margin: 0;
                                        height: auto;
                                        /**/
                                    }
                                    .list-title{
                                        border-top:1px solid #B2D4FF;
                                    }
                                    .list-title .list-span{
                                        color: rgb(102, 146, 228);
                                    }
                                    .list-li {
                                        list-style: none;
                                        border-bottom: 1px solid #B2D4FF;
                                        line-height: 40px;
                                        font-size: 16px;
                                        color: #565656;
                                    }
                                    .list-li:nth-child(even){
                                        color: #fff;
                                        background:rgb(102, 146, 228) ;
                                    }
                                    .list-li::after {
                                        content: '';
                                        display: table;
                                        clear: both;
                                    }
                                    
                                    .list-span{
                                        float: left;
                                        display: block;
                                        border-right: 1px solid #B2D4FF;
                                        padding: 0 10px;
                                        height: 40px;
                                        overflow: hidden;
                                        text-align: center;
                                    }
                                    .index{
                                        width: 80px;
                                    }
                                    .song{
                                        width: calc(25% - 45px);
                                        text-overflow: ellipsis;
                                    }
                                    .last{
                                        width: 100px;
                                        
                                    }
                                    .list-span:last-child{
                                        border-right: none;
                                    }
                                </style>
                            </head>`;
    const body = `<body class="scroll-skin-light">
                    <div class="content">
                    <div class="title">Charlie's hit songs on QQ music</div>
                    <div class="ad">广告位：<a class="ad" href="https://www.douban.com/group/696317">欢迎加入：豆瓣小组 辣锅纯辣锅🔥</a></div>
                    <p class="time">中国时间：${data.date}</p>
                    <p class="fans">粉丝总数：${data.fans}</p>
                    <p class="num">过去24小时总收听人数：${data.totalListenCount}</p><br>
                    <p class="title-tip">累计收听量Top${data.details.length} (巅峰指数、收听人数为过去24小时数据；总收听量统计方法未知，推测为过去7-10天累计)：</p>

                    ${listHeader}
                    <ul class="list-ul" id="my_table">
                        ${listBody}
                    </ul>
                </body>`;
    const footer = `<footer>
                        <p class="ad">灵感来源：<a class="ad" href="https://github.com/jsososo/QQMusicApi">jsososo/QQMusicApi</a></p>
                    </footer>`
    let html = header + body + footer + '</html>';

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
async function _getHitInfo(songMidList) {

    const requestCount = songMidList.length/10;
    const lists = [];
    for(let i=0; i<requestCount; i++ ) {
        lists.push(songMidList.slice(i*10, i*10+9));
    }

    const results = await Promise.all(lists.map(async (list) => {
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
                        param: {
                            songMidList: list
                        }
                    }
                })
            }
        });
    }));

    return results.reduce((val, cur) => {
        if(cur && cur.singer) {
            return Object.assign(val, cur.singer.data.data);
        }
    },{});
}
async function _getFavInfo(param) {
    const result = await request({
        url: 'http://u.y.qq.com/cgi-bin/musicu.fcg',
        data: {
            data: JSON.stringify({
                comm: {
                    ct: 24,
                    cv: 0
                },
                singer: {
                    method: "GetSongFansNumberById",
                    module: "music.musicasset.SongFavRead",
                    param
                }
            })
        }
    })
    return result.singer.data.m_numbers;
}
function _getReportData({ hitSongs, hitInfo, favInfo }) {
    let totalListenCount = 0;
    const { songlist, extras } = hitSongs.singer.data;
    
    songlist.forEach((o, i) => {
        // add total play count into result body
        Object.assign(o, extras[i] || {});
    });
    const details = songlist.map( ( song, index ) => {
        const formatted = (({ mid, name, listen_count:weeklyListenCount }) => ({ mid, name, weeklyListenCount }))(song);
        const { record, score, listenCnt } = hitInfo[song.mid] || {};
        formatted.record = record ? record.data : undefined;
        formatted.score = score;
        formatted.hitListenCount = listenCnt;
        formatted.index = index+1;
        if( listenCnt ) {
            let [ count ] = listenCnt.match(/\d+/g);
            totalListenCount += parseInt( count );
        }
        formatted.favCount = favInfo[song.id];
        return formatted;
    });
    data = {
        date: moment().tz('Asia/Shanghai').format(),
        totalListenCount: totalListenCount + 'w+',
        fans: hitSongs.singer.data.singer_info.fans,
        details,
    };
    return data;
}
module.exports = {

    '/hitsongs': async (req, res) => {
        const hitSongs = await _getHitSongs( req.query );
        const songIdList = hitSongs.singer.data.songlist.map( song => song.id);
        const songMidList = hitSongs.singer.data.songlist.map( song => song.mid);
        const [ hitInfo, favInfo ] = await Promise.all([_getHitInfo(songMidList), _getFavInfo({ v_songId: songIdList })]);
        const data = _getReportData( { hitSongs, hitInfo, favInfo } );
        if( req.query.format === 'json' ) {
            return res.send({
                data,
                result: data.details.length
            })
        }
        const html = writeHtmlFromJson( data );
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(html);
    }
}
