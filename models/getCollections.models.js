const axios = require('axios')
const {config} = require('../firebaseConfig')
const { messaging } = require('firebase-admin')
const rijks_api_key = config.rijks_api_key
const user_collection_id=config.user_collection_id


const fetchMetArtDepartments = async ()=>{
 
  
  //Fetch met art gallery departments to display in a drop down box in the front end

  //1. Attempt to retrieve a list of departments from the public API
  try {
 
    
    const departmentsObj = await axios('https://collectionapi.metmuseum.org/public/collection/v1/departments')
    //Assign the result to the variable metArtDepartmentsArr
    const metArtDepartmentsArr = departmentsObj.data;

    //Return the result
    return metArtDepartmentsArr
  } catch (error) {
    //If error with the API - return this to the server
      return error
  }
}

const fetchMetArtCollections = async (limit,offset,departmentId,type,searchTerm,artistOrCulture,title,isHighlight,dateBegin,dateEnd,sortBy) => {

const numbersRegex = /^[0-9]*$/

//Ensure at least the limit, offset, and searchTerm keys are present

if (limit === undefined) {
  throw { status: 404, message: "Search term key must be present" };
}

if (offset === undefined) {
  throw { status: 404, message: "Search term key must be present" };
}



if (searchTerm === undefined || searchTerm === null || searchTerm === "") {
  searchTerm = "";
}


if((dateBegin && !dateEnd)||(dateEnd && !dateBegin)) {
  throw { status: 404, message: "Era searches must have both dateBegin and dateEnd values" };

}

if(artistOrCulture && (artistOrCulture !== 'true' && artistOrCulture !== 'false')){
  throw { status: 400, message: 'artistOrCulture value must be a boolean data type' };
}

if(title && (title !== 'true' && title!== 'false')){
  throw { status: 400, message: 'title value must be a boolean data type' };
}

if(isHighlight && (isHighlight !== 'true' && isHighlight!== 'false')){
  throw { status: 400, message: 'isHighlight value must be a boolean data type' };
}

if (dateBegin && isNaN(parseInt(dateBegin))){
  throw  {status :400, message: 'dateBegin must be an integer value'}
}

if (dateEnd && isNaN(parseInt(dateEnd))){
  throw  {status :400, message: 'dateEnd must be an integer value'}
}



const validSortValues = [
  'titleASC',
  'titleDESC',
  'dateASC',
  'dateDESC',
  'artistASC',
  'artistDESC'
];

if (sortBy && !validSortValues.includes(sortBy)) {
  throw { status: 404, message: "Invalid sortBy value" };
}




   //Results per page
    const resultsPerPage = parseInt(limit);
   //Initialise empty art collection array 
    const artCollection = [];
    //Initialise empty object id array for the initial capture of available IDs
    let objectIDs = [];
    //offset will be a string, so convert it to an integer, this is the start point of the iteration through the  objects array
    let currentIndex = parseInt(offset);


    const isArtistOrCulture = artistOrCulture !== undefined && artistOrCulture !== null
    ? artistOrCulture === 'true'
    : undefined;

  const isTitle = title !== undefined && title !== null
    ? title === 'true'
    : undefined;
  
 
   
  const isHighlightSelected = isHighlight !== undefined && isHighlight !== null
    ? isHighlight === 'true'
    : undefined;

   

   const intDateBegin = dateBegin !== undefined && dateBegin !== null
   ? dateBegin = parseInt(dateBegin) : undefined


   const intDateEnd = dateEnd !== undefined && dateEnd !== null
   ? dateEnd = parseInt(dateEnd) : undefined
  
  //ensure request query department Id exists
    try {
      
      if (departmentId && isNaN(parseInt(departmentId))) {
        throw { status: 400, message: 'Department ID must be a number data type' };
      }

      if(departmentId){
        const departmentIds = await fetchMetArtDepartments()
        const {departments} = departmentIds
        const idExists = departments.filter((department)=>department.departmentId===parseInt(departmentId))
        
        if(idExists.length===0) throw{status:404,message:'DepartmentId does not exist'}
      }
    

      
    } catch (error) {
      
      throw error
    }
 

    //1.First try block - 1. Retrieve all valid object Id numbers available to use
    try {
            //Validate queries
         
            
    if (isNaN(parseInt(limit))) {
        throw { status: 400, message: 'Results per page must be a number data type' };
      }
  
      if (isNaN(parseInt(offset))) {
        throw { status: 400, message: 'Artwork result starting position must be a number data type' };
      }
  
    
      if (type && numbersRegex.test(type)=== true) {
        
        throw { status: 400, message: 'Artwork type query must be a string data type' };
      }
  
      if (searchTerm && numbersRegex.test(searchTerm)=== true) {
        throw { status: 400, message: 'Free search query must be a string data type' };
      }
    
    /*   if( isArtistOrCulture && typeof isArtistOrCulture !== 'boolean'){
        
        throw { status: 400, message: 'artistOrCulture value must be a boolean data type' };
      } */
     
   /*    if( isTitle && typeof isTitle !== 'boolean'){
        throw { status: 400, message: 'title value must be a boolean data type' };
      } */
     
    
  /*     if( isHighlightSelected && typeof isHighlightSelected != 'boolean'){
        throw { status: 400, message: 'isHighlight value must be a boolean data type' };
      } */

   

      if(parseInt(limit)<10){
        throw{status:400, message:'Results per page can not be lower than 10'}
      }
      if(parseInt(limit)>50){
        throw{status:400, message:'Results per page can not exceed 50'}
      }

        //1.

        //Retrieve all valid artwork/object IDs first - filtered by department id, type of artwork and any other search criteria
        //Those objects which are highlights and hasImages tend to have all image size available
        const getAvailableIDs = await axios(`https://collectionapi.metmuseum.org/public/collection/v1/search`,{
            params: {
                departmentId:departmentId,
                medium:type,
                isHighlight:isHighlightSelected,
                hasImages:true,
                artistOrCulture:isArtistOrCulture,
                title:isTitle,
                dateBegin:intDateBegin,
                dateEnd:intDateEnd,
                q:searchTerm,
               


            }
        }
           
        )
      
     
        if(getAvailableIDs.data.objectIDs === null){
          
          throw{status:400,message:'Error fetching availble artwork ids'}
        }
       //Set the object IDs array to the result of getAvailableIDs (located in the key data, then objectIDs)      
       objectIDs=getAvailableIDs.data.objectIDs;
      
       
       //Return error if offset number is higher than the number of objects available
       if(parseInt(offset)>objectIDs.length) throw{status:404,message:'Offset or Page start exceeds the number of available artworks'}

       //As long the artCollection.length is less than or equal to the resultsPerPage variable - try 2. fetch individual artworks (iterating through object id array)
       //Once individual artwork is fetched push the object to the artCollection array
        while(artCollection.length + 1 <=resultsPerPage && currentIndex < objectIDs.length) {
            //Set objectId to the value of objectIds[currentIndex] - currentIndex = offset passed in through request query - either 10, 20, 30, 40 or 50
            const objectId = objectIDs[currentIndex]
                    //2.Get individual art piece
                try {

                    const getArtPiece = await axios(
                        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
                      );
    
                      //the art work obeject will be located in the  object getArtPiece under the property data - set artPiece to this value
                      const artPiece = getArtPiece.data;

                      if (artPiece.primaryImage && artPiece.primaryImageSmall) {
                        artCollection.push({
                          classification: artPiece.classification,
                          isHighlight:artPiece.isHighlight,
                          medium: artPiece.medium,
                          id: artPiece.objectID,
                          title: artPiece.title || 'Unknown',
                          artist: artPiece.artistDisplayName || 'Unknown Artist',
                          date: artPiece.objectDate || artPiece.objectBeginDate || artPiece.objectEndDate,
                          numericDate:artPiece.objectBeginDate || artPiece.objectEndDate || undefined,
                          department: artPiece.department,
                          img: artPiece.primaryImage,
                          smallImg: artPiece.primaryImageSmall,
                          country: artPiece.country || 'Unknown',
                          creditedTo: artPiece.creditLine || 'Credited to unknown',
                          alt: artPiece.objectName || 'Unknown Object Type',
                        });
                      }
                    } catch (error) {
                      console.error(`Error fetching object ID ${objectId}:`, error.message);
                      // Skip this object and continue to the next
                    }
                    currentIndex++;
                  }
                
                 //Sort the artCollecion array in title ASC order  
                if (sortBy === 'titleASC') {
                  artCollection.sort((a, b) =>
                    (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: 'base' })
                  );
                }
                 //Sort the artCollecion array in title ASC order 
                if (sortBy === 'titleDESC') {
                  artCollection.sort((a, b) =>
                    (b.title || "").localeCompare(a.title || "", undefined, { sensitivity: 'base' })
                  );
                }

                //Sort the artCollection array in date ASC
                if(sortBy === 'dateASC') {
                  artCollection.sort((a,b)=>a.numericDate-b.numericDate)
                }

                //Sort the artCollection array in date ASC
                if(sortBy === 'dateDESC') {
                  artCollection.sort((a,b)=>b.numericDate-a.numericDate)
                }

                     //Sort the artCollecion array in artist ASC order  
                     if (sortBy === 'artistASC') {
                      artCollection.sort((a, b) =>
                        (a.artist || "").localeCompare(b.artist || "", undefined, { sensitivity: 'base' })
                      );
                    }
                     //Sort the artCollecion array in artist ASC order 
                    if (sortBy === 'artistDESC') {
                      artCollection.sort((a, b) =>
                        (b.artist || "").localeCompare(a.artist || "", undefined, { sensitivity: 'base' })
                      );
                    }


                 //Add Number of results to artCollection array
                  return {numberOfIds:objectIDs.length,artCollection};
                } catch (error) {
                  if (error) throw error;
              
                  throw { status: error.status, error: error.message || 'An error occurred', artCollection: [] };
                }
              };
  
   
  const fetchMetArtPieceById = async(id)=>{
    if(!id) throw {status:404,message:'Artwork Id must be provided'}


    try {
      const getArtPiece = await axios(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
      );

      if(!getArtPiece) throw{status:404,message:'Artwork id does not exist'}
      const artPiece = getArtPiece.data
      


      
      return {
        classification:artPiece.classification,
        medium:artPiece.medium,
        id:artPiece.objectID,  
        title: artPiece.title || 'Unknown',
        artist: artPiece.artistDisplayName || 'Unknown Artist',
        date: artPiece.objectEndDate || artPiece.objectDate,
        department: artPiece.department,
        img:artPiece.primaryImage,
        smallImg: artPiece.primaryImageSmall,
        country: artPiece.country || 'Unknown',
        creditedTo: artPiece.creditLine || 'Credited to unknown',
        alt: artPiece.objectName || 'Unknown Object Type',
      }
    } catch (error) {

      throw error
      
    }
  }

const fetchRijksCollections = async (p, ps,type,searchTerm,sortQuery,involvedMaker)=>{
  
  const numbersRegex = /^[0-9]*$/

  if(searchTerm && numbersRegex.test(searchTerm)) throw{status:400,message:'searchTerm must be a string data type'}
  if(sortQuery && numbersRegex.test(sortQuery)) throw{status:400,message:'sortQuery must be a string data type'}
  if(type && numbersRegex.test(type)) throw{status:400,message:'type must be a string data type'}
  if(involvedMaker && numbersRegex.test(involvedMaker)) throw{status:400,message:'involvedMaker must be a string data type'}
  if(!p) throw{status:400,message:'Page number must be given'}
  if(!ps) throw{status:400,message:'Results per page must be given'}
  
  const validSortQuerys = ['relevance','objectType','chronologic','achronologic','artist','artistdesc']
  if(sortQuery && !validSortQuerys.includes(sortQuery)) throw({status:400,message:'invalid sort query'})
  
  const artCollection = [];

  const params = {
    key:rijks_api_key,
    p:p,
    ps:ps,
    imgonly:true,
    q:searchTerm,
    type:type,
    s:sortQuery,
    involvedMaker:involvedMaker
  }
  try {
    
    const artCollectionObj = await axios('https://www.rijksmuseum.nl/api/en/collection',{params})
    const artCollectionArr = artCollectionObj.data.artObjects;
    const artCollectionArrObjNo = artCollectionArr.map((artObject)=>artObject.objectNumber)
    
    if(artCollectionArrObjNo.length===0) throw({status:400,message:'Search query returned no artists'})
    for(i=0; i<artCollectionArrObjNo.length ;i++){

      try {
      
        const data = await axios(`https://www.rijksmuseum.nl/api/en/collection/${artCollectionArrObjNo[i]}`,{
          params:{
            key:rijks_api_key
          }
        })
        
        const artWorkDetails = data.data.artObject
        
        if (
          !artWorkDetails.physicalMedium || 
          !artWorkDetails.objectTypes || 
          !artWorkDetails.objectNumber || 
          !artWorkDetails.webImage?.url
        ) {
         
          continue; 
        }


        artCollection.push({
          classification:artWorkDetails.physicalMedium,
          medium:artWorkDetails.objectTypes,
          id:artWorkDetails.objectNumber,  
          title: artWorkDetails.title || 'Unknown',
          artist: artWorkDetails.principalOrFirstMaker || 'Unknown Artist',
          date: artWorkDetails.dating.yearLate || 'Unknown',
          department: artWorkDetails.objectCollection || 'Unspecified Department',
          img:artWorkDetails.webImage.url,
          country: artWorkDetails.classification?.places.length>0? artWorkDetails.classification.places:'Unknown',
          creditedTo: artWorkDetails.acquisition?.creditLine || 'Credited to unknown',
          alt: `artpiece by ${artWorkDetails.principalOrFirstMaker  || 'Unknown artist'}`,
        })
        
        

      } catch (error) {
        continue;
        
      }

    }
   
    return artCollection;



  } catch (error) {
    throw error
    
  } 


}

const fetchRijksArtPieceById = async(id)=>{
   

  try {
     
  if(!id) throw {status:404,message:'Artwork Id must be provided'}
  


    const getArtPiece = await axios(`https://www.rijksmuseum.nl/api/en/collection/${id}`,{
      params:{
        key:rijks_api_key
      }
    })
   
    if (!getArtPiece || !getArtPiece.data.artObject) {
      throw { status: 404, message: 'Artwork Id does not exist' };
    }
  
    const artPiece = getArtPiece.data.artObject
    
   
   
    return({
      classification:artPiece.physicalMedium,
      medium:artPiece.objectTypes,
      id:artPiece.objectNumber,  
      title: artPiece.title || 'Unknown',
      artist: artPiece.principalOrFirstMaker || 'Unknown Artist',
      date: artPiece.dating.yearLate || 'Unknown',
      department: artPiece.objectCollection || 'Unspecified Department',
      img:artPiece.webImage.url,
      country: artPiece.classification?.places.length>0? artPiece.classification.places:'Unknown',
      creditedTo: artPiece.acquisition?.creditLine || 'Credited to unknown',
      alt: `artpiece by ${artPiece.principalOrFirstMaker  || 'Unknown artist'}`,
    })
  } catch (error) {
    
    if (error.response && error.response.status === 404) {
      throw { status: 404, message: 'Artwork Id does not exist' };    
  } else if (error.message) {
    throw error; 
  } else {
   
    throw { status: 500, message: 'An unexpected error occurred' };
  }
}
}

const fetchArtInstituteChicagoArtWorkTypes = async () => {
  
  try {
    const artworkTypeData = await axios('https://api.artic.edu/api/v1/artwork-types', {params:{limit:50}})
    return artworkTypeData
  } catch (error) {
     throw error
  }

};


const fetchArtInstituteChigagoCollections = async (page,limit,placeOfOrigin,artistName,artTypeTitle,q)=>{


  const numbersRegex = /^[0-9]*$/

  if(placeOfOrigin && numbersRegex.test(placeOfOrigin)) throw({status:400,message:'placeOfOrigin must be a string data type'})
  if(artistName && numbersRegex.test(artistName)) throw({status:400,message:'artistName must be a string data type'})
  if(artTypeTitle && numbersRegex.test(artTypeTitle)) throw({status:400,message:'artTypeTitle must be a string data type'})
  if(q && numbersRegex.test(q)) throw({status:400,message:'query must be a string data type'})      

   //Create the parameters for the axios to search all artwork id's that meet the search crtieria - page(set the page number) 
   // limit(number of results per page), q(free text search term)
   //other properties will be added to params object dynamically below
   const params = {
    page:page,
    limit:limit,
    q:q
   }

   //set an index value to 0 at first - elastic query results look like below
   //query[bool][must][0][match_phrase][place_of_origin]` - the more search criteria we add the more of these lines we must add
   //if there are two search criterias there will be two of these lines in the array - se we musy dynamically set [must][setNumber here]
   let currentIndex = 0; // Track the current index for the `must` array
   
   //If placeOfOrigin was passed in as a query..

    if (placeOfOrigin) {
    //Add to the params the below elastic search syntax - currentIndex will be 0 for this property
     params[`query[bool][must][${currentIndex}][match_phrase][place_of_origin]`] = placeOfOrigin;
     currentIndex++; // Increment the index for the next condition
   }
   
   //If artistName was passed in as a query..
   if (artistName) {
     //Add to the params the below elastic search syntax - currentIndex will be 1 if placeOfOrigin was passed in, 0 if not
     params[`query[bool][must][${currentIndex}][match_phrase][artist_name]`] = artistName;
     currentIndex++; // Increment the index for the next condition
   }
 
   //If artTypeTitle was passed in as a query..
   if (artTypeTitle) {
     //Add to the params the below elastic search syntax - currentIndex will be 0,1 or 2 depending on whether the above queries were passed in or not
     params[`query[bool][must][${currentIndex}][match_phrase][artwork_type_title]`] = artTypeTitle;
     currentIndex++; // Increment the index for the next condition
   }
   

   if (isNaN(Number(page))) {
    throw { status: 400, message: 'page must be a number data type' };
  }
  
  if (isNaN(Number(limit))) {
    throw { status: 400, message: 'Number of results (limit) must be a number data type' };
  }
 
 /*  if (departmentId && isNaN(Number(departmentId))) {
    throw { status: 400, message: 'Department ID must be a number data type' };
  } */
  
  if (artTypeTitle && typeof artTypeTitle !== 'string') {
    throw { status: 400, message: 'Artwork type query must be a string data type' };
  }
  
  if (q && typeof q !== 'string') {
    throw { status: 400, message: 'Free search query must be a string data type' };
  }
        
 
   //1.First try - get a list of artwork IDs that match the criteria from the params object above ({params} is passed into the axio request)
   //The result will something like https://api.artic.edu/api/v1/artworks/search?page=1&limit=10&query[bool][must][0][match_phrase][place_of_origin]=China&query[bool][must][1][match_phrase][artwork_type_title]=Painting'
    try {
        

 

      

        //Make call the API for searching artwork IDs and set to getAvailableIDs
        const getAvailableIDs = await axios('https://api.artic.edu/api/v1/artworks/search',{params})
        //Once completed - set availableArtworksObjects to the aboves data.data property where the actual array of objects exists
        const availableArtWorksObjects = getAvailableIDs.data.data;
        
        //Iterate through the availableArtWorksObjects array and create a new array called artworkIds containing just the ID's
        const artworkIds = availableArtWorksObjects.map((artworkObj) =>artworkObj.id)
       
        //Set an empty artCollections array
        const artCollection = []
           
  
              
                //While the artworkIds length is not breached, continue to iterate through the artworksIds array to caputre the id
                //Place the id value into the axio request which calls a different api to fetch individual artworks
               for(let i=0;i<artworkIds.length ;i++){

                //2 - Get individual artworks
                try {
                 
                    //Set artworkData to the result of the axios request
                    const artworkData = await axios(`https://api.artic.edu/api/v1/artworks/${artworkIds[i]}`)
                    //Set the artworkDetails variable to the value of artworkData and it's property data, then data again
                    const artworkDetails = artworkData.data.data;
                    //Seperately set the base url for fetching image details - details from artworkDetails will be used to concatenate info to this url 
                    const artworkImgDetails = artworkData.data.config
                
                 //Push into the artCollection array an new object containing the artwork data from the artworkDetails variable
                 //Images use a data from artworkImgDetails and artworkDetails
                 if(artworkDetails.img && artworkDetails.smallImg){
                  
                 }       
                    artCollection.push({
                        classification:artworkDetails.artwork_type_title,
                        medium:artworkDetails.term_titles,
                        id:artworkDetails.id,  
                        title: artworkDetails.title || 'Unknown',
                        artist: artworkDetails.artist_title || 'Unknown Artist',
                        date: artworkDetails.date_end || 'Unknown',
                        department: artworkDetails.department_title,
                        img:`${artworkImgDetails.iiif_url}/${artworkDetails.image_id}/full/600,/0/default.jpg`,
                        smallImg:`${artworkImgDetails.iiif_url}/${artworkDetails.image_id}/full/843,/0/default.jpg`,
                        country: artworkDetails.place_of_origin || 'Unknown',
                        creditedTo: artworkDetails.credit_line || 'Credited to unknown',
                        alt: artworkDetails.thumbnail?.alt_text===undefined ?`piece from the ${artworkDetails.department_title} department`:artworkDetails.thumbnail.alt_text,
                        description:artworkDetails.description || 'No description available'
                      });
                    
                }//Catch any errors resulting //2 - Get individual artworks
                catch (error) {

                 console.error(`Error fetching artwork ID ${artworkIds[i]}:`, error.message); 
                }

               
                  
               }//End for loop
               //Return the completed artCollection array
               return artCollection;
               

        
    }//Catch any errors resulting ///1.First try - get a list of artwork IDs 
    catch (error) {
    
        if(error) throw error
        return { status:error.status,message:error.message || 'An error occurred', artCollection: [] };
      
    }


}

const fetchArtInstituteChigagoArtPieceById = async(id)=>{
 
  try {
    
    if(!id) throw {status:404,message:'Artwork Id must be provided'}
  
    if(isNaN(Number(id))) throw {status:400,message:'Artwork Id must of data type number'}
   
    const artworkId = parseInt(id)
    const artworkData = await axios(`https://api.artic.edu/api/v1/artworks/${artworkId}`)
   
    


    if (!artworkData || !artworkData.data.data) {
      throw { status: 404, message: 'Artwork Id does not exist' };
    }
    const artworkDetails = artworkData.data.data;
    //Seperately set the base url for fetching image details - details from artworkDetails will be used to concatenate info to this url 
    const artworkImgDetails = artworkData.data.config

 //Push into the artCollection array an new object containing the artwork data from the artworkDetails variable
 //Images use a data from artworkImgDetails and artworkDetails       
    return{
        classification:artworkDetails.artwork_type_title,
        medium:artworkDetails.term_titles,
        id:artworkDetails.id,  
        title: artworkDetails.title || 'Unknown',
        artist: artworkDetails.artist_title || 'Unknown Artist',
        date: artworkDetails.date_end || 'Unknown',
        department: artworkDetails.department_title,
        img:`${artworkImgDetails.iiif_url}/${artworkDetails.image_id}/full/600,/0/default.jpg`,
        smallImg:`${artworkImgDetails.iiif_url}/${artworkDetails.image_id}/full/843,/0/default.jpg`,
        country: artworkDetails.place_of_origin || 'Unknown',
        creditedTo: artworkDetails.credit_line || 'Credited to unknown',
        alt: artworkDetails.thumbnail?.alt_text===undefined ?`piece from the ${artworkDetails.department_title} department`:artworkDetails.thumbnail.alt_text,
        description:artworkDetails.description || 'No description available'
      };
    

  } catch (error) {

    if (error.response && error.response.status === 404) {
      throw { status: 404, message: 'Artwork Id does not exist' };    
  } else if (error.message) {
    throw error; 
  } else {
   
    throw { status: 500, message: 'An unexpected error occurred' };
  }


    
  }
 
  
}

module.exports = {fetchMetArtCollections,fetchRijksCollections,fetchArtInstituteChigagoCollections,fetchMetArtDepartments,fetchMetArtPieceById,fetchRijksArtPieceById,fetchArtInstituteChigagoArtPieceById,fetchArtInstituteChicagoArtWorkTypes}