const qqMusic = require('../node');

test('album info by albummid', async () => {
  const res = await qqMusic.api('album', {albummid: '002MAeob3zLXwZ'});

  expect(res.title).not.toBeUndefined;
  expect(res.id).not.toBeUndefined;
  expect(res.mid).not.toBeUndefined;
});

test('get album songs by albummid', async () => {
  const res = await qqMusic.api('album/songs', {albummid: '002MAeob3zLXwZ'});

  expect((res.list || []).length).not.toBe(0);
});
