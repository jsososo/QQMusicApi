var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'QQ 音乐 api', content: '<a href="http://jsososo.gihub.io/QQMusicApi">查看文档</a>' });
});

module.exports = router;
