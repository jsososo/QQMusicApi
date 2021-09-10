module.exports = {
  '/': async ({req, res, feedback}) => {
    res.send({
      result: 100,
      data: feedback.get(req.query),
    })
  },

  '/add': async ({req, res, feedback}) => {
    feedback.add(req.query);
    res.send({
      result: 100,
      data: 'ok',
    })
  },

  '/delete': async ({req, res, feedback}) => {
    feedback.delete(req.query.id);
    res.send({
      result: 100,
      data: 'ok',
    })
  }
}
