const request = require('supertest')
const app = require('../app')
const { adminDb, firebaseAdmin } = require('../firebaseConfig');
const { retrieveLogin } = require("../models/login.models");
const { insertNewSignUp } = require('../models/postNewSignUp.models');
const { getUidByEmail } = require('../utils/getUidByEmail');
const { insertNewArtCollection, fetchUserCollections, fetchAllPublicCollections, fetchPublicCollectionById, removeCollectionById } = require('../models/artCollections.models');
const { getUserCollections, deleteCollectionById } = require('../controllers/artCollections.controllers');
const { addArtworkToCollection, removeArtworkFromCollection } = require('../models/manageCollections.models');
const { createNewSubscription, removeSubscription, fetchSubscriptions } = require('../models/subscriptions.models');


jest.setTimeout(10000);

// Function to delete all documents in a Firestore collection
const clearFirestoreCollection = async (collectionName) => {
  const collectionRef = adminDb.collection(collectionName);
  const snapshot = await collectionRef.get();
  const batch = adminDb.batch();

  snapshot.docs.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();
};

// Function to delete all users in Firebase Authentication
const clearAuthenticationUsers = async () => {
  const listUsersResult = await firebaseAdmin.auth().listUsers();
  const userIds = listUsersResult.users.map((user) => user.uid);

  const deletePromises = userIds.map((uid) => firebaseAdmin.auth().deleteUser(uid));

  await Promise.all(deletePromises);
};

// Jest setup to run before all tests
beforeAll(async () => {
 /*  console.log('Cleaning up Firestore and Authentication before tests...'); */
  await clearFirestoreCollection(process.env.USER_COLLECTION_ID); // Remove `users_test` collection
  await clearFirestoreCollection(process.env.ART_COLLECTIONS_COLLECTION_ID)
  await clearAuthenticationUsers(); // Remove all authentication users
/*   console.log('Cleanup complete.'); */
});

describe('/api',()=>{
    test('GET 200: initial API test',async()=>{
      const {body} = await request(app)
      .get('/api')
      .expect(200)
      expect(body.msg).toBe('Welcome to arto-facts API - please read the README.md on github!')
    })
})


describe('/api/collections/MetArtMuseum',()=>{
  test('GET 200: call to Met Art Museum returns an array with 10 results', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=6&searchTerm=""`)
    .expect(200)
 
   expect(body.metArtWorks).toHaveLength(10)
  })
})

describe('/api/collections/MetArtMuseum',()=>{
  test('GET 200: call to Met Art Museum returns an array objects containing all the correct properties', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=6&searchTerm=""`)
    .expect(200)
      
   body.metArtWorks.forEach((artWork)=>{
    expect(artWork).toEqual(
      expect.objectContaining({
        classification: expect.any(String),
        medium: expect.any(String),
        id: expect.any(Number),
        title: expect.any(String),
        artist: expect.any(String),
        date: expect.any(Number),
        department: expect.any(String),
        img: expect.any(String),
        smallImg: expect.any(String),
        country: expect.any(String),
        creditedTo: expect.any(String),
        alt: expect.any(String),
      })
    );
   })
  })
})

describe('/api/collections/MetArtMuseum',()=>{
  test('GET 400: call to Met Art Museum with an incorrect limit data type returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=x&offset=10&departmentId=6&searchTerm=""`)
    .expect(400)
      expect(body.message).toBe('Results per page must be a number data type')
 
  
  })
  test('GET 400: call to Met Art Museum with an incorrect offset datatype returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=x&departmentId=6&searchTerm=""`)
    .expect(400)
      expect(body.message).toBe('Artwork result starting position must be a number data type')
 
  
  });
  test('GET 400: call to Met Art Museum with an incorrect deparmentId datatype returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=x&searchTerm=""`)
    .expect(400)
      expect(body.message).toBe('Department ID must be a number data type')
 
  
  });
  test('GET 400: call to Met Art Museum with an incorrect type datatype returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=6&type=9999&searchTerm=""`)
    .expect(400)
      expect(body.message).toBe('Artwork type query must be a string data type')
 
  
  });
  test('GET 400: call to Met Art Museum with an unrecognised type returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=6&type=NOTATYPE&searchTerm=""`)
    .expect(400)
       expect(body.message).toBe('Error fetching availble artwork ids')
 
  
  });
  test('GET 400: call to Met Art Museum with a limit of less than 10 returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=9&offset=0&departmentId=6&searchTerm=""`)
    .expect(400)
       expect(body.message).toBe('Results per page can not be lower than 10')
 
  
  });
  test('GET 400: call to Met Art Museum with a limit of more than 50 returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=51&offset=0&departmentId=6&searchTerm=""`)
    .expect(400)
       expect(body.message).toBe('Results per page can not exceed 50')
 
  
  });
  test('GET 404: call to Met Art Museum with an offset or page start of more than the available objects returns a 404 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=999999999999999999&departmentId=6&searchTerm=""`)
    .expect(404)
       expect(body.message).toBe('Offset or Page start exceeds the number of available artworks')
 
  
  });
  test('GET 404: call to Met Art Museum with an unrecognised department id returns a 404 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=999999&searchTerm=""`)
    .expect(404)
       expect(body.message).toBe('DepartmentId does not exist')
 
  
  });
  test('GET 404: call to Met Art Museum with a unrecognised query returns a 404 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=6&searchTerm="NOTASEARCHTEARM"`)
    .expect(400)

    expect(body.message).toBe('Error fetching availble artwork ids')

 
  
  });
})

describe('/api/collections/MetArtMuseum/:id',()=>{
  test('GET 200: call to fetch met art piece by id returns a single art piece and returns a status of 200',async()=>{
    const {body} = await request(app)
    .get('/api/collections/MetArtMuseum/39887')
    .expect(200)
    expect(body).toEqual(
      expect.objectContaining({
        classification: expect.any(String),
        medium: expect.any(String),
        id: expect.any(Number),
        title: expect.any(String),
        artist: expect.any(String),
        date: expect.any(Number),
        department: expect.any(String),
        img: expect.any(String),
        smallImg: expect.any(String),
        country: expect.any(String),
        creditedTo: expect.any(String),
        alt: expect.any(String),
      })
    )
    
  })
  test('GET 200: call to fetch met art piece by id with a non existent id returns a 404 status and an error message',async()=>{
    const {body} = await request(app)
    .get('/api/collections/MetArtMuseum/39887')
    .expect(200)
    expect(body).toEqual(
      expect.objectContaining({
        classification: expect.any(String),
        medium: expect.any(String),
        id: expect.any(Number),
        title: expect.any(String),
        artist: expect.any(String),
        date: expect.any(Number),
        department: expect.any(String),
        img: expect.any(String),
        smallImg: expect.any(String),
        country: expect.any(String),
        creditedTo: expect.any(String),
        alt: expect.any(String),
      })
    )
    
  })
 
})





describe('/api/collections/RijksMuseum',()=>{
 test('GET 200: call to Rijks Museum API returns an array of objects with the correct keys and datatypes',async ()=>{   
  await new Promise(resolve => setTimeout(resolve, 2000));  
  const {body:{rijksArtWorks}} = await request(app)
    .get('/api/collections/RijksMuseum?p=1&ps=10&q=""')
    .expect(200)
    for(let i=0;i<rijksArtWorks.length;i++){
      expect(Array.isArray(rijksArtWorks[i].classification) || typeof rijksArtWorks[i].classification === 'string').toBe(true)
      expect(Array.isArray(rijksArtWorks[i].medium) || typeof rijksArtWorks[i].classification === 'string').toBe(true)
      expect(typeof rijksArtWorks[i].id === 'string').toBe(true)
      expect(typeof rijksArtWorks[i].title === 'string').toBe(true)
      expect(typeof rijksArtWorks[i].artist === 'string').toBe(true)
      expect(typeof rijksArtWorks[i].date === 'string' || typeof rijksArtWorks[i].date === 'number').toBe(true)
      expect(Array.isArray(rijksArtWorks[i].department) || typeof rijksArtWorks[i].department === 'string').toBe(true)
      expect(typeof rijksArtWorks[i].img === 'string').toBe(true)
      expect(Array.isArray(rijksArtWorks[i].country) || typeof rijksArtWorks[i].country === 'string').toBe(true)
      expect(typeof rijksArtWorks[i].creditedTo === 'string').toBe(true)
      expect(typeof rijksArtWorks[i].alt === 'string').toBe(true)
    }

    expect(rijksArtWorks).toHaveLength(10)
    

  });
  test('GET 400: call to Rijks Museum API without a results per page value returns a 400 erro and an error message',async ()=>{
    const {body} = await request(app)
    .get('/api/collections/RijksMuseum?&ps=10&q=""')
    .expect(400)
    expect(body.message).toBe('Page number must be given')
    

  });
  test('GET 400: call to Rijks Museum API without a result page value returns a 400 erro and an error message',async ()=>{
    const {body} = await request(app)
    .get('/api/collections/RijksMuseum?&p=1&q=""')
    .expect(400)
    expect(body.message).toBe('Results per page must be given')
    

  });

  test('GET 400: call to Rijks Museum API with invalid searchTerm returns a status 400 and an error message',async()=>{
    const {body} = await request(app)
    .get(`/api/collections/RijksMuseum?&p=1&ps=10&q=""&searchTerm=9999`)
    .expect(400)
    expect(body.message).toBe('searchTerm must be a string data type')
  })
  
  test('GET 200: call to Rijks Museum API to get artpiece by id returns an object with all the correct keys and datatypes of a single ar piece',async()=>{
    await new Promise(resolve => setTimeout(resolve, 2000));  
    const {body} = await request(app)
    .get('/api/collections/RijksMuseum/AK-MAK-292')
    .expect(200)
   
      expect(Array.isArray(body.classification) || typeof body.classification === 'string').toBe(true)
      expect(Array.isArray(body.medium) || typeof body.classification === 'string').toBe(true)
      expect(typeof body.id === 'string').toBe(true)
      expect(typeof body.title === 'string').toBe(true)
      expect(typeof body.artist === 'string').toBe(true)
      expect(typeof body.date === 'string' || typeof body.date === 'number').toBe(true)
      expect(Array.isArray(body.department) || typeof body.department === 'string').toBe(true)
      expect(typeof body.img === 'string').toBe(true)
      expect(Array.isArray(body.country) || typeof body.country === 'string').toBe(true)
      expect(typeof body.creditedTo === 'string').toBe(true)
      expect(typeof body.alt === 'string').toBe(true)
 
  })
  test('GET 200: call to Rijks Museum API to get artpiece with invalid id returns a 404 status and an error message',async()=>{
    await new Promise(resolve => setTimeout(resolve, 2000));  
    const {body} = await request(app)
    .get('/api/collections/RijksMuseum/NOTANID')
    .expect(404)
   
    expect(body.message).toBe('Artwork Id does not exist')
 
  })
 

})



describe('/api/collections/ArtInstitueChicago',()=>{
  test('GET 200: call to Chicago Art Institute API returns a 200 staus with an array of objects containing the correct keys and datatypes',async ()=>{
    const {body:{ArtInstituteOfChicago}} = await request(app)
    .get('/api/collections/ArtInstitueChicago?page=1&limit=10&q=""')
    .expect(200)
    
    for(let i=0; i<ArtInstituteOfChicago.length;i++){
      expect(typeof ArtInstituteOfChicago[i].classification === 'string').toBe(true)
      expect(Array.isArray(ArtInstituteOfChicago[i].medium)).toBe(true)
      expect(typeof ArtInstituteOfChicago[i].id === 'number').toBe(true)
      expect(typeof ArtInstituteOfChicago[i].title === 'string').toBe(true)
      expect(typeof ArtInstituteOfChicago[i].artist === 'string').toBe(true)
      expect(typeof ArtInstituteOfChicago[i].date === 'number').toBe(true)
      expect(typeof ArtInstituteOfChicago[i].department === 'string').toBe(true)
      expect(typeof ArtInstituteOfChicago[i].img === 'string').toBe(true)
      expect(typeof ArtInstituteOfChicago[i].smallImg === 'string').toBe(true)
      expect(typeof ArtInstituteOfChicago[i].country === 'string').toBe(true)
      expect(typeof ArtInstituteOfChicago[i].creditedTo === 'string').toBe(true)
      expect(typeof ArtInstituteOfChicago[i].alt === 'string').toBe(true)
      expect(typeof ArtInstituteOfChicago[i].description === 'string').toBe(true)
    }
   
  })
  test('GET 200: call to Chicago Art Institute API returns a 200 staus with an array of objects containing the correct keys and datatypes',async ()=>{
    const {body:{ArtInstituteOfChicago}} = await request(app)
    .get('/api/collections/ArtInstitueChicago?page=1&limit=10&q=""&placeOfOrigin=China')
    .expect(200)
    
    
     for(let i=0; i<ArtInstituteOfChicago.length;i++){
    
      expect(ArtInstituteOfChicago[i].country === 'China').toBe(true)
     
    } 
   
  })

  
  test('GET 400: call to Chicago Art Institute API with an invalid page query returns a 400 staus with an error message',async ()=>{
    const {body} = await request(app)
    .get('/api/collections/ArtInstitueChicago?page=x&limit=10&q=""&placeOfOrigin=China')
    .expect(400)
    expect(body.message).toBe('page must be a number data type')
   
  });
  test('GET 400: call to Chicago Art Institute API with an invalid limit query returns a 400 staus with an error message',async ()=>{
    const {body} = await request(app)
    .get('/api/collections/ArtInstitueChicago?page=1&limit=x&q=""&placeOfOrigin=China')
    .expect(400)
    expect(body.message).toBe('Number of results (limit) must be a number data type')
   
  })
  test('GET 400: call to Chicago Art Institute API with an invalid query returns a 400 staus with an error message',async ()=>{
    const {body} = await request(app)
    .get('/api/collections/ArtInstitueChicago?page=1&limit=10&q=9999&placeOfOrigin=China')
    .expect(400)
    expect(body.message).toBe('query must be a string data type')
   
  })

})

describe('api/collections/ArtInstitueChicago/:id',()=>{
  test('GET 200: call to Chicago Institute of Art API by id returns an object with all the correct keys and datatypes of a single artwork',async()=>{
    const {body} = await request(app)
    .get('/api/collections/ArtInstitueChicago/25247')
    .expect(200)
    expect(typeof body.classification === 'string').toBe(true)
    expect(Array.isArray(body.medium)).toBe(true)
    expect(typeof body.id === 'number').toBe(true)
    expect(typeof body.title === 'string').toBe(true)
    expect(typeof body.artist === 'string').toBe(true)
    expect(typeof body.date === 'number').toBe(true)
    expect(typeof body.department === 'string').toBe(true)
    expect(typeof body.img === 'string').toBe(true)
    expect(typeof body.smallImg === 'string').toBe(true)
    expect(typeof body.country === 'string').toBe(true)
    expect(typeof body.creditedTo === 'string').toBe(true)
    expect(typeof body.alt === 'string').toBe(true)
    expect(typeof body.description === 'string').toBe(true)

  })
  test('GET 400:call to API with invalid id data type returns a 400 status and an error message',async()=>{
    const {body} = await request(app)
    .get('/api/collections/ArtInstitueChicago/NOTANID')
    .expect(400)
    expect(body.message).toBe('Artwork Id must of data type number')
  });
  test('GET 404:call to API with non existent id returns a 404 status and an error message',async()=>{
    const {body} = await request(app)
    .get('/api/collections/ArtInstitueChicago/999999999999')
    .expect(404)
    expect(body.message).toBe('Artwork Id does not exist')
  })
})

  describe('/api/signup',()=>{
    test('POST 201: signing up with email and password generates a custom token and authenticates user',async()=>{
      const email1 = "angiebrook1@hotmail.co.uk";
      const password1= "Ebarin88";
      const username1 = "Japangie88"
      const email2 = "wgyves@hotmail.com";
      const password2= "Goater83";
      const username2 = "F3tters83"
      const result1 = await insertNewSignUp(email1,password1,username1)
      const result2 = await insertNewSignUp(email2,password2,username2)
      expect(result1).toHaveProperty("token");
      expect(result2).toHaveProperty("token");

    })
  })

  describe('/api/login',()=>{
    test('POST 2O1:login with valid email and password successfully creates token',async()=>{
      const email1 = "angiebrook1@hotmail.co.uk";
      const password1= "Ebarin88";

      const email2 = "wgyves@hotmail.com";
      const password2= "Goater83";
    

      const result1 = await retrieveLogin(email1, password1);
      const result2 = await retrieveLogin(email2, password2);
      expect(result1).toHaveProperty("token");
      expect(result2).toHaveProperty("token");
    })
  })


describe('/api/art-collections',()=>{
  test('POST 201: User with the correct request body can create a new collection',async()=>{
    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    
      const uid = testUserId1
      const title='Asia Art Collection'
      const description ='A collection of the best Asian Art Pieces'
      const isPublic = true
    
    const result = await insertNewArtCollection(uid,title,description,isPublic)
    expect(result.message).toBe("Art collection created successfully")
  

  });
  test('POST 400: Invalid request body to create new collection returns a status of 400 and an errr message',async()=>{
    const title='Asia Art Collection'
    const description ='A collection of the best Asian Art Pieces'
    const isPublic = true

    try {
      await insertNewArtCollection(title,description,isPublic)
    } catch (error) {
      expect(error.status).toBe(400);
      expect(error.message).toBe('One or more fields are missing or invalid');
    }
   
    })
  
  test('GET 200: User can fetch all public collections',async()=>{
    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    const result = await fetchAllPublicCollections()
      expect(result[0].userId).toBe(testUserId1)
      expect(result[0].title).toBe('Asia Art Collection')
      expect(result[0].description).toBe('A collection of the best Asian Art Pieces')
      expect(result[0].isPublic).toBe(true)
      expect(result[0].artworks).toStrictEqual([])
      expect(result[0].subscribers).toStrictEqual([])
      expect(typeof result[0].createdAt).toBe('string')
      expect(typeof result[0].updatedAt).toBe('string')

  })
 
  
})

describe('/api/art-collections/:userId',()=>{
  test('GET 200: User can fetch all their own created collections',async()=>{
    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    const result  = await fetchUserCollections(testUserId1)
    expect(result[0].userId).toBe(testUserId1)
    expect(result[0].title).toBe('Asia Art Collection')
    expect(result[0].description).toBe('A collection of the best Asian Art Pieces')
    expect(result[0].isPublic).toBe(true)
    expect(result[0].artworks).toStrictEqual([])
    expect(result[0].subscribers).toStrictEqual([])
    expect(typeof result[0].createdAt).toBe('string')
    expect(typeof result[0].updatedAt).toBe('string')
  })

  test('GET 400:fetching user collections by id with invalid uid returns a 400 error and an error message',async()=>{
    try {
      await fetchUserCollections(); // Call without uid
  } catch (error) {
      expect(error.status).toBe(400);
      expect(error.message).toBe('uid is missing or invalid');
  }
  })


})

describe('/api/art-collections/collections/:collectionId',()=>{
  test('GET 200: User can fetch pubic collection by Id',async()=>{

      const result1 = await fetchAllPublicCollections()
      const collectionId = result1[0].id
      const result2 = await fetchPublicCollectionById(collectionId)
      expect(result2.id).toBe(result1[0].id)
      expect(result2.artworks).toStrictEqual([])
      expect(result2.subscribers).toStrictEqual([])
      expect(result2.userId).toBe(result1[0].userId)
      expect(result2.title).toBe(result1[0].title)
      expect(result2.description).toBe(result1[0].description)
      expect(result2.isPublic).toBe(result1[0].isPublic)
      expect(result2.createdAt).toBe(result1[0].createdAt)
      expect(result2.updatedAt).toBe(result1[0].updatedAt)
      
  


  });
  test('GET 400:Invalid collection id returns a 400 and an error message',async()=>{

    try {
    await fetchPublicCollectionById()
    } catch (error) {

      expect(error.status).toBe(400)
      expect(error.message).toBe('Invalid collectionId. It must be a non-empty string.')
      
    }
  });
 
})

describe('api/manage-collections/collectionId/artwork',()=>{
  test('POST 200: user can save an artwork to a collection',async()=>{
    const artwork = { "artwork":{
      "classification": "Paintings",
       "medium": "Hanging scroll; ink on silk",
       "id": "39888",
       "title": "Wild geese descending to sandbar",
       "artist": "Unidentified artist",
       "date": "1533",
       "department": "Asian Art",
       "img": "https://images.metmuseum.org/CRDImages/as/original/DT6930.jpg",
       "smallImg": "https://images.metmuseum.org/CRDImages/as/web-large/DT6930.jpg",
       "country": "Unknown",
       "creditedTo": "Purchase, Harris Brisbane Dick Fund, John M. Crawford Jr. Bequest, and The Vincent Astor Foundation Gift, 1992",
       "alt": "Hanging scroll"
   }}
   const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
   const result1 = await fetchAllPublicCollections()
   const collectionId = result1[0].id

  const result = await addArtworkToCollection(collectionId,artwork,testUserId1)
  expect(result.message).toBe("Artwork added successfully")

  });
  test('POST 400; invalid artwork obj returns 400 status and message',async()=>{
   const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
   const result1 = await fetchAllPublicCollections()
   const collectionId = result1[0].id 

   try {
    await addArtworkToCollection(collectionId,"",testUserId1)
   } catch (error) {
    expect(error.status).toBe(400)
    expect(error.message).toBe('Invalid artwork object. It must not be empty')
    
   }
  });
  test('POST 400; invalid collection id returns 400 status and message',async()=>{
    const artwork = { "artwork":{
      "classification": "Paintings",
       "medium": "Hanging scroll; ink on silk",
       "id": "39888",
       "title": "Wild geese descending to sandbar",
       "artist": "Unidentified artist",
       "date": "1533",
       "department": "Asian Art",
       "img": "https://images.metmuseum.org/CRDImages/as/original/DT6930.jpg",
       "smallImg": "https://images.metmuseum.org/CRDImages/as/web-large/DT6930.jpg",
       "country": "Unknown",
       "creditedTo": "Purchase, Harris Brisbane Dick Fund, John M. Crawford Jr. Bequest, and The Vincent Astor Foundation Gift, 1992",
       "alt": "Hanging scroll"
   }}
   const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')

   try {
    await addArtworkToCollection("",artwork,testUserId1)
   } catch (error) {
    expect(error.status).toBe(400)
    expect(error.message).toBe('Invalid collectionId. It must be a non-empty string.')
    
   }
  });
  test('POST 400; invalid userId returns 400 status and message',async()=>{
    const artwork = { "artwork":{
      "classification": "Paintings",
       "medium": "Hanging scroll; ink on silk",
       "id": "39888",
       "title": "Wild geese descending to sandbar",
       "artist": "Unidentified artist",
       "date": "1533",
       "department": "Asian Art",
       "img": "https://images.metmuseum.org/CRDImages/as/original/DT6930.jpg",
       "smallImg": "https://images.metmuseum.org/CRDImages/as/web-large/DT6930.jpg",
       "country": "Unknown",
       "creditedTo": "Purchase, Harris Brisbane Dick Fund, John M. Crawford Jr. Bequest, and The Vincent Astor Foundation Gift, 1992",
       "alt": "Hanging scroll"
   }}
   const result1 = await fetchAllPublicCollections()
   const collectionId = result1[0].id 

   try {
    await addArtworkToCollection(collectionId,artwork,"")
   } catch (error) {
    expect(error.status).toBe(400)
    expect(error.message).toBe('uid is missing or invalid')
    
   }
  });

  test('DELETE 403: user attempts to remove an artwork from another users collection returns a 403 status and an error message',async()=>{
    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    const testUserId2=await getUidByEmail('wgyves@hotmail.com')
    const result = await fetchUserCollections(testUserId1)
    const collectionId = result[0].id
     const id = "39888"
    try {
     await removeArtworkFromCollection(collectionId,id,testUserId2)
    } catch (error) {
      expect(error.status).toBe(403)
      expect(error.message).toBe("You do not have permission to delete from this collection")
    }
   
   
  });

    test('DELETE 200: User can remove artwork from collection',async()=>{
    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    const result1 = await fetchUserCollections(testUserId1)
    const collectionId = result1[0].id
    const id = "39888"
    const result2 = await removeArtworkFromCollection(collectionId,id,testUserId1)
    expect(result2.message).toBe('Artwork removed successfully')

  });

  test('DELETE 400:Invalid collection id returns a 400 status and an error message',async()=>{
    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    const id = "39888"
    try {
     await removeArtworkFromCollection("",id,testUserId1)
    } catch (error) {
      expect(error.status).toBe(400)
      expect(error.message).toBe('Invalid collectionId. It must be a non-empty string.')
    }
   
   
  });
  test('DELETE 400:Invalid artwork id returns a 400 status and an error message',async()=>{
    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    const result = await fetchUserCollections(testUserId1)
    const collectionId = result[0].id
    try {
     await removeArtworkFromCollection(collectionId,"",testUserId1)
    } catch (error) {
      expect(error.status).toBe(400)
      expect(error.message).toBe('Invalid artwork id')
    }
   
   
  });
  test('DELETE 400: missing userId returns a 400 status and an error message',async()=>{
    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    const result = await fetchUserCollections(testUserId1)
    const collectionId = result[0].id
     const id = "39888"
    try {
     await removeArtworkFromCollection(collectionId,id,"")
    } catch (error) {
      expect(error.status).toBe(400)
      expect(error.message).toBe('uid is missing or invalid')
    }
   
   
  });

})


describe('api/subscriptions',()=>{
  test('POST 200: user can subscribe to public collection',async()=>{

    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    const testUserId2=await getUidByEmail('wgyves@hotmail.com')
    
      const uid = testUserId2
      const title='Manchester Collection'
      const description ='A collection of the best Mancunion Pieces'
      const isPublic = true
      const artwork = { "artwork":{
        "classification": "Paintings",
         "medium": "Hanging scroll; ink on silk",
         "id": "39888",
         "title": "Wild geese descending to sandbar",
         "artist": "Unidentified artist",
         "date": "1533",
         "department": "Asian Art",
         "img": "https://images.metmuseum.org/CRDImages/as/original/DT6930.jpg",
         "smallImg": "https://images.metmuseum.org/CRDImages/as/web-large/DT6930.jpg",
         "country": "Unknown",
         "creditedTo": "Purchase, Harris Brisbane Dick Fund, John M. Crawford Jr. Bequest, and The Vincent Astor Foundation Gift, 1992",
         "alt": "Hanging scroll"
     }}

      try {
         //test user 2 creates a public collection
        await insertNewArtCollection(uid,title,description,isPublic)
        //test user 2 adds art to a collection
        const result1  = await fetchUserCollections(testUserId2)
        const collectionId = result1[0].id
        await addArtworkToCollection(collectionId,artwork,testUserId2)
        //test user 1 subscribes to test user 2 collection
        const result2 = await createNewSubscription(collectionId,testUserId1)
        expect(result2.message).toBe("Subscription created successfully")

      } catch (error) {
        console.log(error)
      }
  })

  test('POST 403: user can subscribing to private collection returns a 403 status and an error message',async()=>{

    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    const testUserId2=await getUidByEmail('wgyves@hotmail.com')
    
      const uid = testUserId2
      const title='Manchester Collection'
      const description ='A collection of the best Mancunion Pieces'
      const isPublic = false
      const artwork = { "artwork":{
        "classification": "Paintings",
         "medium": "Scroll",
         "id": "39889",
         "title": "Manchester Skyline",
         "artist": "Unidentified artist",
         "date": "1533",
         "department": "Asian Art",
         "img": "https://images.metmuseum.org/CRDImages/as/original/DT6930.jpg",
         "smallImg": "https://images.metmuseum.org/CRDImages/as/web-large/DT6930.jpg",
         "country": "Unknown",
         "creditedTo": "Purchase, Harris Brisbane Dick Fund, John M. Crawford Jr. Bequest, and The Vincent Astor Foundation Gift, 1992",
         "alt": "Hanging scroll"
     }}

      try {
         //test user 2 creates a private collection
        const collectionRef = await insertNewArtCollection(uid,title,description,isPublic)
        
        //test user 2 adds art to a collection
        const collectionId = collectionRef.collectionId
       
        await addArtworkToCollection(collectionId,artwork,testUserId2)
        //test user 1 attempts to subscribe to test user 2 private collection
        await createNewSubscription(collectionId,testUserId1)
       

      } catch (error) {
        expect(error.status).toBe(403)
        expect(error.message).toBe("Collection is not public and can't be subscribed to")

  }});
  test('POST 400; invalid collection id returns a 400 status and an error message',async()=>{
    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    
    
      const uid = testUserId1
      try {
          
        await createNewSubscription("",uid)
        } catch (error) {
          expect(error.status).toBe(400)
          expect(error.message).toBe("Invalid collectionId. It must be a non-empty string.")
        }
  }); 
  test('POST 400; invalid collection id returns a 400 status and an error message',async()=>{
    const testUserId2=await getUidByEmail('wgyves@hotmail.com')
    const result1  = await fetchUserCollections(testUserId2)
     const collectionId = result1[0].id
      try {
          
        await createNewSubscription(collectionId,"")
        } catch (error) {
          expect(error.status).toBe(400)
          expect(error.message).toBe('uid is missing or invalid')
        }
  });
  test('DELETE 200: User can successfully remove a subscription', async () => {
    const testUserId1 = await getUidByEmail('angiebrook1@hotmail.co.uk');
    const testUserId2 = await getUidByEmail('wgyves@hotmail.com');

    const uid = testUserId1;
    const title = 'Manchester Collection';
    const description = 'A collection of the best Mancunion Pieces';
    const isPublic = true;

    // Test user 2 creates a public collection
    const collectionRef = await insertNewArtCollection(testUserId2, title, description, isPublic);
    const collectionId = collectionRef.collectionId;

    // Test user 1 subscribes to the collection
    await createNewSubscription(collectionId, testUserId1);

    // Test user 1 removes the subscription
    const result = await removeSubscription(collectionId, testUserId1);

    expect(result).toEqual({
        message: 'Subscription removed successfully',
        collectionId,
    });
});

test('DELETE 400: Removing subscription with invalid collection ID returns 400 error', async () => {
    const testUserId1 = await getUidByEmail('angiebrook1@hotmail.co.uk');

    try {
        await removeSubscription('', testUserId1); 
    } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('Invalid collectionId. It must be a non-empty string.');
    }
});

test('DELETE 400: Removing subscription with invalid UID returns 400 error', async () => {
    const testUserId2 = await getUidByEmail('wgyves@hotmail.com');
    const title = 'Test Collection';
    const description = 'Description of test collection';
    const isPublic = true;

    // Test user 2 creates a public collection
    const collectionRef = await insertNewArtCollection(testUserId2, title, description, isPublic);
    const collectionId = collectionRef.collectionId;

    try {
        await removeSubscription(collectionId, ''); 
    } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('uid is missing or invalid');
    }
});

test('DELETE 404: Removing subscription for non-existent collection returns 404 error', async () => {
    const testUserId1 = await getUidByEmail('angiebrook1@hotmail.co.uk');
    const nonExistentCollectionId = 'non-existent-collection-id';

    try {
        await removeSubscription(nonExistentCollectionId, testUserId1);
    } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Art collection not found');
    }
});

test('DELETE 404: Removing subscription for non-existent user returns 404 error', async () => {
    const testUserId2 = await getUidByEmail('wgyves@hotmail.com');
    const title = 'Test Collection';
    const description = 'Description of test collection';
    const isPublic = true;

    // Test user 2 creates a public collection
    const collectionRef = await insertNewArtCollection(testUserId2, title, description, isPublic);
    const collectionId = collectionRef.collectionId;

    try {
        await removeSubscription(collectionId, 'non-existent-user-id');
    } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('User not found');
    }
});

test('DELETE 404: Removing subscription that does not exist in user subscriptions returns 404 error', async () => {
    const testUserId1 = await getUidByEmail('angiebrook1@hotmail.co.uk');
    const testUserId2 = await getUidByEmail('wgyves@hotmail.com');
    const title = 'Test Collection';
    const description = 'Description of test collection';
    const isPublic = true;

    // Test user 2 creates a public collection
    const collectionRef = await insertNewArtCollection(testUserId2, title, description, isPublic);
    const collectionId = collectionRef.collectionId;

    try {
        await removeSubscription(collectionId, testUserId1); 
    } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Collection does not exist in subscriptions');
    }
});

 describe('/api/subscriptions',()=>{
  test('GET 200: user can retrive all collections they are subscribed to',async()=>{
    const testUserId1 = await getUidByEmail('angiebrook1@hotmail.co.uk');
    const result = await fetchSubscriptions(testUserId1)
    expect(typeof result.collections[0].id === 'string').toBe(true)
    expect(Array.isArray(result.collections[0].subscribers)).toBe(true)
    expect(typeof result.collections[0].userId === 'string').toBe(true)
    expect(typeof result.collections[0].title === 'string').toBe(true)
    expect(typeof result.collections[0].description === 'string').toBe(true)
    expect(typeof result.collections[0].isPublic === 'boolean').toBe(true)
    expect(typeof result.collections[0].createdAt === 'string').toBe(true)
    expect(Array.isArray(result.collections[0].artworks)).toBe(true)
    expect(typeof result.collections[0].updatedAt === 'string').toBe(true)
  });
  test('GET 400: invalid user id returns a 400 status and an error message',async()=>{
    try {
      await fetchSubscriptions("")
    } catch (error) {
      expect(error.status).toBe(400)
      expect(error.message).toBe("Invalid uid. It must be a non-empty string.")
      
    }
  })

 })

})
describe('/api/art-collections/collections/:collectionId',()=>{
 
  test('DELETE 403: when user who does not own collection attempt to delete collection a 403 status is returned with an error message',async()=>{
    
    try {
      const testUserId1=await getUidByEmail('wgyves@hotmail.com')
      const result1 = await fetchAllPublicCollections()
      const collectionId = result1[0].id
      await removeCollectionById(collectionId,testUserId1)
     
    } catch (error) {
   
      expect(error.status).toBe(403) 
      expect(error.message).toBe("You do not have permission to delete this collection")
    }
   
  });
  test('DELETE 200: User can delete pubic collection by Id',async()=>{
    const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
    const result1 = await fetchUserCollections(testUserId1)
    const collectionId = result1[0].id
    const result  = await removeCollectionById(collectionId,testUserId1)
    expect(result.message).toBe("Art collection deleted successfully")

  });
 
  test('DELETE 404: invalid collection id returns a 404 status and an error message',async()=>{
    
    try {
      const testUserId1=await getUidByEmail('angiebrook1@hotmail.co.uk')
      await removeCollectionById('',testUserId1)
     
    } catch (error) {
      expect(error.status).toBe(400)
      expect(error.message).toBe('Invalid collectionId. It must be a non-empty string.')
    }
   
  });
  
})  

