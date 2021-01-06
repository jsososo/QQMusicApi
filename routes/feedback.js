const {feedback} = global;

module.exports = {
  '/': async (req, res) => {
    res.send({
      result: 100,
      data: feedback.get(req.query),
    })
  },

  '/add': async (req, res) => {
    feedback.add(req.query);
    res.send({
      result: 100,
      data: 'ok',
    })
  },

  '/delete': async (req, res) => {
    feedback.delete(req.query.id);
    res.send({
      result: 100,
      data: 'ok',
    })
  }
}
