const axios = require('axios')
const {config} = require('../firebaseConfig')
const { messaging } = require('firebase-admin')
const rijks_api_key = config.rijks_api_key
const user_collection_id=config.user_collection_id
const Bottleneck = require("bottleneck");






const fetchArtInstituteChicagoArtWorkTypes = async () => {
  
  try {
    const artworkTypeData = await axios('https://api.artic.edu/api/v1/artwork-types', {params:{limit:50}})
    const {data} = artworkTypeData
        if(data.data.length===0){
            throw {status:404,message:'Error retrieving Artwork Types'}
        }
        const chicagoArtworkTypesArray = data.data.map((artworkType) => artworkType.title)
    return chicagoArtworkTypesArray
  } catch (error) {
     throw error
  }

};

const fetchArtInstituteChicagoPlaces = async ()=>{
  try {
          const paginationData = await axios(`https://api.artic.edu/api/v1/places`,
      {params:{limit:100}}
    )
    const {pagination} = paginationData.data
   
    const pages = pagination.total_pages
  
    let placesArray = []
    for(let i = 1; i<=pages;i++ ){
      const placesData = await axios(`https://api.artic.edu/api/v1/places`,
        {params:{limit:100,page:i}}
      )
      
      const {data} = placesData.data
      const placesMap = data.map((place)=>place.title)
      placesArray.push(...placesMap)
   
    }
    
    return placesArray

  } catch (error) {
    throw error
  }
}

const fetchArtInstituteChigagoCollections = async (page,limit,placeOfOrigin,artistName,artTypeTitle,dateBegin,dateEnd,sortBy,q)=>{


  const numbersRegex = /^-?[0-9]*$/


 
  if(placeOfOrigin && numbersRegex.test(placeOfOrigin)) throw({status:400,message:'placeOfOrigin must be a string data type'})
  if(artistName && numbersRegex.test(artistName)) throw({status:400,message:'artistName must be a string data type'})
  if(artTypeTitle && numbersRegex.test(artTypeTitle)) throw({status:400,message:'artTypeTitle must be a string data type'})
  if((!dateBegin && dateEnd)) throw({status:400,message:'you must include a dateBegin value for date filtering'})
    if((dateBegin && !dateEnd)) throw({status:400,message:'you must include a dateEnd value for date filtering'})
  if((dateBegin || dateEnd) && (numbersRegex.test(dateBegin)===false || numbersRegex.test(dateEnd)===false)) throw{status:400,message:'dateBegin and dateEnd values must be integer values'}   
  if(dateBegin && dateEnd && parseInt(dateBegin,10)>parseInt(dateEnd,10)) throw ({status:400,message:'dateBegin cannot be higher than dateEnd'})
   
  if(q && numbersRegex.test(q)) throw({status:400,message:'query must be a string data type'})      

   //Create the parameters for the axios to search all artwork id's that meet the search crtieria - page(set the page number) 
   // limit(number of results per page), q(free text search term)
   //other properties will be added to params object dynamically below
 
  if(page) page = parseInt(page,10)
  if(limit) limit = parseInt(limit, 10)

  
    const params = {
      query: {}, 
      size: limit, 
      from: (page - 1) * limit,
      
    };

   
    if (q && !placeOfOrigin && !artistName && !artTypeTitle && !dateBegin && !dateEnd) {
      params.query = {
        multi_match: {
            query: q,
            fields: ["title", "artist_title", "place_of_origin", "artwork_type_title", "description"],
            type: "phrase"
        }
    };  
  } else {
    params.query.bool = params.query.bool || { must: [] };
    if (q) {
      params.query.bool.must.push({
        multi_match: {
            query: q,
            fields: ["title", "artist_title", "place_of_origin", "artwork_type_title", "description"],
            type: "phrase"
        }
    });
  }

   // Add placeOfOrigin if provided
   if (placeOfOrigin) {
    params.query.bool.must.push({ match_phrase: { place_of_origin: placeOfOrigin } });
}

// Add artistName if provided
if (artistName) {
    params.query.bool.must.push({ match_phrase: { artist_title: artistName } });
}

// Add artTypeTitle if provided
if (artTypeTitle) {
    params.query.bool.must.push({ match_phrase: { artwork_type_title: artTypeTitle } });
}
if (dateBegin || dateEnd) {
  params.query.bool.filter = params.query.bool.filter || [];

  const rangeFilter = { range: { date_start: {} } };
  if (dateBegin !== undefined) {
      rangeFilter.range.date_start.gte = parseInt(dateBegin, 10);
  }
  if (dateEnd !== undefined) {
      rangeFilter.range.date_start.lte = parseInt(dateEnd, 10);
  }

  params.query.bool.filter.push(rangeFilter);
}


  }

   if (isNaN(Number(page))) {
    throw { status: 400, message: 'page must be a number data type' };
  }
  
  if (isNaN(Number(limit))) {
    throw { status: 400, message: 'Number of results (limit) must be a number data type' };
  }
 
  
  if (artTypeTitle && typeof artTypeTitle !== 'string') {
    throw { status: 400, message: 'Artwork type query must be a string data type' };
  }
  
  if (q && typeof q !== 'string') {
    throw { status: 400, message: 'Free search query must be a string data type' };
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
 
   //1.First try - get a list of artwork IDs that match the criteria from the params object above ({params} is passed into the axio request)
   //The result will something like https://api.artic.edu/api/v1/artworks/search?page=1&limit=10&query[bool][must][0][match_phrase][place_of_origin]=China&query[bool][must][1][match_phrase][artwork_type_title]=Painting'
    try {
        
         //Make call the API for searching artwork IDs and set to getAvailableIDs
        const getAvailableIDs = await axios('https://api.artic.edu/api/v1/artworks/search',{params})
        //Once completed - set availableArtworksObjects to the aboves data.data property where the actual array of objects exists
        const availableArtWorksObjects = getAvailableIDs.data.data;
        const {pagination} = getAvailableIDs.data
        
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
                /*  if(artworkDetails.img && artworkDetails.smallImg){
                  
                 }  */      
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
                      artCollection.sort((a,b)=>a.date-b.date)
                    }
    
                    //Sort the artCollection array in date ASC
                    if(sortBy === 'dateDESC') {
                      artCollection.sort((a,b)=>b.date-a.date)
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
    

               return {pagination,artCollection};
               

        
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


const fetchClevelandArtCollections = async(q,skip, limit,department,culture,type,created_before, created_after,title,artists,sortBy)=>{

  try {

    const params = {has_image:1}
    const numbersRegex = /^-?[0-9]*$/
    if(q && numbersRegex.test(parseInt(q,10))) {throw{status:400,message:'query parameter must be a string'}}
    if(skip && !numbersRegex.test(parseInt(skip),10)) {throw{status:400,message:'skip parameter must be an integer'}}    
    if(limit && !numbersRegex.test(parseInt(limit),10)) {throw{status:400,message:'limit parameter must be an integer'}}    
    if(department && numbersRegex.test(parseInt(department,10))) {throw{status:400,message:'department parameter must be a string'}}
    if(type && numbersRegex.test(parseInt(type,10))) {throw{status:400,message:'type parameter must be a string'}}
    if(title && numbersRegex.test(parseInt(title,10))) {throw{status:400,message:'title parameter must be a string'}}
    if(artists && numbersRegex.test(parseInt(artists,10))) {throw{status:400,message:'artists parameter must be a string'}}
    if(culture && numbersRegex.test(parseInt(culture,10))) {throw{status:400,message:'culture parameter must be a string'}}
    if(q) {params.q = q}
    if(skip) {params.skip = parseInt(skip,10)}
    if(limit) {params.limit = parseInt(limit,10)}
    if(department) {params.department = department}
    if(type) {params.type = type}
    if(created_before) {params.created_before = parseInt(created_before,10)}
    if(created_after) {params.created_after = parseInt(created_after,10)}
    if(title) {params.title = title}
    if(artists) {params.artists = artists}
    if(culture) {params.culture = culture}
  
    

    const clevelandResponse = await axios('https://openaccess-api.clevelandart.org/api/artworks/',{params})
   
  
    const clevelandArtWorkDetails = clevelandResponse.data.data

    ///Apply sorting

    if (sortBy === 'titleASC') {
      clevelandArtWorkDetails.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: 'base' })
      );
    }
     //Sort the artCollecion array in title ASC order 
    if (sortBy === 'titleDESC') {
      clevelandArtWorkDetails.sort((a, b) =>
        (b.title || "").localeCompare(a.title || "", undefined, { sensitivity: 'base' })
      );
    }

    //Sort the artCollection array in date ASC
    if(sortBy === 'dateASC') {
      clevelandArtWorkDetails.sort((a,b)=>a.creation_date_earliest-b.creation_date_earliest)
    }

    //Sort the artCollection array in date ASC
    if(sortBy === 'dateDESC') {
      clevelandArtWorkDetails.sort((a,b)=>b.creation_date_earliest-a.creation_date_earliest)
    }

    if (sortBy === 'artistASC') {
      clevelandArtWorkDetails.sort((a, b) =>
        ((a.creators?.[0]?.description || "").localeCompare(b.creators?.[0]?.description || "", undefined, { sensitivity: 'base' }))
      );
    }
    
    if (sortBy === 'artistDESC') {
      clevelandArtWorkDetails.sort((a, b) =>
        ((b.creators?.[0]?.description || "").localeCompare(a.creators?.[0]?.description || "", undefined, { sensitivity: 'base' }))
      );
    }
    
  
    let clevelandArtCollection = []

   clevelandArtWorkDetails.forEach((artwork) => {

     
       clevelandArtCollection.push({
        id:artwork.id, 
        artist: artwork.creators[0]?.description || 'Unknown Artist',
        description:artwork.description || 'No description available',
        title: artwork.title || 'Unknown',
        date: artwork.creation_date || 'Unknown',
        earliest_date: artwork.creation_date_earliest || 'Unknown',
        latest_date: artwork.creation_date_latest || 'Unknown',
        type:artwork.type || 'Unknown',
        department:artwork.department || 'Unknown',
        country: artwork.culture[0] || 'Unknown',
        img:artwork.images.web?.url === undefined? 'No Image': artwork.images.web.url,
        linkToWebSiteImg:artwork.url,     
        creditedTo: artwork.creditline || 'Credited to unknown',
        alt: `artwork piece classifed as ${artwork.type} from the ${artwork.department} department by ${artwork.creators[0]?.description === undefined ? 'Unknown Artists':artwork.creators[0]?.description}`
       
      }); 
      
    });

  

 return clevelandArtCollection
    
  } catch (error) {
    
    throw error
  }
    
}

const fetchClevelandArtPiece = async(id)=>{

  if(!id) throw{status:400,message: 'ID must be provided'}

  try {

    const clevelandResponse = await axios(`https://openaccess-api.clevelandart.org/api/artworks/${id}`)
   
  
    const clevelandArtPiece = clevelandResponse.data.data

    return{
      id:clevelandArtPiece.id, 
      artist: clevelandArtPiece.creators[0]?.description || 'Unknown Artist',
      description:clevelandArtPiece.description || 'No description available',
      title: clevelandArtPiece.title || 'Unknown',
      date: clevelandArtPiece.creation_date || 'Unknown',
      earliest_date: clevelandArtPiece.creation_date_earliest || 'Unknown',
      latest_date: clevelandArtPiece.creation_date_latest || 'Unknown',
      type:clevelandArtPiece.type || 'Unknown',
      department:clevelandArtPiece.department || 'Unknown',
      country: clevelandArtPiece.culture[0] || 'Unknown',
      img:clevelandArtPiece.images.web?.url === undefined? 'No Image': clevelandArtPiece.images.web.url,
      linkToWebSiteImg:clevelandArtPiece.url,     
      creditedTo: clevelandArtPiece.creditline || 'Credited to unknown',
      alt: `artwork piece classifed as ${clevelandArtPiece.type} from the ${clevelandArtPiece.department} department by ${clevelandArtPiece.creators[0]?.description === undefined ? 'Unknown Artists':clevelandArtPiece.creators[0]?.description}`
     
    }

   
  } catch (error) {
   
    throw error
  }

}
module.exports = {fetchMetArtCollections,fetchArtInstituteChigagoCollections,fetchMetArtDepartments,fetchMetArtPieceById,fetchArtInstituteChigagoArtPieceById,fetchArtInstituteChicagoArtWorkTypes,fetchArtInstituteChicagoPlaces,fetchClevelandArtCollections,fetchClevelandArtPiece }