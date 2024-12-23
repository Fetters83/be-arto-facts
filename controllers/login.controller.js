const { retrieveLogin, checkUserInFireStore } = require("../models/login.models")

const postAuthentication = async (req,res,next)=>{

    const {email,password} = req.body

    try {

        const result = retrieveLogin(email,password)
        if (result.error) {
            res.status(400).send(result);
        } else {
          
            await checkUserInFireStore(result.uid, email);

            res.status(200).send(result);
        }
        
    } catch (error) {
        next(error)
    }
}

module.exports = {postAuthentication}