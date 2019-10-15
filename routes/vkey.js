const express = require('express');
const router = express.Router();
const request = require('../util/request');
const StringHelper = require('../util/StringHelper');

router.get('/', async (req, res, next) => {
  const { id = '0039MnYb0qxYhV' } = req.query;

  let [ vkey, guid, url, sip ] = ['', '', '', null];
  let r = null;

  const queryVkey = async () => {
    const result = await request(`https://u.y.qq.com/cgi-bin/musicu.fcg?-=getplaysongvkey2682247447678878&g_tk=5381&loginUin=956581739&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0&data=%7B%22req_0%22%3A%7B%22module%22%3A%22vkey.GetVkeyServer%22%2C%22method%22%3A%22CgiGetVkey%22%2C%22param%22%3A%7B%22guid%22%3A%222796982635%22%2C%22songmid%22%3A%5B%22${id}%22%5D%2C%22songtype%22%3A%5B0%5D%2C%22uin%22%3A%22956581739%22%2C%22loginflag%22%3A1%2C%22platform%22%3A%2220%22%7D%7D%2C%22comm%22%3A%7B%22uin%22%3A956581739%2C%22format%22%3A%22json%22%2C%22ct%22%3A24%2C%22cv%22%3A0%7D%7D`);
    const obj = StringHelper.getQueryFromUrl('', result.req_0.data.testfile2g || result.req_0.data.testfilewifi);
    vkey = obj.vkey;
    guid = obj.guid;
    url = result.req_0.data.testfilewifi;
    sip = result.req_0.data.sip;
    r = result;
  };

  let count = 0;
  while (!vkey && count < 10) {
    count += 1;
    await queryVkey();
  }

  res.send({
    data: {
      vkey,
      guid,
      url: `${sip[1]}${url}`,
      domain: sip[0],
      r,
    },
    result: 100,
    success: true,
  })
});

module.exports = router;
