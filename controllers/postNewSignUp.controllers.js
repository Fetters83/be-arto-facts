const { insertNewSignUp } = require("../models/postNewSignUp.models")

const postNewSignUp = async(req,res,next)=>{

    const{email, password,username} = req.body

    try {
        
        const result = await insertNewSignUp(email, password,username)
        res.status(201).send(result)
    } catch (error) {
        next(error)
    }
}

module.exports = {postNewSignUp}