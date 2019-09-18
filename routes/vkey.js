const express = require('express');
const router = express.Router();
const request = require('../util/request');
const StringHelper = require('../util/StringHelper');

router.get('/', async (req, res, next) => {
  const result = await request('http://u.y.qq.com/cgi-bin/musicu.fcg?data=%7B%22req_0%22%3A%7B%22module%22%3A%22vkey.GetVkeyServer%22%2C%22method%22%3A%22CgiGetVkey%22%2C%22param%22%3A%7B%22guid%22%3A%225339940689%22%2C%22songmid%22%3A%5B%220039MnYb0qxYhV%22%5D%2C%22songtype%22%3A%5B0%5D%2C%22uin%22%3A%22%22%2C%22platform%22%3A%2220%22%7D%7D%7D');
  const { vkey, guid } = StringHelper.getQueryFromUrl('', result.req_0.data.testfile2g);
  const sip = result.req_0.data.sip;
  res.send({
    data: {
      vkey,
      guid,
      domain: sip[0],
    },
    result: 100,
    success: true,
  })
});

module.exports = router;
