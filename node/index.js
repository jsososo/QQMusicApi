const routes = require('./routes');
const Cache = require('../util/cache');
const Request = require('../util/request');

const cache = new Cache();

const blackFunc = new Set([
  'user/cookie',
  'user/getCookie',
  'user/setCookie',
])

class QQMusic {
  get cookie() {
    return this._cookie || {};
  }

  get uin() {
    return this.cookie.uin;
  }

  setCookie(cookies) {
    switch (typeof cookies) {
      case 'string': {
        const cookieObj = {};
        cookies.split('; ').forEach((c) => {
          const arr = c.split('=');
          cookieObj[arr[0]] = arr[1];
        });

        if (Number(cookieObj.login_type) === 2) {
          cookieObj.uin = cookieObj.wxuin;
        }
        cookieObj.uin = (cookieObj.uin || '').replace(/\D/g, '');
        this._cookie = cookieObj;
        break;
      }
      case 'object':
        this._cookie = cookies;
        break;
    }
  }

  api = (path, query = {}) => {
    return new Promise((resolve, reject) => {
      const truePath = path.replace(/^\/|\/$/g, '').split('/');
      const baseFunc = truePath.shift();
      const func = truePath.join('/') || '';
      const req = {
        query: {...query, ownCookie: 1},
        cookies: this.cookie,
      };
      const res = {
        send: ({result, data, errMsg}) => {
          if (result === 100) {
            resolve(data);
          } else {
            reject({message: errMsg});
          }
        },
        redirect: (url) => url,
        cookie: (k, val) => this.setCookie({...this.cookie, [k]: val}),
      };

      if (!routes[baseFunc] || !routes[baseFunc][`/${func}`] || blackFunc.has(`${baseFunc}/${func}`)) {
        return reject({message: 'wrong path'});
      }

      try {
        routes[baseFunc][`/${func}`]({
          req,
          res,
          request: Request(req, res),
          cache,
          globalCookie: {
            userCookie: () => this.cookie,
          }
        })
      } catch (err) {
        reject(err);
      }
    })
  }
}

module.exports = new QQMusic();
