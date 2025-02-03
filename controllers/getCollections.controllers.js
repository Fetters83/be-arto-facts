const {  fetchArtInstituteChigagoCollections, fetchArtInstituteChigagoArtPieceById, fetchArtInstituteChicagoArtWorkTypes, fetchArtInstituteChicagoPlaces, fetchClevelandArtCollections, fetchClevelandArtPiece } = require("../models/getCollections.models")

const getArtInstituteChigagoArtWorkTypes = async(req,res,next)=>{
    try {
       
        const chicagoArtworkTypes = await fetchArtInstituteChicagoArtWorkTypes() 
        res.status(200).send({ArtInstituteOfChicagoArtworkTypes:chicagoArtworkTypes}) 
    } catch (error) {
        next(error)
    }
}

const getArtInstituteChicagoPlaces = async(req,res,next)=>{
    try {
        const chicagoPlaces = await fetchArtInstituteChicagoPlaces()
        res.status(200).send({ArtInstituteOfChicagoPlaces:chicagoPlaces})
    } catch (error) {
        next(error)
    }
}

const getArtInstituteChigagoCollections = async (req,res,next)=>{
    
    const {page,limit,placeOfOrigin,artistName,artTypeTitle,dateBegin,dateEnd,sortBy,q} = req.query

    try {
        
        const artICArr = await fetchArtInstituteChigagoCollections(page,limit,placeOfOrigin,artistName,artTypeTitle,dateBegin,dateEnd,sortBy,q)
        res.status(200).send({ArtInstituteOfChicago:artICArr})
    } catch (error) {


         next(error) 
      
      
        
    }
}

const getArtInstituteChigagoArtPieceById = async (req,res,next)=>{
    const {id} = req.params
    

    try {
        const artPiece = await fetchArtInstituteChigagoArtPieceById(id)
        res.status(200).send(artPiece)
    } catch (error) {
        next(error)
    }
}

const getClevelandArtCollections = async (req,res,next) =>{
    const {q,skip, limit, department,culture,type,created_before, created_after,title,artists,sortBy} = req.query

    try {
        const clevelandArtWorks = await fetchClevelandArtCollections(q,skip, limit, department,culture,type,created_before, created_after,title,artists,sortBy)
        res.status(200).send({clevelandArtPieces:clevelandArtWorks})
    } catch (error) {
        next(error)
    }
}

const getClevelandArtPieceById = async (req,res,next)=>{
    const {id} = req.params
    try {
        const clevelandArtPiece = await fetchClevelandArtPiece(id)
        res.status(200).send({clevelandArtPiece})
    } catch (error) {
        next(error)
    }
}

module.exports = {getArtInstituteChigagoCollections,getArtInstituteChigagoArtPieceById,getArtInstituteChigagoArtWorkTypes,getArtInstituteChicagoPlaces,getClevelandArtCollections,getClevelandArtPieceById}