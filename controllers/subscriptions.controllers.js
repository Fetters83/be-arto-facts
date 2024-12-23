const { createNewSubscription, removeSubscription } = require("../models/subscriptions.models")

const postNewSubscription = async(req,res,next)=>{

    const {collectionId} = req.params
    const {uid} = req.body

    try {
        
        const newSubscription = await createNewSubscription(collectionId,uid)
        res.status(200).send(newSubscription)

    } catch (error) {

        next(error)
        
    }

}

const deleteSubscription = async(req,res,next)=>{
    const {collectionId} = req.params
    const {uid} = req.body

    try {
        const deletedSubscription = await removeSubscription(collectionId,uid)
        res.status(200).send(deletedSubscription)
        
    } catch (error) {
        next(error)
    }

}

module.exports = {postNewSubscription,deleteSubscription}