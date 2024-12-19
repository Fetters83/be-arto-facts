const request = require('supertest')
const app = require('../app')

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
})

describe('/api/collections/MetArtMuseum',()=>{
  test('GET 400: call to Met Art Museum with an incorrect offset datatype returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=x&departmentId=6&searchTerm=""`)
    .expect(400)
      expect(body.message).toBe('Artwork result starting position must be a number data type')
 
  
  })
})

describe('/api/collections/MetArtMuseum',()=>{
  test('GET 400: call to Met Art Museum with an incorrect deparmentId datatype returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=x&searchTerm=""`)
    .expect(400)
      expect(body.message).toBe('Department ID must be a number data type')
 
  
  })
})

describe('/api/collections/MetArtMuseum',()=>{
  test('GET 400: call to Met Art Museum with an incorrect type datatype returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=6&type=9999&searchTerm=""`)
    .expect(400)
      expect(body.message).toBe('Artwork type query must be a string data type')
 
  
  })
})

describe('/api/collections/MetArtMuseum',()=>{
  test('GET 400: call to Met Art Museum with an unrecognised type returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=6&type=NOTATYPE&searchTerm=""`)
    .expect(400)
       expect(body.message).toBe('Error fetching availble artwork ids')
 
  
  })
})

describe('/api/collections/MetArtMuseum',()=>{
  test('GET 400: call to Met Art Museum with a limit of less than 10 returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=9&offset=0&departmentId=6&searchTerm=""`)
    .expect(400)
       expect(body.message).toBe('Results per page can not be lower than 10')
 
  
  })
})


describe('/api/collections/MetArtMuseum',()=>{
  test('GET 400: call to Met Art Museum with a limit of more than 50 returns a 400 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=51&offset=0&departmentId=6&searchTerm=""`)
    .expect(400)
       expect(body.message).toBe('Results per page can not exceed 50')
 
  
  })
})

describe('/api/collections/MetArtMuseum',()=>{
  test('GET 404: call to Met Art Museum with an offset or page start of more than the available objects returns a 404 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=999999999999999999&departmentId=6&searchTerm=""`)
    .expect(404)
       expect(body.message).toBe('Offset or Page start exceeds the number of available artworks')
 
  
  })
})

describe('/api/collections/MetArtMuseum',()=>{
  test('GET 404: call to Met Art Museum with an offset or page start of more than the available objects returns a 404 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=999999&searchTerm=""`)
    .expect(404)
       expect(body.message).toBe('DepartmentId does not exist')
 
  
  })
})


describe('/api/collections/MetArtMuseum',()=>{
  test('GET 404: call to Met Art Museum with an offset or page start of more than the available objects returns a 404 error and an error message', async()=>{
    const {body} = await request(app)
    .get(`/api/collections/MetArtMuseum?limit=10&offset=0&departmentId=6&searchTerm="NOTASEARCHTEARM"`)
    .expect(400)

    expect(body.message).toBe('Error fetching availble artwork ids')

 
  
  })
})



