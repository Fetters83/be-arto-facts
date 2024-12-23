const { adminDb } = require('../firebaseConfig'); 
const admin = require('firebase-admin');

const addArtworkToCollection = async (collectionId, artwork,userId) => {

    if (!collectionId) {
        throw { status: 400, message: 'Invalid collectionId. It must be a non-empty string.' };

    }

    if(!artwork){
        throw {status:400,message:'Invalid artwork object. It must not be empty'}
    }
    if (
        !userId || typeof userId !== 'string' ) {
        throw { status: 400, message: 'uid is missing or invalid' };
    }
 
    try {
       
        const collectionRef1 = adminDb.collection(process.env.ART_COLLECTIONS_COLLECTION_ID).doc(collectionId);
        const collectionSnapshot = await collectionRef1.get();

        if (!collectionSnapshot.exists) {
            throw { status: 404, message: "Art collection not found" };
        }

        const artCollection = collectionSnapshot.data();

       
        if (artCollection.userId !== userId) {
            throw { status: 403, message: "You do not have permission to add to this collection" };
        }
       
        const collectionRef2 = adminDb.collection(process.env.ART_COLLECTIONS_COLLECTION_ID).doc(collectionId);
        
        await collectionRef2.update({
            artworks: admin.firestore.FieldValue.arrayUnion(artwork),
            updatedAt: new Date().toISOString(),
        });

        return { message: "Artwork added successfully", collectionId };
    } catch (error) {
        console.error("Error adding artwork to collection:", error.message);
        return { error: error.message };
    }
};


const removeArtworkFromCollection = async(collectionId,id,userId)=>{

    if (!collectionId) {
        throw { status: 400, message: 'Invalid collectionId. It must be a non-empty string.' };

    }

    if(!id){
        throw {status:400,message:'Invalid artwork id'}
    }
    if (
        !userId || typeof userId !== 'string' ) {
        throw { status: 400, message: 'uid is missing or invalid' };
    }


    try {

        const collectionRef1 = adminDb.collection(process.env.ART_COLLECTIONS_COLLECTION_ID).doc(collectionId);
        const collectionSnapshot = await collectionRef1.get();
    
        if (!collectionSnapshot.exists) {
            throw { status: 404, message: "Art collection not found" };
        }
    
        const artCollection = collectionSnapshot.data();
    
          
        if (artCollection.userId !== userId) {
            throw { status: 403, message: "You do not have permission to delete from this collection" };
        }
    
        const updatedArtworks = artCollection.artworks.filter((artwork) => artwork.artwork.id !== id);

       
        await collectionRef1.update({
            artworks: updatedArtworks,
            updatedAt: new Date().toISOString(),
        });

        return { message: 'Artwork removed successfully', collectionId, id };
        
    } catch (error) {

        throw error
        
    }
  
  

}

module.exports = { addArtworkToCollection,removeArtworkFromCollection };