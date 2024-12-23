const admin = require('firebase-admin');

/**
 * Retrieve UID from Firebase Authentication using email
 * @param {string} email - The email address of the user
 * @returns {Promise<string>} - The UID of the user
 */
const getUidByEmail = async (email) => {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        return userRecord.uid;
    } catch (error) {
        console.error(`Error fetching UID for email ${email}:`, error.message);
        throw error;
    }
};

module.exports = { getUidByEmail };