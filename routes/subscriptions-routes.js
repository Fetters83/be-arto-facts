const { postNewSubscription, deleteSubscription, getSubscriptions } = require('../controllers/subscriptions.controllers')

const subscriptionsRouter = require('express').Router()

subscriptionsRouter.get('/:userId',getSubscriptions)

subscriptionsRouter.post('/:collectionId',postNewSubscription)

subscriptionsRouter.delete('/:collectionId',deleteSubscription)

module.exports = subscriptionsRouter