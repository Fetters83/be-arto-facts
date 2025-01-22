# be-arto-facts


A web application for art enthusiasts to discover, curate, and share art collections. This project is built using **Node.js**, **Express**, **Firestore**. Users can explore art pieces from APIs, create collections, and subscribe to others' collections.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)



---

## Features

1. **User Authentication**:
   - Sign up and log in using Firebase Authentication.
   - Custom tokens for secure user sessions.

2. **Explore Art**:
   - Fetch art pieces from external APIs (e.g., Rijksmuseum, Met Art Museum).
   - Filter and search by department, classification, and more.

3. **Curate Collections**:
   - Create personal art collections.
   - Add or remove artworks from collections.
   - Set collections as public or private.

4. **Subscriptions**:
   - Subscribe to public collections created by other users.
   - View and manage your subscriptions.



---

## Technologies Used

- **Backend**:
  - Node.js
  - Express.js
  - Firestore (Firebase)

- **Authentication**:
  - Firebase Authentication

- **Testing**:
  - Jest
  - Supertest

---

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Firebase project with Firestore and Authentication enabled
- Environment variables (see Environment Variables)

### Steps

1. **Clone the Repository**:
  
   git clone <repository-url>
   cd be-arto-facts-main

2. npm install

3. Set Up Firebase, Firestore, and Authentication

### Setting Up Firebase, Firestore, and Authentication
1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Click on **Add Project** and follow the setup wizard.
   - Enable **Firestore** and **Authentication** in your project settings.

2. **Enable Firestore**:
   - In the Firebase Console, go to **Firestore Database**.
   - Click **Create Database**.
   - Select the appropriate security rules:
     - For development, use **Test Mode**.
     - For production, configure secure rules.
   - Firestore will initialize with an empty database.

3. **Enable Authentication**:
   - In the Firebase Console, go to **Authentication**.
   - Click **Get Started**.
   - Enable the **Email/Password** provider.

4. **Generate Service Account Key**:
   - In the Firebase Console, go to **Project Settings** > **Service Accounts**.
   - Click **Generate New Private Key**.
   - Save the JSON file and place it in the root of your project (e.g., `serviceAccountKey.json`).

5. **Add Firebase Config to Your App**:
   - In the Firebase Console, go to **Project Settings** > **General**.
   - Under "Your apps," select **Web App** and register your app.
   - Copy the Firebase config and paste it into your `.env` file.

6. **Add Firestore Collections**:
   - Add the following collections in Firestore:
     - `users`: Stores user information, including public collections and subscriptions.
     - `art_collections`: Stores data about user-created art collections.
     - `subscriptions`: Tracks user subscriptions to collections.

4. Set Up Environment Variables: Create .env.development, .env.test, and .env.production files in the root directory.

Environment Variables

- FIREBASE_API_KEY: Your Firebase API Key
- AUTHDOMAIN: Firebase Auth Domain
- PROJECT_ID: Firebase Project ID
- STORAGE_BUCKET: Firebase Storage Bucket
- MESSAGING_SENDER_ID: Firebase Messaging Sender ID
- APP_ID: Firebase App ID
- USER_COLLECTION_ID: Firestore collection name for users
- ART_COLLECTIONS_COLLECTION_ID: Firestore collection name for art  collections
- SUBSCRIPTIONS_COLLECTION_ID: Firestore collection name for subscriptions
- RIJKS_API_KEY: API Key for Rijksmuseum API (signup for an API key at https://data.rijksmuseum.nl/docs/api/)

## API Endpoints
** Authentication
* POST /api/signup: Sign up a new user.
* POST /api/login: Log in an existing user.
** Art Collections
* POST /api/art-collections: Create a new collection.
* GET /api/art-collections/public: Fetch all public collections.
* GET /api/art-collections/:userId: Fetch all collections for a specific user.
* GET /api/art-collections/collections/:collectionId: Fetch a specific * collection by ID.
* DELETE /api/art-collections/collections/:collectionId: Delete a collection by ID.
**Artworks
*Metropolitan Museum of Art
* GET /api/collections/MetArtMuseum: Fetch artworks with filters
* GET /api/collections/MetArtMuseum/departments: Fetch list of departments
* GET /api/collections/MetArtMuseum/:id: Fetch details of a single artwork by ID
*Art Institute of Chicago
* GET /api/collections/ArtInstitueChicago: Fetch artworks with filters
* GET /api/collections/ArtInstitueChicago/:id: Fetch details of a single artwork by ID
Subscriptions
* POST /api/subscriptions: Subscribe to a public collection.
* DELETE /api/subscriptions: Unsubscribe from a collection.
* GET /api/subscriptions: Fetch all subscribed collections.
Manage Collections
* GET /api/manage-collections: Fetch all collections for management
* POST /api/manage-collections: Update or add a new collection
* DELETE /api/manage-collections: Delete a specific collection
# Usage
Metropolitan Museum of Art
 - Filter Parameters: limit, offset, departmentId, type, searchTerm.
 - Example: GET /api/collections/MetArtMuseum?limit=10&offset=0&departmentId=11&type=Painting&searchTerm=Nature
 Art Institute of Chicago
 - Filter Parameters: page, limit, placeOfOrigin, artistName, artTypeTitle, q (search query).
 - Example: GET /api/collections/ArtInstitueChicago?page=1&limit=10&placeOfOrigin=China&artistName=Hokusai&q=Water



## TESTING

This project includes comprehensive test coverage using Jest and Supertest

* Running Tests - run the command - npm test
