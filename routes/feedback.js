const express = require('express');
const router = express.Router();
const { feedback } = global;
router.get('/', async (req, res) => {
  res.send({
    result: 100,
    data: feedback.get(req.query),
  })
});

router.post('/add', async (req, res) => {
  feedback.add(req.query);
  res.send({
    result: 100,
    data: 'ok',
  })
});

router.get('/delete', async (req, res) => {
  feedback.delete(req.query.id);
  res.send({
    result: 100,
    data: 'ok',
  })
});

module.exports = router;
