const { postNewArtCollection, getUserCollections, getAllPublicCollections, getPublicCollectionById, deleteCollectionById } = require("../controllers/artCollections.controllers");

const artCollectionsRouter = require("express").Router();

artCollectionsRouter.post("/", postNewArtCollection);

artCollectionsRouter.get('/:userId',getUserCollections)

artCollectionsRouter.get('/', getAllPublicCollections)

artCollectionsRouter.get('/collections/:collectionId',getPublicCollectionById)

artCollectionsRouter.delete('/collections/:collectionId',deleteCollectionById)
module.exports = artCollectionsRouter;