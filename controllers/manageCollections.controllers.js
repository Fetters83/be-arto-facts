const { addArtworkToCollection, removeArtworkFromCollection } = require("../models/manageCollections.models");

const postArtworkToCollection = async (req, res, next) => {
    const { collectionId } = req.params; 
    const { artwork, userId } = req.body;
    try {
        const result = await addArtworkToCollection(collectionId, artwork,userId);

        if (result.error) {
            res.status(400).send(result);
        } else {
            res.status(200).send(result);
        }
    } catch (error) {
        next(error);
    }
};

const deleteArtworkFromCollection = async(req,res,next)=>{
    const { collectionId } = req.params; 
    const { id, userId } = req.body;

    try {
        const result = await removeArtworkFromCollection(collectionId,id,userId)
        
        if (result.error) {
            res.status(400).send(result);
        } else {
            res.status(200).send(result);
        }
    } catch (error) {
        next(error);
    }

}

module.exports = { postArtworkToCollection,deleteArtworkFromCollection };