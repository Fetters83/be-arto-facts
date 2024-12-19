const admin = require('firebase-admin');
const credentials = require('./serviceAccountKey.json');


const ENV = process.env.NODE_ENV || 'development';


require('dotenv').config({
  path: `${__dirname}/.env.${ENV}`,
});

    const firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(credentials),
        databaseURL: "https://arto-facts.firebaseio.com",
        
       
    })

    const config={user_collection_id:process.env.USER_COLLECTION_ID,
        art_collections_collection_id:process.env.ART_COLLECTIONS_COLLECTION_ID,
        subscriptions_collection_id:process.env.SUBSCRIPTIONS_COLLECTION_ID,
        rijks_api_key:process.env.RIJKS_API_KEY}; 
    const db = admin.firestore();

 
    module.exports = {
        firebaseAdmin,
        db,
        config
    };

