const admin = require('firebase-admin');
const credentials = require('./serviceAccountKey.json');
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require("firebase/firestore");
require('firebase/auth');

const ENV = process.env.NODE_ENV || 'development';


require('dotenv').config({
  path: `${__dirname}/.env.${ENV}`,
});

    const firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(credentials),
        databaseURL: "https://arto-facts.firebaseio.com",
        
       
    })

    const firebaseApp = initializeApp({
        apiKey:process.env.FIREBASE_API_KEY,
        authDomain: process.env.AUTHDOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID
    })

    const config={user_collection_id:process.env.USER_COLLECTION_ID,
        art_collections_collection_id:process.env.ART_COLLECTIONS_COLLECTION_ID,
        subscriptions_collection_id:process.env.SUBSCRIPTIONS_COLLECTION_ID,
        rijks_api_key:process.env.RIJKS_API_KEY}; 
    
        const adminDb = firebaseAdmin.firestore()

 
    module.exports = {
        firebaseAdmin,
        config,
        adminDb,
        firebaseApp,
        
    };

