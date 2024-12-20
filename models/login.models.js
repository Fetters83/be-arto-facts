const { firebaseApp, firebaseAdmin } = require("../firebaseConfig")
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');


const retrieveLogin = async(email, password) =>{

    try {
       
        const auth = getAuth(firebaseApp)
        await auth._initializationPromise;
   

        const userLogin = await signInWithEmailAndPassword(auth,email,password)
    
        const uid = userLogin.user.uid;

        const firebaseToken = await firebaseAdmin.auth().createCustomToken(uid)
     
        return({token:firebaseToken})
        
    } catch (error) {
        console.error("Error in retrieveLogin:", error.message, error.code, error);
        return {error:error.message}
    }
}

module.exports = {retrieveLogin}