const request = require('supertest')
const app = require('../app')
const { retrieveLogin } = require("../models/login.models");

jest.setTimeout(10000);

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

describe.skip('/api/signup',()=>{
  test('POST 201: signing up with email and password generates a custom token and authenticates user',async()=>{
    const {body} = await request(app)
    .post('/api/signup')
    .send({email:'wgyves@hotmail.com',password:'Goater83'})
    .expect(201)
    expect(body.message).toBe('User successfully created')

  })
})

describe.only('/api/login',()=>{
  test('POST 2O1:login with valid email and password successfully creates token',async()=>{
    const email = "wgyves@hotmail.com";
    const password = "Goater83";

    const result = await retrieveLogin(email, password);
    expect(result).toHaveProperty("token");
  })
})





