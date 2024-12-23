const { postArtworkToCollection, deleteArtworkFromCollection } = require('../controllers/manageCollections.controllers');

const manageCollectionsRouter = require('express').Router();

manageCollectionsRouter.post('/:collectionId/artwork', postArtworkToCollection);
manageCollectionsRouter.delete('/:collectionId/artwork',deleteArtworkFromCollection)
module.exports =  manageCollectionsRouter;