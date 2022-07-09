const qqMusic = require('../node');

test('get mv info by vid', async () => {
  const res = await qqMusic.api('mv', {id: 't0032kwa29w'});
  expect(res.info.name).not.toBeUndefined();
  expect((res.recommend || []).length).not.toBe(0);
});

test('get mv url', async () => {
  const mvId = 't0032kwa29w';
  const res = await qqMusic.api('mv', {id: mvId});
  expect(res.info.name).not.toBeUndefined();
  expect((res.recommend || []).length).not.toBe(0);
});

test('get mv category', async () => {
  const res = await qqMusic.api('mv/category');
  expect((res.area || []).length).not.toBe(0);
  expect((res.version || []).length).not.toBe(0);
});

test('get mv list', async () => {
  const res = await qqMusic.api('mv/list');

  expect((res.list || []).length).not.toBe(0);
});
