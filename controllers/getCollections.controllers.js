const { fetchMetArtCollections, fetchArtInstituteChigagoCollections, fetchMetArtDepartments, fetchRijksCollections } = require("../models/getCollections.models")


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

const getRijksCollections = async (req,res,next)=>{
    const {page,finish,type,searchTerm,sortQuery} = req.query

    try {
        const rijksCollectionArr = await fetchRijksCollections(page, finish,type,searchTerm,sortQuery)
        res.status(200).send({rijksArtWorks:rijksCollectionArr})
        
    } catch (error) {

        next(error)
        
    }




}

const getArtInstituteChigagoCollections = async (req,res,next)=>{
    const {page,finish,placeOfOrigin,artistName,artTypeTitle,searchTerm} = req.query

    try {
        
        const artICArr = await fetchArtInstituteChigagoCollections(page,finish,placeOfOrigin,artistName,artTypeTitle,searchTerm)
        res.status(200).send({ArtInstituteOfChicago:artICArr})
    } catch (error) {


         next(error) 
      
      
        
    }

    
  


}

module.exports = {getMetArtCollections,getRijksCollections,getArtInstituteChigagoCollections,getMetArtDepartments}