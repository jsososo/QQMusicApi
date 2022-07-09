const qqMusic = require('../node');

test('get recommend list for you', async () => {
  const res = await qqMusic.api('/recommend/playlist/u');

  expect((res.list || []).length).not.toBe(0);
});

test('get recommend list', async () => {
  const res = await qqMusic.api('/recommend/playlist');

  expect((res.list || []).length).not.toBe(0);
});
