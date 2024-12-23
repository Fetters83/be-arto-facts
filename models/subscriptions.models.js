const { adminDb } = require("../firebaseConfig");
const admin = require('firebase-admin');


const createNewSubscription = async (collectionId,uid) =>{

    if (!collectionId) {
        throw new Error("Invalid collectionId. It must be a non-empty string.");
    }

    try {

        const docRef = adminDb.collection(process.env.ART_COLLECTIONS_COLLECTION_ID).doc(collectionId);
        const artCollectionSnapshot = await docRef.get();

        if (!artCollectionSnapshot.exists) {
            throw { status: 404, message: "Art collection not found" };
        }

        const artCollection = artCollectionSnapshot.data();

        if (artCollection.isPublic) {
            const userRef = adminDb.collection(process.env.USER_COLLECTION_ID).doc(uid);
            await userRef.update({
                subscriptions: admin.firestore.FieldValue.arrayUnion(collectionId),
            });
            return { message: "Subscription created successfully", collectionId};
        } else{
            throw {status:403,message:"Collection is not public and can't be subscribed to"}
        }
        
    } catch (error) {
        console.error("Error creating subscription:", error.message);
      
        
       throw error
       
    }

}

const removeSubscription = async(collectionId,uid)=>{
    
    if (!collectionId) {
        throw new Error("Invalid collectionId. It must be a non-empty string.");
    }

    try {

        const docRef = adminDb.collection(process.env.ART_COLLECTIONS_COLLECTION_ID).doc(collectionId);
        const artCollectionSnapshot = await docRef.get();

        if (!artCollectionSnapshot.exists) {
            throw { status: 404, message: "Art collection not found" };
        }

        const userRef = adminDb.collection(process.env.USER_COLLECTION_ID).doc(uid);
        const  userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            throw { status: 404, message: "User not found" };
        }

        const userData = userSnapshot.data()

        if (!userData.subscriptions || !userData.subscriptions.includes(collectionId)) {
            throw { status: 404, message: "Collection does not exist in subscriptions" };
        }

        await userRef.update({
            subscriptions: admin.firestore.FieldValue.arrayRemove(collectionId),
        });

        return { message: "Subscription removed successfully", collectionId };

        
    } catch (error) {
        throw error;
    }

}

module.exports = {createNewSubscription,removeSubscription}