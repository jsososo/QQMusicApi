const qqMusic = require('../node');

test('get singer intro', async () => {
  const res = await qqMusic.api('singer/desc', {singermid: '0025NhlN2yWrP4'});

  expect((res.desc || '').length).not.toBe(0);
  expect(res.singername).toBe('周杰伦');
});

test('get songs by singermid', async () => {
  const res = await qqMusic.api('singer/songs', {
    singermid: '0025NhlN2yWrP4',
  });

  expect((res.list || []).length).not.toBe(0);
  expect(res.singer.name).toBe('周杰伦');
});

test('get albums by singermid', async () => {
  const res = await qqMusic.api('singer/album', {
    singermid: '0025NhlN2yWrP4',
  });

  expect((res.list || []).length).not.toBe(0);
  expect(res.name).toBe('周杰伦');
});

test('get mv by singermid', async () => {
  const res = await qqMusic.api('singer/mv', {
    singermid: '0025NhlN2yWrP4',
  });

  expect((res.list || []).length).not.toBe(0);
});

test('get similar singer', async () => {
  const res = await qqMusic.api('singer/sim', {
    singermid: '0025NhlN2yWrP4',
  });

  expect((res.list || []).length).not.toBe(0);
});

test('get singer category', async () => {
  const res = await qqMusic.api('singer/category');

  expect((res.area || []).length).not.toBe(0);
  expect((res.genre || []).length).not.toBe(0);
  expect((res.index || []).length).not.toBe(0);
  expect((res.sex || []).length).not.toBe(0);
});

test('search singer by category', async () => {
  const res = await qqMusic.api('singer/list');

  expect((res.list || []).length).not.toBe(0);
});
