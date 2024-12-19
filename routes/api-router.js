const collectionsRouter = require('./collections-routes');
const { homeRouter } = require('./home-routes');

const apiRouter = require('express').Router()

apiRouter.use('/',homeRouter)

apiRouter.use('/collections',collectionsRouter)

module.exports = apiRouter;

