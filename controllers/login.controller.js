const { retrieveLogin } = require("../models/login.models")

const postAuthentication = async (req,res,next)=>{

    const {email,password} = req.body

    try {

        const result = retrieveLogin(email,password)
        res.status(201).send(result)
        
    } catch (error) {
        next(error)
    }
}

module.exports = {postAuthentication}