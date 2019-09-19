# QQMusicApi

这是一个基于 Express + Axios 的 Nodejs 项目，一切仅供学习参考，该支持的还是要支持的，不然杰伦喝不起奶茶了。

其实有点点嫌弃qq音乐接口的数据格式，但是考虑到一些之前扒过接口的项目，还是打算原汁原味，不做处理啦。

灵感来源：[Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

## Start

```shell
$ git clone git@github.com:jsososo/QQMusicApi.git

$ npm install

$ npm start
```

项目默认端口为 3300

## 用前须知

!> 该项目仅做接口转发，部分接口通过修改 `Referer` 实现，所有数据均不做存储处理，大家还是理性的保护好自己的个人信息，谨防诈骗

!> QQ音乐登陆的这个问题还是难绕过去，目前还是需要登陆并手动获取 [https://y.qq.com](https://y.qq.com) 的 `cookie`，注入网站或node，
如果又什么更好的解决办法，欢迎大家提 pr 给我

!> 本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为!
本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为!
本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为


## 更新记录

19-09-18：🐧 init

## 接口文档

### vkey & guid 获取

先介绍 vkey 和 guid 的获取，因为这是拼凑音乐链接的关键，也是播放音乐的核心一步

接口：`/vkey`

返回示例：
```javascript
{
  "data": {
    "vkey": "78159670DE0BF35ABEF86841070FDA6818BC95FB25E5C983547E9D29C9803D30971A3500E2D85D5204848BDC4E3E130BE9FCC63EB73F0F47",
    "guid": "5339940689",
    "domain": "http://ws.stream.qqmusic.qq.com/"
  },
  "result": 100,
  "success": true
}
```

下面是不同格式的音乐对应的 url 拼接，可稳定获取128k的播放链接，但是高品质会被403，还在摸索中。。。

```javascript
// content 参数里面的文件类型可以用在下载的时候，后端将歌曲转成流，并标注返回的类型（content）
const formatMap = {
          size128: {
            val: '128k',
            s: 'M500',
            e: '.mp3',
            content: 'audio/mpeg',
          },
          size320: {
            val: '320k',
            s: 'M800',
            e: '.mp3',
            content: 'audio/mpeg',
          },
          sizeape: {
            val: '无损ape',
            s: 'A000',
            e: '.ape',
            content: 'audio/ape',
          },
          sizeflac: {
            val: '无损flac',
            s: 'F000',
            e: '.flac',
            content: 'audio/x-flac',
          }
        }
      }
const format = 'size320';
const { s, e } = formatMap[format];

// 注意是 strMediaMid 不是 songid, 也不是 songmid，付费歌曲的strMediaMid 和 songmid 不同，非付费歌曲相同
const url = `${domain}${s}${strMediaMid}${e}?guid=${guid}&vkey=${vkey}&fromtag=8&uin=0`
```

### 搜索

接口：`/search`

参数：

`key`: 关键词 必填

`pageNo`: 页码，默认 1

`pageSize`: 一页返回数量，默认 20

`t`: 搜索类型 // 0: 单曲，8 专辑； 默认 0

### 用户信息

!> 这个接口是需要登陆 cookie 才能获取的，不然会返回 301，所以如果有误需要考虑一下可能是 cookie 过期

接口：`/user/detail`

参数：

`id`: qq号 必填

返回中 `mymusic` 为喜欢的音乐，`mydiss` 为用户创建的歌单，需要注意的是，喜欢的音乐中的歌单id为 `id`，歌单中的歌单id为 `dissid`

### 获取歌单详情

接口：`/songlist`

参数：
`id`: 歌单id 必填

返回说明：

这些表示各种码率对应的文件大小，如果为0则表示该格式的文件不存在
```javascript
{
  "size128": 1922927,
  "size320": 4803503,
  "sizeape": 10810010,
  "sizeflac": 10827560,
}
```

### 歌曲信息

接口：`/song`

参数：

`songmid`: 必填

这个接口包含了很多的歌曲信息，包括歌手、专辑、语种、曲风等，但是不包含歌词，`songinfo.data.track_info.album.mid` 为专辑的 mid，
下面为专辑封面图片的路径，在搜索接口中也能获取到这个参数。

```
"https://y.gtimg.cn/music/photo_new/T002R300x300M000" + mid
```
### 歌词

接口：`/lyric`

参数：

`songmid`: 必填

返回的接口中 `lyric` 和 `trans` 分别是歌词和翻译，转成了base64，这里node进行了解码。

### 推荐歌单

#### 1、为你推荐歌单

接口：`/recommend/playlist/u`

这个接口不需要参数，需要注意，和下面这个接口的数据格式不同

#### 2、按分类推荐歌单

接口：`/recommend/playlist`

参数：

`id`: 分类id，默认为 3317 // 3317: 官方歌单，59：经典，71：情歌，3056：网络歌曲，64：KTV热歌

`pageNo`: 页码，默认为 1

`pageSize`: 每页返回数量，默认为 20

### 新歌推荐

接口：`/new/songs`,

参数：

`type`: 新歌分类，默认为 5 // 5：最新，1：内地，6：港台，2：欧美，4：韩国，3：日本

### 歌手

#### 1、歌手介绍

接口：`/singer/desc`

参数：

`singermid`: 必填

获取歌手的一些详细信息介绍

#### 2、获取歌手专辑

接口：`/singer/album`

参数：

`singermid`: 必填

`pageNo`: 默认 1

`pageSize`: 默认 20

#### 3、相似歌手

接口：`/singer/sim`

参数：

`singermid`: 必填

官方接口是有返回数量参数的，但是最多只返回10个，所以这里就写死返回 10 个

### 获取评论

接口：`/comment`

参数：

`id`: singid 必填

`pageNo`: 默认 1

`pageSize`: 默认 20

`type`: 默认 0  // 0：获取最新评论，1：获取热评

当 `pageNo` 为 1 且 `type` 为 0 时，会返回15条热评 `hot_comment`