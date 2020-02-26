# QQMusicApi

这是一个基于 Express + Axios 的 Nodejs 项目，一切仅供学习参考，该支持的还是要支持的，不然杰伦喝不起奶茶了。

其实有点点嫌弃qq音乐接口的数据格式，所以会对部分接口返回做一些处理，但是考虑到一些之前扒过接口的项目，有些人可能还是喜欢原汁原味，
可以在接口处增加一个参数 `raw=1` 。

对于所有处理过的返回数据，都会包含 `result`，`100` 表示成功，`500` 表示穿参错误，`400` 为 node 捕获的未知异常，`301` 表示缺少用户登陆的 cookie

灵感来源：[Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

## Start

```shell
$ git clone git@github.com:jsososo/QQMusicApi.git

$ npm install

$ npm start
```

项目默认端口为 3300

**在线接口测试网址：[http://api.qq.jsososo.com](http://api.qq.jsososo.com)**

## 用前须知

!> 该项目仅做接口转发，部分接口通过修改 `Referer` 实现，所有数据均不做存储处理，大家还是理性的保护好自己的个人信息，谨防诈骗

!> QQ音乐登陆的这个问题还是难绕过去，目前还是需要登陆并手动获取 [https://y.qq.com](https://y.qq.com) 的 `cookie`，注入网站或node，
如果又什么更好的解决办法，欢迎大家提 pr 给我

!> 另，可以通过 [qqmusic-cookie-porter](https://github.com/jsososo/qqmusic-cookie-porter) 这个 chrome 插件半自动获取 cookie

!> 本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为!
本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为!
本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为!

!> 接口仅作为测试或者方便听歌使用，发现有人使用其他服务大量的调用接口导致服务经常性挂掉重启，所以加入了ip检测和黑白名单机制，
想用的童鞋请自行clone走项目启动，我也没钱升级我的服务器了！！


## 更新记录

20-02-15：👍 新增评论操作相关接口

20-02-01：🥤 新增多个歌单操作相关接口

20-01-31：🐑 配合 chrome 插件自动获取存储 cookie

20-01-30：🍲 增加快速搜索接口、歌单、专辑、歌单、mv的评论获取

20-01-19：😢 [issue#9](https://github.com/jsososo/QQMusicApi/issues/9)

20-01-17：👑 更新歌曲链接的域名ip

20-01-09：🦈 反馈

20-01-07：🔫 歌单搜索接口修改

19-12-23：🦑 排行榜相关接口优化、新增相似歌曲、相关歌单、相关mv

19-12-18：🍒 批量获取歌曲信息、top排行榜数据优化

19-12-11：🚀 高频ip黑白名单

19-12-05：🏎️ 获取 mp3 和无损 ape、flac 等格式链接

19-11-14：🐄 排行榜

19-10-29：🐝 搜索歌手，专辑信息查询

19-10-15：👖 url 获取

19-10-10：🤬 热搜词、关注歌手、关注粉丝列表

19-09-23：🏊 歌单、mv 的分类获取

19-09-21：🚢 新增 MV 信息、根据分类筛选歌手、新碟推荐、新 MV 推荐

19-09-20：🐬 支持在线测试

19-09-20：🐫 新增 mv 接口，返回结果优化

19-09-19：🙀 评论、推荐、歌手接口

19-09-18：🐧 init

## 公用参数说明

!> 非常重要，特别是和登陆 cookie 有关的参数

1、`raw` 前面提到的，默认为 `0`, 如果传了非0参数，则表示使用原汁原味的数据结构

2、`ownCookie` 默认为 `0`，使用服务器上预存的 `cookie` 信息, 非0表示使用浏览器传过来的 `cookie`，如果不使用的话，部分接口会遇到 `301`，
如果该用户非 vip，也无法获取大部分歌曲的播放链接，我自己会不定时的更新这个服务器上（api.qq.jsososo.com）的 `cookie`作为登陆用户

## 接口文档

### ~vkey & guid 获取（已废弃，直接看下个接口）~

19-10-11，因为企鹅音乐修改了对音乐播放链接的获取，因此这个接口已没有意义，获取播放链接的参考下面的接口

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

### 播放链接

接口：`/song/urls`

参数：

`id`: 歌曲的 `songmid`，必填，多个用逗号分割，该接口可用 `post` 或 `get`

并不是所有的音乐都能获取到播放链接，如果是未登陆或非 vip 用户的 `cookie`，只能获取到非 vip 用户可听的歌曲，
其他像一些必须要购买数字专辑才能收听的歌曲，如果未购买也是无法获取的，无法获取到的播放链接则不会在返回的对象中出现，
这点需要大家自己做好兼容，我这里服务器会默认使用自己会员的 cookie，如果需要使用自己的 cookie，请参考上面文档

示例：[/song/urls?id=0039MnYb0qxYhV,004Z8Ihr0JIu5s](http://api.qq.jsososo.com/song/urls?id=0039MnYb0qxYhV,004Z8Ihr0JIu5s)

```javascript
// 晴天和七里香
{
  "data": {
    "0039MnYb0qxYhV": "http://ws.stream.qqmusic.qq.com/C400002202B43Cq4V4.m4a?guid=2796982635&vkey=0A1ADCEDC042ABE27FE184A3436DBB6F15AFF286F0F06DDFAEA9ADAF2D82F67EF33746A9472F62B444B7E7CEB32EE0D34DFD53A6E2D97D7B&uin=1899&fromtag=66",
    "004Z8Ihr0JIu5s": "http://ws.stream.qqmusic.qq.com/C4000012Ez0a1tFcOI.m4a?guid=2796982635&vkey=DB0E16676C581AE2E762FCA5D32FBB52454EA229C6BD58D9BA2976BA7CC3E49532EA299860E0F219148005848530335ABC254EC7A3374F80&uin=1899&fromtag=66"
  },
  "result": 100
}

```

### 下载链接

接口：`/song/url`

参数：

`id`: songmid

`type`: 默认 128 // 128：mp3 128k，320：mp3 320k，m4a：m4a格式 128k，flac：flac格式 无损，ape：ape格式 无损

`mediaId`: 这个字段为其他接口中返回的 strMediaId 字段，可不传，不传默认同 songmid，但是部分歌曲不传可能会出现能获取到链接，但实际404，
所以有条件的大家都传吧

这个接口跟上个接口一样，也是依赖服务器的 Cookie 信息的，不支持批量获取，不一定是全部的歌曲都有无损、高品的，
要注意结合 size320，sizeape，sizeflac 等参数先判断下是否有播放链接

示例：[/song/url?id=0039MnYb0qxYhV](http://api.qq.jsososo.com/song/url?id=0039MnYb0qxYhV)

### 搜索

#### 搜索
接口：`/search`

参数：

`key`: 关键词 必填

`pageNo`: 页码，默认 1

`pageSize`: 一页返回数量，默认 20

`t`: 搜索类型 默认为 0  // 0：单曲，2：歌单，7：歌词，8：专辑，9：歌手，12：mv

示例：[/search?key=周杰伦](http://api.qq.jsososo.com/search?key=周杰伦)

#### 获取热搜词

接口：`/search/hot`

示例：[/search/hot](http://api.qq.jsososo.com/search/hot)

返回示例：`k` 为热搜词，`n` 为搜索量

```javascript
{
  "result": 100,
  "data": [
    {
      "k": "PHOENIX 涅槃 ",
      "n": 440301
    },
    {
      "k": "嚣张 ",
      "n": 430912
    },
    ...
  ]
}
```

#### 快速搜索

接口: `/quick`

`key`: 关键词 必填

快速给出少量符合条件的歌曲、mv、专辑、歌手

示例：[/search/quick?key=周杰伦](http://api.qq.jsososo.com/search/quick?key=周杰伦)

### 查找音乐

#### 单个查找

接口：`/song/find`

参数：

`key`: 关键词

这个接口就像是简化版的搜索，根据关键词获取到搜出的第一个歌曲，不过他会直接带上播放链接，参数为 `url`，
如果没有则表示无法获取到播放链接。这个接口的作用是，对于其他平台的歌单如果需要获取到企鹅音乐的信息时，
可以通过 歌名 + 歌手 + 专辑 等关键词获取大致的歌曲，当然这是并不能保障稳定的。

示例：[/song/find?key=周杰伦%2f稻香](http://api.qq.jsososo.com/song/find?key=周杰伦%2f稻香)

#### 批量获取

接口：`/song/finds`

类型：仅支持`post`

参数：

`data`: 对象，`key` 为歌曲id，`value` 为搜索关键词

同样，并不是所有传过去的 id 都会有返回，没返回就是没有找到，返回的歌曲也都是会包含播放链接

示例：
```javascript
anxios({
	url: "/song/finds",
	method: "post",
	data: {
		298838: "笑忘书 王菲",
		abcdefg: "邮差 王菲"
	}
})

// 返回：

{
	data: {
		208838: obj,
		abcdefg: obj,
	},
	result: 100,
}

```


### 用户信息

#### 用户主页信息

!> 这个接口是需要登陆 cookie 才能获取的，不然会返回 301，所以如果有误需要考虑一下可能是 cookie 过期

接口：`/user/detail`

参数：

`id`: qq号 必填

返回中 `mymusic` 为喜欢的音乐，`mydiss` 为用户创建的歌单，需要注意的是，喜欢的音乐中的歌单id为 `id`，歌单中的歌单id为 `dissid`

示例：[/user/detail?id=123456](http://api.qq.jsososo.com/user/detail?id=123456)

#### 用户创建的歌单

接口：`/use/songlist`

参数：

`id`: qq号 必填

这个接口比上一个接口更纯粹，只获取创建的歌单，且数据结构更简单，非必须登陆 Cookie，但如果用户未公开主页时，只有本人的 Cookie 才能获取数据

示例：[/user/songlist?id=123456](http://api.qq.jsososo.com/user/songlist?id=123456)

### 歌单

#### 1、获取歌单详情

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

示例：[/songlist?id=2429907335](http://api.qq.jsososo.com/songlist?id=2429907335)

#### 2、获取歌单分类

接口：`/songlist/category`

这个接口没有参数，返回几种类型下的小分类 `id` 和 `name`，不同于歌手的筛选，搜索歌单时只能用一个 `id`，不能用且关系。

示例：[/songlist/category](http://api.qq.jsososo.com/songlist/category)

#### 3、根据分类获取歌单

接口：`/songlist/list`

参数

`pageSize`: 默认为 20

`pageNo`: 默认为1

`sort`: 默认是 5，// 5: 推荐，2: 最新，其他数字的排列值最后都会返回推荐

`category`: 分类 id，默认 10000000 （全部），其他值从上面的分类接口获取

示例：[/songlist/list](http://api.qq.jsososo.com/songlist/list)

#### 4、歌曲id、mid的哈希表

!> 这个接口强制使用浏览器传来的用户 Cookie 信息

接口：`/songlist/map`

参数：

`dirid`: 默认 201 我喜欢的歌单

这个接口只能获取用户自己创建的歌单且只会返回歌曲的 id 和 mid 的哈希表，不包含其他数据

#### 5、添加歌曲到歌单

!> 这个接口强制使用浏览器传来的用户 Cookie 信息

接口：`/songlist/add`

参数：

`mid`: 歌曲 mid 必填，多个用 , 分割

`dirid`: 必填

#### 6、从歌单中移除歌曲

!> 这个接口强制使用浏览器传来的用户 Cookie 信息

接口：`/songlist/remove`

参数：

`id`: 歌曲 id 必填，多个用 , 分割

`dirid`: 必填

与上一个添加接口不同，移除需要 `id` 不是 `mid`

#### 7、新建歌单

!> 这个接口强制使用浏览器传来的用户 Cookie 信息

接口：`/songlist/create`

参数：

`name`: 歌单名，不能为空

如果歌单名重复，也会报错

#### 8、删除歌单

!> 这个接口强制使用浏览器传来的用户 Cookie 信息

接口：`/songlist/delete`

参数：

`dirid`: 必填

### 歌曲信息

#### 单个获取

接口：`/song`

参数：

`songmid`: 必填

这个接口包含了很多的歌曲信息，包括歌手、专辑、语种、曲风等，但是不包含歌词，`songinfo.data.track_info.album.mid` 为专辑的 mid，
下面为专辑封面图片的路径，在搜索接口中也能获取到这个参数。

```
`https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg`
```

示例：[/song?songmid=0039MnYb0qxYhV](http://api.qq.jsososo.com/song?songmid=0039MnYb0qxYhV)

#### 批量获取

接口：`/song/batch`

参数：

`songmids`: 必填

这个接口本质为上一个接口的批量调用

示例：[/song/batch?songmids=001PLl3C4gPSCI,0039MnYb0qxYhV](http://api.qq.jsososo.com/song/batch?songmids=001PLl3C4gPSCI,0039MnYb0qxYhV)

#### 相似歌曲
接口：`/song/similar`

参数：

`id`: 歌曲 `songid` 必填

返回相似歌曲列表

示例：[/song/similar?id=5105986](http://api.qq.jsososo.com/song/similar?id=5105986)

#### 相关歌单
接口：`/song/playlist`

参数：

`id`: 歌曲 `songid` 必填

返回相关歌单列表

示例：[/song/playlist?id=5105986](http://api.qq.jsososo.com/song/playlist?id=5105986)

#### 相关MV
接口：`/song/mv`

参数：

`id`: 歌曲 `songid` 必填

返回相关mv列表

示例：[/song/mv?id=5105986](http://api.qq.jsososo.com/song/mv?id=5105986)

### 歌词

接口：`/lyric`

参数：

`songmid`: 必填

返回的接口中 `lyric` 和 `trans` 分别是歌词和翻译，转成了base64，这里node进行了解码。

示例：[/lyric?songmid=0039MnYb0qxYhV](http://api.qq.jsososo.com/lyric?songmid=0039MnYb0qxYhV)

示例：[/lyric?songmid=000b3wiQ3z0VbG](http://api.qq.jsososo.com/lyric?songmid=000b3wiQ3z0VbG)

### 推荐歌单

#### 1、为你推荐歌单

接口：`/recommend/playlist/u`

这个接口不需要参数，需要注意，和下面这个接口的数据格式不同

示例：[/recommend/playlist/u](http://api.qq.jsososo.com/recommend/playlist/u)

#### 2、按分类推荐歌单

接口：`/recommend/playlist`

参数：

`id`: 分类id，默认为 3317 // 3317: 官方歌单，59：经典，71：情歌，3056：网络歌曲，64：KTV热歌

`pageNo`: 页码，默认为 1

`pageSize`: 每页返回数量，默认为 20

示例：[/recommend/playlist](http://api.qq.jsososo.com/recommend/playlist)

### 最新推荐

#### 1、新歌推荐

接口：`/new/songs`,

参数：

`type`: 地区分类，默认为 0 // 0: 最新 1：内地，2：港台，3：欧美，4：韩国，5：日本

ps: 官方的接口其实不是这几个type，但是为了考虑与下面的新专和mv接口做兼容，所以做了改动

示例：[/new/songs](http://api.qq.jsososo.com/new/songs)

#### 2、新碟推荐（专辑）

接口：`/new/album`

参数：

`type`: 地区分类，默认为 1 // 1：内地，2：港台，3：欧美，4：韩国，5：日本，6：其他

`num`: 默认 10

这里和官方接口的参数是一致的

示例：[/new/album](http://api.qq.jsososo.com/new/album)

#### 3、新 MV 推荐

接口：`/new/mv`

参数：

`type`: 类型，默认为 0 // 0: 精选 1：内地，2：港台，3：欧美，4：韩国，5：日本

官方这个参数就更乱了，中英结合，还把日本拼成了 janpan，真是捉鸡

示例：[/new/mv](http://api.qq.jsososo.com/new/mv)

### 歌手

#### 1、歌手介绍

接口：`/singer/desc`

参数：

`singermid`: 必填

获取歌手的一些详细信息介绍

示例：[/singer/desc?singermid=0025NhlN2yWrP4](http://api.qq.jsososo.com/singer/desc?singermid=0025NhlN2yWrP4)

#### 2、获取热门歌曲

接口：`/singer/songs`

参数：

`singermid`: 必填

`num`: 返回歌曲数量

示例：[/singer/songs?singermid=0025NhlN2yWrP4](http://api.qq.jsososo.com/singer/songs?singermid=0025NhlN2yWrP4)

#### 3、获取歌手专辑

接口：`/singer/album`

参数：

`singermid`: 必填

`pageNo`: 默认 1

`pageSize`: 默认 20

示例：[/singer/album?singermid=0025NhlN2yWrP4](http://api.qq.jsososo.com/singer/album?singermid=0025NhlN2yWrP4)

#### 4、获取mv

接口：`/singer/mv`

参数：

`singermid`: 必填

`pageNo`: 默认 1

`pageSize`: 默认 20

示例：[/singer/mv?singermid=0025NhlN2yWrP4](http://api.qq.jsososo.com/singer/mv?singermid=0025NhlN2yWrP4)

#### 5、相似歌手

接口：`/singer/sim`

参数：

`singermid`: 必填

官方接口是有返回数量参数的，但是最多只返回10个，所以这里就写死返回 10 个

示例：[/singer/sim?singermid=0025NhlN2yWrP4](http://api.qq.jsososo.com/singer/sim?singermid=0025NhlN2yWrP4)

#### 6、获取歌手分类

接口：`/singer/category`

这个接口没有参数，会返回 地区：`area`，类型：`genre`，首字母：`index`，性别/组合：`sex` 这些分类项的各个数据

示例：[/singer/category](http://api.qq.jsososo.com/singer/category)

#### 7、根据分类获取歌手列表

接口：`/singer/list`

参数：

`area`: 地区，默认 -100

`genre`: 风格，默认 -100

`index`: 首字母，默认 -100

`sex`: 性别/组合，默认 -100

`pageNo`: 默认 1

这个接口固定返回 80 条信息

示例：[/singer/list](http://api.qq.jsososo.com/singer/list)

### 专辑

#### 1、获取专辑信息

接口：`/album`

参数：

`albummid`: 必填

示例：[/album?albummid=002MAeob3zLXwZ](http://api.qq.jsososo.com/album?albummid=002MAeob3zLXwZ)

#### 2、获取专辑内的歌曲

接口：`/album/songs`

参数：

`albummid`: 必填

示例：[/album/songs?albummid=002MAeob3zLXwZ](http://api.qq.jsososo.com/album/songs?albummid=002MAeob3zLXwZ)

### 评论

#### 1、获取评论

接口：`/comment`

参数：

`id`: singid, albumid, tid, topid, vid  必填

`pageNo`: 默认 1

`pageSize`: 默认 20

`type`: 默认 0  // 0：获取最新评论，1：获取热评

`biztype`: 获取评论类型 1: 歌曲 2: 专辑 3: 歌单 4: 排行榜 5: mv

当 `pageNo` 为 1 且 `type` 为 0 时，会返回15条热评 `hot_comment`

返回结果说明：`ispraise` 表示这条评论是否被赞过，1: 是，0: 否；`enable_delete` 表示这条评论是否能被删除，1: 是，0: 否

上述的判断以 cookie 中的 `uin` 账号为准

示例：[/comment?id=97773](http://api.qq.jsososo.com/comment?id=97773)

#### 2、发送评论

接口：`/comment/send`

类型：仅支持 post

该接口需要用户登陆 cookie

参数：

`id`: singid, albumid, tid, topid, vid  必填

`biztype`: 发送评论类型 1: 歌曲 2: 专辑 3: 歌单 4: 排行榜 5: mv

`content`: 评论内容，必填，不超过300字

#### 3、删除评论

接口：`/comment/del`

该接口需要用户登陆 cookie

参数：

`id`: commentid  必填

只要登陆情况下，一般这个接口返回的都是操作成功，不管 `id` 是否存真实在（是鹅厂这样返回的！）

#### 4、点赞评论

接口：`/comment/like`

该接口需要用户登陆 cookie

参数：

`id`: commentid  必填

`type`: 1：点赞，2：取消赞，默认 1

### 电台

#### 1、电台分类

接口：`/radio/category`

返回电台场景分类以及场景下的各个电台

示例：[/radio/category](http://api.qq.jsososo.com/radio/category)

#### 2、获取电台歌曲

接口：`/radio`

参数：

`id`: 电台id，从上面的分类接口中获取

获取电台中歌曲，其中个性电台需要登陆 cookie

示例：[/radio?id=568](http://api.qq.jsososo.com/radio?id=568)

### MV

#### 1、获取 MV 信息

接口：`/mv`

参数：

`id`: 视频的 vid，必填

返回 `info` 为 MV 信息，`recommend` 为相关推荐的 MV

示例：[/mv?id=t0032kwa29w](http://api.qq.jsososo.com/mv?id=t0032kwa29w)

#### 2、获取 MV 播放链接

接口：`/mv/url`

参数：

`id`: 视频的 vid , 必填，多个用,分割

返回的链接都是可以直接播放的完整mv视频

示例：[/mv/url?id=t0032kwa29w](http://api.qq.jsososo.com/mv/url?id=t0032kwa29w)

#### 3、获取 MV 分类

接口：`/mv/category`

和获取歌手分类接口类似

示例：[/mv/category](http://api.qq.jsososo.com/mv/category)

#### 4、根据分类获取 MV 列表

接口：`/mv/list`

参数

`pageNo`: 默认 1

`pageSize`: 默认 20

`area`: 地区，默认 15 全部，具体数值从上面分类接口获取

`version`: MV 类型，默认 7 全部，具体数值从上面分类接口获取

示例：[/mv/list](http://api.qq.jsososo.com/mv/list)

### 排行榜

#### 1、获取榜单列表

接口：`/top/category`

参数：

`showDetail`: 是否显示前三歌曲简单信息和榜单介绍，0，不显示，1 显示，默认 0

这个接口列出了几个榜单的分类，包含了榜单名、榜单 id、更新时间、播放量，（榜单介绍、前三歌曲非必传回）

示例：[/top/category](http://api.qq.jsososo.com/top/category)

#### 2、获取榜单详情

接口：`/top`

参数

`id`: 默认 4，从上面的列表中取值

`pageSize`: 默认 100 // 部分接口不支持这个字段，所以这里默认选择100

`period`: 榜单的时间，从上面的列表中取值，非必填

`time`: 默认当前时间，如果有 `period`，此参数无效

返回说明

`time`: 当前榜单的发布时间，可能是天，也可能是周

`timeType`: 当前榜单的时间格式 `YYYY_W` 或 `YYYY-MM-DD`

`rank`: 在榜单的排名

`rankType`: 1 上升，2 减少，3 持平，4 新歌，6 上升百分比

`rankValue`: 排名改变值

传入的 `time`、`period`并非必定与传回参数相同，比如，当榜单最新时间为 `2019_49`, 而传入 `period=2019_50`时，会返回 `2019_49`的榜单，
虽然这里不传或传入错误的 `period` 也会返回正确的数值，但是实际是通过第一次请求返回的结果来验证 `period` 是否正确，如果不正确会再进行第二次请求，
因此会造成返回的比较慢，尽量都传入上一个接口中返回的 `period`


### 关注、粉丝

#### 1、获取关注的歌手列表

接口：`/user/follow/singers`

该接口需要用户登陆 cookie

参数

`pageNo`: 默认 1

`pageSize`: 默认 20

`id`: 用户的 qq 号，默认为当前登陆用户

#### 2、获取关注的用户列表

接口：`/user/follow/users`

该接口需要用户登陆 cookie

参数

`pageNo`: 默认 1

`pageSize`: 默认 20

`id`: 用户的 qq 号，默认为当前登陆用户

#### 3、获取用户的粉丝列表

接口：`/user/fans`

该接口需要用户登陆 cookie

参数

`pageNo`: 默认 1

`pageSize`: 默认 20

`id`: 用户的 qq 号，默认为当前登陆用户

#### 4、关注/取消关注 歌手

接口：`/user/follow`

该接口需要用户登陆 cookie

`singermid`: 关注的歌手 mid，必填

`operation`: 操作，1：关注，2：取消关注，默认为 1

### 接口调用统计

接口的数据统计包含系统、ip、路径、浏览器等信息，已经忽略掉 node 接口自身调用的情况，数据为用 json 方式存储 （我会说是因为我不会用数据库嘛
`/data` 下还包含了很多其他接口，不过大部分都是用户不需要的，给管理员调用的，所以大家在源码里自己探索吧

#### 1、获取数据统计

接口： `/data`

参数

`type`: 默认 ip，可选：ip, browser, browserVersion, os, osVersion, path, url, host

`startTime`: 默认当前时间

`endTime`: 默认当前时间

这个接口会返回各个数据的统计结果
