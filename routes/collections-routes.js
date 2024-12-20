const { getMetArtCollections, getArtInstituteChigagoCollections, getMetArtDepartments, getRijksCollections, getMetPieceById, getRijksArtPieceById } = require('../controllers/getCollections.controllers')

const collectionsRouter = require('express').Router()

//get New York Metropolitan of Art Museum Pieces
collectionsRouter.get('/MetArtMuseum/departments',getMetArtDepartments)
collectionsRouter.get('/MetArtMuseum/:id',getMetPieceById)
collectionsRouter.get('/MetArtMuseum',getMetArtCollections)



//get Rijks Museum Art Pieces

collectionsRouter.get('/RijksMuseum',getRijksCollections)
collectionsRouter.get('/RijksMuseum/:id',getRijksArtPieceById)


//get Art Institute of Chicago Museum Pieces

collectionsRouter.get('/ArtInstitueChicago',getArtInstituteChigagoCollections)


module.exports = collectionsRouter