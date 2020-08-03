// 自搭建的一个缓存机制
const moment = require('moment');
class Cache {
  constructor() {
    this.map = {};
    this.timeMap = {};
  }

  clear() {
    const nowKey = moment().format('YYYYMMDDHHmm');
    if (this.lastClear === nowKey) {
      return;
    }
    const clearTime = Object.keys(this.timeMap).filter((v) => v <= nowKey);
    clearTime.forEach((timeKey) => {
      this.timeMap[timeKey].forEach((k) => {
        delete this.map[k];
      })
      delete this.timeMap[timeKey];
    })
    this.lastClear = nowKey;
  }

  get(key) {
    this.clear();
    return this.map[key];
  }

  set(key, value, time = 90) {
    this.clear();
    const timeKye = moment().add(time, 'minutes').format('YYMMDDHHmm');
    this.map[key] = value;
    this.timeMap[timeKye] = this.timeMap[timeKye] || [];
    this.timeMap[timeKye].push(key);
  }
}

module.exports = Cache;