const qqMusic = require('../node');

test('search song', async () => {
  const res = await qqMusic.api('search', {key: '周杰伦'});

  expect((res.list || []).length).not.toBe(0);
});

test('search quick', async () => {
  const res = await qqMusic.api('search/quick', {key: '周杰伦'});
  expect(res.song.count).not.toBe(0);
});

// TODO: search/hot
