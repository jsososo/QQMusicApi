/* GET home page. */
module.exports = {
  '/': ({res}) => {
    res.render('index', {title: 'QQ 音乐 api', content: '<a href="http://jsososo.gihub.io/QQMusicApi">查看文档</a>'});
  }
}
