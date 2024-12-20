const {firebaseAdmin} = require('../firebaseConfig')

const insertNewSignUp = async(email, password)=>{

    try {
        const userRecord = await firebaseAdmin.auth().createUser({
            email,
            password
        })

        const firebaseToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid)
        return {
            uid:userRecord.uid,
            token:firebaseToken,
            message:'User successfully created'
        }
    } catch (error) {
        return error
    }
}

module.exports = {insertNewSignUp}