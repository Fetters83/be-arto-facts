const { adminDb } = require("../firebaseConfig");
const admin = require('firebase-admin');


const createNewSubscription = async (collectionId,uid) =>{

    if (!collectionId) {
        throw ({status:400,message:"Invalid collectionId. It must be a non-empty string."});
    }

    if (
        !uid || typeof uid !== 'string' ) {
        throw { status: 400, message: 'uid is missing or invalid' };
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
       throw error
       
    }

}

const removeSubscription = async(collectionId,uid)=>{
    
    if (!collectionId) {
        throw ({status:400,message:"Invalid collectionId. It must be a non-empty string."});
    }

    if (
        !uid || typeof uid !== 'string' ) {
        throw { status: 400, message: 'uid is missing or invalid' };
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

const fetchSubscriptions = async(uid)=>{

    if (!uid || typeof uid !== 'string') {
        throw { status: 400, message: "Invalid uid. It must be a non-empty string." };
    }

    try {
        
        const userRef = adminDb.collection(process.env.USER_COLLECTION_ID).doc(uid);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            throw { status: 404, message: "User not found" };
        }

        const userData = userSnapshot.data();

      
        const { subscriptions } = userData;
        if (!subscriptions || subscriptions.length === 0) {
            return { message: "No subscriptions found.", collections: [] };
        }

       
        const collectionRefs = subscriptions.map((id) =>
            adminDb.collection(process.env.ART_COLLECTIONS_COLLECTION_ID).doc(id).get()
        );
        const collectionSnapshots = await Promise.all(collectionRefs);

        
        const collections = collectionSnapshots
            .filter((snapshot) => snapshot.exists)
            .map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));

        return { message: "Subscriptions fetched successfully.", collections };
    } catch (error) {
         throw error;
    }
}

module.exports = {createNewSubscription,removeSubscription,fetchSubscriptions}