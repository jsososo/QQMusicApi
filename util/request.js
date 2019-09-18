const axios = require('axios');
const StringHelper = require('./StringHelper');

const request = async (obj) => {
  if (typeof obj === 'string') {
    obj = {
      url: obj,
      data: {},
    }
  }
  obj.method = obj.method || 'get';

  const { url, data } = obj;

  if (obj.method === 'get') {
    obj.url = StringHelper.changeUrlQuery(data, url);
    delete obj.data;
  }

  obj.headers = obj.headers || {};
  obj.xsrfCookieName = 'XSRF-TOKEN';
  obj.withCredentials = true;
  obj.headers.Cookie = Object.keys(global.cookies).map((k) => `${k}=${global.cookies[k]}`).join('; ');
  const res = await axios(obj);

  if (typeof res.data === 'string') {
    res.data = res.data.replace(/callback\(|MusicJsonCallback\(|jsonCallback\(|\)$/g, '');
    return JSON.parse(res.data);
  }

  return res.data;
};

module.exports = request;