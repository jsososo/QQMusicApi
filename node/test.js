const qqMusic = require('./index');

qqMusic.api('album', {albummid: '002MAeob3zLXwZ'})
  .then(res => console.log('result', res))
  .catch(err => console.error('error: ', err.message));