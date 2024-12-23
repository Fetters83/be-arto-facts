const artCollectionsRouter = require('./art-collections-routes');
const collectionsRouter = require('./collections-routes');
const { homeRouter } = require('./home-routes');
const loginRouter = require('./login-routes');
const manageCollectionsRouter = require('./manage-collections-routes');
const saveToCollectionRouter = require('./manage-collections-routes');
const signupRouter = require('./signup-routes');
const subscriptionsRouter = require('./subscriptions-routes');

const apiRouter = require('express').Router()

apiRouter.use('/',homeRouter)

apiRouter.use('/collections',collectionsRouter)

apiRouter.use('/signup',signupRouter)

apiRouter.use('/login',loginRouter)

apiRouter.use('/art-collections/public',artCollectionsRouter) 

apiRouter.use('/art-collections',artCollectionsRouter) 


apiRouter.use('/manage-collections',manageCollectionsRouter)

apiRouter.use('/subscribe',subscriptionsRouter)

module.exports = apiRouter;

