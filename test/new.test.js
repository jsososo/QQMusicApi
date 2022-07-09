const qqMusic = require('../node');

test('get new songs', async () => {
  const res = await qqMusic.api('new/songs');
  expect(res.lan).toBe('最新');
  expect((res.list || []).length).not.toBe(0);
});

test('get album', async () => {
  const res = await qqMusic.api('new/album');
  expect(res.typeName).toBe('内地');
  expect((res.list || []).length).not.toBe(0);
});

test('get mv', async () => {
  const res = await qqMusic.api('new/mv');
  expect(res.typeName).toBe('精选');
  expect((res.list || []).length).not.toBe(0);
});
