const homeRouter = require('express').Router()

homeRouter.get('/',(req,res,next)=>{
    try {
        res.status(200).send({msg:'Welcome to arto-facts API - please read the README.md on github!'})
    } catch (error) {

        next(error)
        
    }
})

module.exports = {homeRouter}