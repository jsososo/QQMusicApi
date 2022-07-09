const qqMusic = require('../node');

test('get song url', async () => {
  const res = await qqMusic.api('song/url', {id: '001ufyHx10iWpg'});

  expect((res || '').length).not.toBe(0);
});

// Need to set Cookie first
// test('get song urls', async () => {
//   qqMusic.setCookie('');
//   const res = await qqMusic.api('song/urls', { id: '001ufyHx10iWpg' });
//
//   expect((res || '').length).not.toBe(0);
// });

test('get mv by song id', async () => {
  const res = await qqMusic.api('song/mv', {id: '5105986'});

  expect((res || []).length).not.toBe(0);
});

// TODO song/playlist
