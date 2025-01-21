const { fetchMetArtCollections, fetchArtInstituteChigagoCollections, fetchMetArtDepartments, fetchRijksCollections, fetchMetArtPieceById, fetchRijksArtPieceById, fetchArtInstituteChigagoArtPieceById, fetchArtInstituteChicagoDepartments, fetchArtInstituteChicagoArtWorkTypes, fetchArtInstituteChicagoPlaces } = require("../models/getCollections.models")


const getMetArtDepartments = async (req,res,next) =>{
    try {
        
        
        
        const metDepartmentsArr = await fetchMetArtDepartments();

        res.status(200).send(metDepartmentsArr)
    } catch (error) {
        next(error)
    }
}




const getMetArtCollections = async (req,res,next)=>{

    //fetch pages

   /*  const {limit,offset,departmentId,type,searchTerm} = req.query */
    const {limit,offset,departmentId,type,searchTerm,artistOrCulture,title,isHighlight,dateBegin,dateEnd,sortBy} = req.query
    
    
     try {

        const metCollectionArr = await fetchMetArtCollections(limit,offset,departmentId,type,searchTerm,artistOrCulture,title,isHighlight,dateBegin,dateEnd,sortBy)
        res.status(200).send({metArtWorks:metCollectionArr})
        
    } catch (error) {
        
        next(error)
    }

    
   
    


}

const getMetPieceById = async (req,res,next)=>{
    const {id} = req.params

    try {
        const metArtPiece = await fetchMetArtPieceById(id)
       
        res.status(200).send(metArtPiece)
    } catch (error) {
        next(error)
    }

}
const getRijksCollections = async (req,res,next)=>{
    const {p,ps,type,searchTerm,s,involvedMaker} = req.query

    try {
        const rijksCollectionArr = await fetchRijksCollections(p, ps,type,searchTerm,s,involvedMaker)
        res.status(200).send({rijksArtWorks:rijksCollectionArr})
        
    } catch (error) {

        next(error)
        
    }

}

const getRijksArtPieceById = async (req,res,next) =>{
    const {id} = req.params
    try {
        const artPiece = await fetchRijksArtPieceById(id)
        res.status(200).send(artPiece)
    } catch (error) {
        next(error)
    }
}

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

module.exports = {getMetArtCollections,getRijksCollections,getArtInstituteChigagoCollections,getMetArtDepartments,getMetPieceById,getRijksArtPieceById,getArtInstituteChigagoArtPieceById,getArtInstituteChigagoArtWorkTypes,getArtInstituteChicagoPlaces}