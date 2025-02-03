const { getArtInstituteChigagoCollections, getArtInstituteChigagoArtPieceById, getArtInstituteChigagoArtWorkTypes, getArtInstituteChicagoPlaces, getClevelandArtCollections, getClevelandArtPieceById } = require('../controllers/getCollections.controllers')

const collectionsRouter = require('express').Router()

//get Art Institute of Chicago Museum Pieces

collectionsRouter.get('/ArtInstituteChicago/artworkTypes',getArtInstituteChigagoArtWorkTypes)
collectionsRouter.get('/ArtInstituteChicago/places',getArtInstituteChicagoPlaces)
collectionsRouter.get('/ArtInstituteChicago',getArtInstituteChigagoCollections)
collectionsRouter.get('/ArtInstituteChicago/:id',getArtInstituteChigagoArtPieceById)

//get Cleveland Museum of Art Collections

collectionsRouter.get('/ClevelandArtMuseum',getClevelandArtCollections)
collectionsRouter.get('/ClevelandArtMuseum/:id',getClevelandArtPieceById)

module.exports = collectionsRouter