const { postNewSubscription, deleteSubscription } = require('../controllers/subscriptions.controllers')

const subscriptionsRouter = require('express').Router()

subscriptionsRouter.post('/:collectionId',postNewSubscription)

subscriptionsRouter.delete('/:collectionId',deleteSubscription)

module.exports = subscriptionsRouter