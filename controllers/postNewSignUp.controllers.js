const { insertNewSignUp } = require("../models/postNewSignUp.models")

const postNewSignUp = async(req,res,next)=>{

    const{email, password} = req.body

    try {
        
        const result = await insertNewSignUp(email, password)
        res.status(201).send(result)
    } catch (error) {
        next(error)
    }
}

module.exports = {postNewSignUp}