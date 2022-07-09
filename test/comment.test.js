const qqMusic = require('../node');

test('get comment', async () => {
  const res = await qqMusic.api('comment', {id: '9773'});

  expect((res.comment.commentlist || []).length).not.toBe(0);
});
