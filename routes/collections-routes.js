const { getMetArtCollections, getArtInstituteChigagoCollections, getMetArtDepartments, getRijksCollections, getMetPieceById } = require('../controllers/getCollections.controllers')

const collectionsRouter = require('express').Router()


collectionsRouter.get('/MetArtMuseum/departments',getMetArtDepartments)
collectionsRouter.get('/MetArtMuseum/:id',getMetPieceById)


//get New York Metropolitan of Art Museum Pieces

collectionsRouter.get('/MetArtMuseum',getMetArtCollections)


//get Rijks Museum Art Pieces

collectionsRouter.get('/RijksMuseum',getRijksCollections)


//get Art Institute of Chicago Museum Pieces

collectionsRouter.get('/ArtInstitueChicago',getArtInstituteChigagoCollections)


module.exports = collectionsRouter