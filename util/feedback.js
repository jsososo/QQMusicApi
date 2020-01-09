const jsonFile = require('jsonfile');

class Feedback {
  constructor() {
    jsonFile.readFile('data/feedback.json')
      .then((res) => {
        this.data = res;
      }, (err) => {
        this.data = { list: [], updateTime: new Date().getTime() };
        jsonFile.writeFile('data/feedback.json', this.data);
      });
  }

  add(val) {
    this.data.list.push(val);
    const time = new Date().getTime();
    val.id = Number(time * 100 + Math.floor(Math.random() * 100)).toString(36);
    this.data.updateTime = time;
    console.log(val, this.data);
    this.write();
  }

  write() {
    jsonFile.writeFile('data/feedback.json', this.data);
  }

  delete(id) {
    this.data.list.find(o => o.id === id).deleted = true;
    this.write();
  }

  edit({ id, content }) {
    this.data.list.find(o => o.id === id).content = content;
    this.write();
  }

  get({ pageNo = 1, pageSize = 20, desc = 1 }) {
    const { list } = this.data;
    let trueList = list.filter((o) => !o.deleted);
    if (!Number(desc)) {
      trueList.reverse();
    }
    const getList = trueList.slice((pageNo - 1) * pageSize, pageNo * pageSize);
    return {
      list: getList,
      total: trueList.length,
    }
  }
}

module.exports = Feedback;