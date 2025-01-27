const { getMetArtCollections, getArtInstituteChigagoCollections, getMetArtDepartments, getMetPieceById, getArtInstituteChigagoArtPieceById, getArtInstituteChigagoArtWorkTypes, getArtInstituteChicagoPlaces, getClevelandArtCollections, getClevelandArtPieceById } = require('../controllers/getCollections.controllers')

const collectionsRouter = require('express').Router()

//get New York Metropolitan of Art Museum Pieces
collectionsRouter.get('/MetArtMuseum/departments',getMetArtDepartments)
collectionsRouter.get('/MetArtMuseum/:id',getMetPieceById)
collectionsRouter.get('/MetArtMuseum',getMetArtCollections)


//get Art Institute of Chicago Museum Pieces

collectionsRouter.get('/ArtInstituteChicago/artworkTypes',getArtInstituteChigagoArtWorkTypes)
collectionsRouter.get('/ArtInstituteChicago/places',getArtInstituteChicagoPlaces)
collectionsRouter.get('/ArtInstituteChicago',getArtInstituteChigagoCollections)
collectionsRouter.get('/ArtInstituteChicago/:id',getArtInstituteChigagoArtPieceById)

//get Cleveland Museum of Art Collections

collectionsRouter.get('/ClevelandArtMuseum',getClevelandArtCollections)
collectionsRouter.get('/ClevelandArtMuseum/:id',getClevelandArtPieceById)

module.exports = collectionsRouter