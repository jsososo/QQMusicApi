const qqMusic = require('../node');

test('get radio category', async () => {
  const res = await qqMusic.api('radio/category');

  expect((res || []).length).not.toBe(0);
});

test('get radio by category id', async () => {
  const res = await qqMusic.api('radio', {id: 101});

  expect((res.tracks || []).length).not.toBe(0);
});
