const userAgent = require('useragent');
const jsonFile = require('jsonfile');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

class DataStatistics {
  // 全部数据、黑白名单内容读取并初始化
  constructor() {
    // 白名单
    jsonFile.readFile('data/whiteList.json')
      .then((res) => {
        this.whiteList = res;
      }, (err) => {
        this.whiteList = {};
        jsonFile.writeFile('data/whiteList.json', {});
      });

    // 黑名单
    jsonFile.readFile('data/blackList.json')
      .then((res) => {
        this.blackList = res;
      }, (err) => {
        this.blackList = {};
        jsonFile.writeFile('data/blackList.json', {});
      });

    jsonFile.readFile('data/tempList.json')
      .then((res) => {
        this.tempList = res;
      }, (err) => {
        this.tempList = {};
        jsonFile.writeFile('data/tempList.json', {});
      });
    this.updateTime = moment();
    this.lastSaveTime = moment();
    // 针对 urlsMap 接口做一个特殊的计数
    this.urlsMap = {};
    // 全部数据读取
    this.allData = {};
    fs.readdirSync(path.join(__dirname, '../data/record')).forEach((v) => {
      const key = v.replace(/\.json/, '');
      // 内存中只记录15天数据
      this.earlyCountDate = moment().subtract(15, 'days').format('YYYYMMDD');
      if (key < this.earlyCountDate) {
        return;
      }
      jsonFile.readFile(`data/record/${v}`)
        .then((res) => {
          this.allData[key] = res;
        })
    });
  }

  // 记录数据保存为 json 文件
  saveInfo() {
    const lt = this.lastSaveTime.format('YYYYMMDD');
    const nt = this.updateTime.format('YYYYMMDD');
    const now = moment().valueOf();
    if (lt !== nt) {
      jsonFile.writeFile(`data/record/${lt}.json`, this.allData[lt] || []);
      // 每天清一下 tempList
      Object.keys(this.tempList).forEach(k => {
        this.tempList[k] = this.tempList[k].filter((v) => v > (now - 3600000 * 6));
        if (!this.tempList[k].length) {
          delete this.tempList[k];
        }
      });

      delete this.allData[this.earlyCountDate];
      this.earlyCountDate = moment(this.earlyCountDate, 'YYYYMMDD').add(1, 'days').format('YYYYMMDD');
    }
    jsonFile.writeFile(`data/record/${nt}.json`, this.allData[nt] || []);
    jsonFile.writeFile('data/tempList.json', this.tempList || {});
    this.lastSaveTime = moment();
  }

  // ip 记录中间件
  record(req, res, next) {
    this.updateTime = moment();
    const agent = userAgent.parse(req.headers['user-agent']);
    const os = agent.os;
    const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddres || req.socket.remoteAddress || '';
    const now = moment();
    agent.browserVersion = `${agent.family} ${agent.major}.${agent.minor}.${agent.patch}`;

    if (!this.ipCheck(ip, req, agent)) {
      const t = this.getBlackTime(ip);
      return res.send({
        result: 400,
        errMsg: `你是不是接口访问次数太多了，${t.format('YYYY-MM-DD HH:mm:ss')}之前不能再用了！`,
      })
    }

    // 找不到 ip 指向本地的就算了
    if (ip === '::ffff:127.0.0.1' || ip === '::1') {
      return next();
    }
    if ({ okhttp: true }[agent.family] || { Other: true }[os.family] ) {
      return res.send({
        result: 400,
        errMsg: `自己起一个 node 服务 这么难？？?`
      })
    }
    const data = {
      browser: agent.family,
      browserVersion: agent.browserVersion,
      os: os.family,
      osVersion: `${os.family} ${os.major}.${os.minor}.${os.patch}`,
      ip: ip,
      path: req.path,
      url: req.url,
      host: req.headers.host,
      time: now.valueOf(),
      D: now.format('DD'),
      H: now.format('HH'),
      m: now.format('mm'),
      Hm: now.format('HH:mm'),
    };
    const nowYMD = now.format('YYYYMMDD');

    if (!this.allData[nowYMD]) {
      this.allData[nowYMD] = [];
    }
    this.allData[nowYMD].push(data);

    next();
  }

  // 检查IP 是否可以继续调用
  ipCheck(ip, req, agent) {
    const now = this.updateTime.valueOf();
    const ipArr = ip.split('.');
    const preIp = `${ipArr[0]}.${ipArr[1]}`;
    if (this.whiteList[ip]) {
      return true;
    }
    if (this.blackList[ip] && (this.blackList[ip] > (now - 86400000))) {
      return false;
    }
    if (agent.browserVersion === 'Firefox 49.0.0' && this.blackList[preIp] && (this.blackList[preIp] > (now - 86400000))) {
      return false;
    }

    this.tempList[ip] = this.tempList[ip] || [];
    this.tempList[ip].push(now);
    // 六小时以上的就过滤掉
    this.tempList[ip] = this.tempList[ip].filter((v) => v > (now - 3600000 * 6));
    const list = this.tempList[ip];

    // 过去1分钟、10分钟、1小时
    const last1M = list.filter((v) => v > (now - 60000));
    if (last1M.length >= 100) {
      this.addList(ip, 'blackList');
      return false;
    }
    const last10M = list.filter((v) => v > (now - 60000 * 10));
    if (last10M.length >= 500) {
      this.addList(ip, 'blackList');
      return false;
    }
    const last1H = list.filter((v) => v > (now - 360000));
    if (last1H.length >= 2000) {
      this.addList(ip, 'blackList');
      return false;
    }

    // 如果一天内连续超过20次都是只请求 song/urls 接口
    if (req.path === '/song/urls' && agent.browserVersion === 'Firefox 49.0.0') {
      if (this.urlsMap[preIp] && this.urlsMap[preIp].time < (now - 86400000)) {
        this.urlsMap[preIp] = undefined;
      }
      this.urlsMap[preIp] = this.urlsMap[preIp] || {
        time: now,
        count: 0,
      };
      this.urlsMap[preIp].count += 1;
      if (this.urlsMap[preIp].count >= 10) {
        this.addList(preIp, 'blackList', now + 86400000 * 2);
        delete this.urlsMap[preIp];
        return false;
      }
    } else {
      delete this.urlsMap[preIp];
    }
    delete this.blackList[ip];
    return true;
  }

  // 获取黑名单加入时间
  getBlackTime(ip) {
    return moment(Number(this.blackList[ip])+ 86400000);
  }

  // 加入 黑/白 名单
  addList(ip, type, time) {
    const nType = type === 'whiteList' ? 'blackList' : 'whiteList';
    this[type][ip] = time || this.updateTime.valueOf();
    delete this[nType][ip];
    delete this.tempList[ip];
    this.writeList();
  }

  // 移除 黑/白 名单
  removeList(ip, type) {
    delete this[type][ip];
    this.writeList();
  }

  // 黑/白 名单写入json文件
  writeList() {
    jsonFile.writeFile('data/whiteList.json', this.whiteList);
    jsonFile.writeFile('data/blackList.json', this.blackList);
  }

  // 返回 黑/白 名单
  getList(type) {
    return this[type];
  }

  // 读取数据记录
  getRecord({
     startTime = moment().format('YYYYMMDD'),
     endTime = moment().format('YYYYMMDD'),
     type,
     condition = '{}',
  }) {
    let time = moment(startTime).format('YYYYMMDD');
    const endStr = moment(endTime).format('YYYYMMDD');
    const { allData } = this;
    let filterFunc = () => true;
    try {
      const cObj = JSON.parse(condition);
      filterFunc = ((obj) => {
        let result = true;
        Object.keys(cObj).forEach((k) => {
          if (String(obj[k]) !== String(cObj[k])) {
            result = false;
          }
        });
        return result;
      })
    } catch (err) {}
    const result = {};
    do {
      const list = this.allData[time] || [];
      const fL = list.filter(filterFunc);
      fL.forEach((obj) => {
        const val = obj[type];
        if (!result[val]) {
          result[val] = 1;
        } else {
          result[val] += 1;
        }
      });

      time = moment(time).add(1, 'd').format('YYYYMMDD');
    } while (time <= endStr);
    return result;
  }
}

module.exports = DataStatistics;