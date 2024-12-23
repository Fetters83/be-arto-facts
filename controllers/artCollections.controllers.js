const { insertNewArtCollection, fetchUserCollections, fetchAllPublicCollections, fetchPublicCollectionById, removeCollectionById } = require("../models/artCollections.models");

const postNewArtCollection = async (req, res, next) => {
    const { uid, title, description, isPublic } = req.body;
 

    try {
        
        const result = await insertNewArtCollection(uid, title, description, isPublic);

        if (result.error) {
            res.status(400).send(result);
        } else {
            res.status(201).send(result);
        }
    } catch (error) {
        next(error);
    }
};

const getUserCollections = async (req, res, next) => {
    const { userId } = req.params; // Get userId from request params

    try {
        const collections = await fetchUserCollections(userId);

        if (collections.error) {
            res.status(400).send(collections);
        } else {
            res.status(200).send(collections);
        }
    } catch (error) {
        next(error);
    }
};

const getAllPublicCollections = async (req, res, next) => {
    try {
       
        const collections = await fetchAllPublicCollections();

        if (collections.error) {
            res.status(400).send(collections);
        } else {
            res.status(200).send(collections);
        }
    } catch (error) {
        next(error);
    }
};

const getPublicCollectionById = async (req,res,next) =>{

    const{collectionId} = req.params

    try {
        const collection = await fetchPublicCollectionById(collectionId)
        res.status(200).send(collection)
      
        
    } catch (error) {
        next(error)
    }
}

const deleteCollectionById = async (req,res,next)=>{
    const{collectionId} = req.params
    const{userId} = req.body

    try {
        const deletedCollection = await removeCollectionById(collectionId,userId)
        res.status(200).send(deletedCollection)
    } catch (error) {
        next(error)
    }
}


module.exports = { postNewArtCollection,getUserCollections,getAllPublicCollections,getPublicCollectionById,deleteCollectionById };