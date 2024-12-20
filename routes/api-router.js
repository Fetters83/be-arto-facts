const collectionsRouter = require('./collections-routes');
const { homeRouter } = require('./home-routes');
const loginRouter = require('./login-routes');
const signupRouter = require('./signup-routes');

const apiRouter = require('express').Router()

apiRouter.use('/',homeRouter)

apiRouter.use('/collections',collectionsRouter)

apiRouter.use('/signup',signupRouter)

apiRouter.use('/login',loginRouter)



module.exports = apiRouter;

