
const { adminDb } = require("../firebaseConfig");
const admin = require('firebase-admin');

const insertNewArtCollection = async (uid, title, description, isPublic) => {
    
    
    if (
        !uid || typeof uid !== 'string' || !title || typeof title !== 'string' || !description || typeof description !== 'string' || typeof isPublic !== 'boolean'
    ) {
        throw { status: 400, message: 'One or more fields are missing or invalid' };
    }

    try {
        const collectionRef = adminDb.collection(process.env.ART_COLLECTIONS_COLLECTION_ID).doc(); 
        const collectionId = collectionRef.id;

        const newCollection = {
            userId: uid,
            title,
            description,
            isPublic,
            artworks: [],
            subscribers: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await collectionRef.set(newCollection);

        if (isPublic) {
            const userRef = adminDb.collection(process.env.USER_COLLECTION_ID).doc(uid);
            await userRef.update({
                publicCollections: admin.firestore.FieldValue.arrayUnion(collectionId),
            });
        }

        return { message: "Art collection created successfully", collectionId};
    } catch (error) {
    
        return { error: error.message };
    }
}


const fetchUserCollections = async (userId) => {

      
    if (
        !userId || typeof userId !== 'string' ) {
        throw { status: 400, message: 'uid is missing or invalid' };
    }
    try {
        const collectionsSnapshot = await adminDb
            .collection(process.env.ART_COLLECTIONS_COLLECTION_ID)
            .where("userId", "==", userId)
            .get();

        const collections = [];

        collectionsSnapshot.forEach((doc) => {
            collections.push({ id: doc.id, ...doc.data() }); 
        });

        return collections;
    } catch (error) {
        console.error("Error fetching user collections:", error.message);
        return { error: error.message };
    }
};

const fetchAllPublicCollections = async()=>{
 
    try {
   
        const collectionsSnapshot = await adminDb
            .collection(process.env.ART_COLLECTIONS_COLLECTION_ID)
            .where("isPublic", "==", true) 
            .get();

       
        const publicCollections = [];

        collectionsSnapshot.forEach((doc) => {
        
            publicCollections.push({ id: doc.id, ...doc.data() }); 
        });

        return publicCollections;
    } catch (error) {
     
        return { error: error.message };
    }
}

const fetchPublicCollectionById = async(collectionId)=>{

    if (!collectionId) {
        throw { status: 400, message: 'Invalid collectionId. It must be a non-empty string.' };

    }

    try {
        
        const docRef = adminDb.collection(process.env.ART_COLLECTIONS_COLLECTION_ID).doc(collectionId);
        const artCollectionSnapshot = await docRef.get();

        if (!artCollectionSnapshot.exists) {
            throw { status: 404, message: "Art collection not found" };
        }

        const artCollection = artCollectionSnapshot.data();

        if (artCollection.isPublic) {
            return { id: collectionId, ...artCollection };
        } else {
            throw { status: 403, message: "This art collection is not public" };
        }
    } catch (error) {
        throw error;
    }

}

const removeCollectionById = async(collectionId,userId)=>{
    
    if (!collectionId) {
        throw { status: 400, message: 'Invalid collectionId. It must be a non-empty string.' };

    }

    try {
       
        const collectionRef = adminDb.collection(process.env.ART_COLLECTIONS_COLLECTION_ID).doc(collectionId);
        const collectionSnapshot = await collectionRef.get();

        if (!collectionSnapshot.exists) {
            throw { status: 404, message: "Art collection not found" };
        }

        const artCollection = collectionSnapshot.data();

       
        if (artCollection.userId !== userId) {
            throw { status: 403, message: "You do not have permission to delete this collection" };
        }

      
        const ownerRef = adminDb.collection(process.env.USER_COLLECTION_ID).doc(userId);
        await ownerRef.update({
            publicCollections: admin.firestore.FieldValue.arrayRemove(collectionId),
        });

        
        const usersRef = adminDb.collection(process.env.USER_COLLECTION_ID);
        const usersSnapshot = await usersRef.get();

        const batch = adminDb.batch();
        usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            if (userData.subscriptions && userData.subscriptions.includes(collectionId)) {
                const userRef = usersRef.doc(userDoc.id);
                batch.update(userRef, {
                    subscriptions: admin.firestore.FieldValue.arrayRemove(collectionId),
                });
            }
        });

     
        await batch.commit();

        
        await collectionRef.delete();

        return { message: "Art collection deleted successfully", collectionId };
    } catch (error) {
    
        throw error;
    }

}


module.exports = { insertNewArtCollection, fetchUserCollections,fetchAllPublicCollections,fetchPublicCollectionById,removeCollectionById   };
