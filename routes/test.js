const request = require('../util/request');

module.exports = {
  '/': async (req, res, next) => {
    res.send('hello world');
  },
}
