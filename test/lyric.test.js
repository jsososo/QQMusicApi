const qqMusic = require('../node');

test('get lyric by songmid', async () => {
  const res = await qqMusic.api('lyric', {songmid: '000b3wiQ3z0VbG'});

  expect((res.lyric || '').length).not.toBe(0);
  expect((res.trans || '').length).not.toBe(0);
});
