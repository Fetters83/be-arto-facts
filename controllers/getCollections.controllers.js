const { fetchMetArtCollections, fetchArtInstituteChigagoCollections, fetchMetArtDepartments, fetchRijksCollections, fetchMetArtPieceById, fetchRijksArtPieceById } = require("../models/getCollections.models")


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

    const {limit,offset,departmentId,type,searchTerm} = req.query
    
    
     try {

        const metCollectionArr = await fetchMetArtCollections(limit,offset,departmentId,type,searchTerm)
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

const getArtInstituteChigagoCollections = async (req,res,next)=>{
    const {page,limit,placeOfOrigin,artistName,artTypeTitle,q} = req.query

    try {
        
        const artICArr = await fetchArtInstituteChigagoCollections(page,limit,placeOfOrigin,artistName,artTypeTitle,q)
        res.status(200).send({ArtInstituteOfChicago:artICArr})
    } catch (error) {


         next(error) 
      
      
        
    }

    
  


}

module.exports = {getMetArtCollections,getRijksCollections,getArtInstituteChigagoCollections,getMetArtDepartments,getMetPieceById,getRijksArtPieceById}