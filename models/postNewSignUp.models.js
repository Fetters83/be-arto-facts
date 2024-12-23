const { firebaseApp, firebaseAdmin } = require("../firebaseConfig");
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const insertNewSignUp = async (email, password, username) => {
    try {
        const auth = getAuth(firebaseApp);
        await auth._initializationPromise;

       
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const uid = userCredential.user.uid;

      
        const firebaseToken = await firebaseAdmin.auth().createCustomToken(uid);


        const firestore = getFirestore(firebaseApp);
        const userRef = doc(firestore, process.env.USER_COLLECTION_ID, uid);

        await setDoc(userRef, {
            uid,
            email,
            username,
            publicCollections: [],
            subscriptions: [],
            createdAt: new Date().toISOString(),
        });

        return { message: "User successfully created and added to Firestore", uid, token: firebaseToken };
    } catch (error) {
        console.error("Error in createUserInFirestore:", error.message, error.code);
        return { error: error.message };
    }
};

module.exports = {insertNewSignUp }