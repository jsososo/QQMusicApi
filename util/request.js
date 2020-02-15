const axios = require('axios');
const StringHelper = require('./StringHelper');
const xml2js = require('xml2js').parseString;

const request = async (obj, opts = {}) => {
  try {
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

    const cookieObj = (Number(req.query.ownCookie) ? req.cookies : global.userCookie) || {};
    obj.headers = obj.headers || {};
    obj.xsrfCookieName = 'XSRF-TOKEN';
    obj.withCredentials = true;
    obj.headers.Cookie = Object.keys(cookieObj).map((k) => `${k}=${encodeURI(cookieObj[k])}`).join('; ');
    console.log(obj.url);

    const res = await axios(obj);

    if (opts.dataType === 'xml') {
      return handleXml(res.data);
    }

    if (opts.dataType === 'raw') {
      return res.data;
    }

    if (typeof res.data === 'string') {
      res.data = res.data.replace(/callback\(|MusicJsonCallback\(|jsonCallback\(|\)$/g, '');
      return JSON.parse(res.data);
    }

    return res.data;
  } catch (err) {
    global.response.send({
      result: 400,
      errMsg: `系统异常：${err.message}`,
    })
  }
};

function handleXml(data) {
  return new Promise((resolve, reject) => {
    const handleObj = (obj) => {
      Object.keys(obj).forEach((k) => {
        const v = obj[k];
        if ((typeof v).toLowerCase() === 'object' && v instanceof Array && v.length === 1) {
          obj[k] = v[0];
        }
        if ((typeof obj[k]).toLowerCase() === 'object') {
          handleObj(obj[k]);
        }
      })
    };

    xml2js(data, (err, result) => {
      handleObj(result);
      resolve(result);
    })
  })
}

module.exports = request;