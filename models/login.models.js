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


const checkUserInFireStore = async (uid, email) => {
    try {
        const firestore = getFirestore(firebaseApp);
        const userRef = doc(firestore, process.env.USER_COLLECTION_ID, uid);

        // Check if the document exists
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            // Add default data for new users
            await setDoc(userRef, {
                uid,
                email,
                username: "", 
                publicCollections: [],
                subscriptions: [],
                createdAt: new Date().toISOString(),
            });
        }
    } catch (error) {
        console.error("Error in ensureUserInFirestore:", error.message, error.code);
    }
};

module.exports = {retrieveLogin,checkUserInFireStore}