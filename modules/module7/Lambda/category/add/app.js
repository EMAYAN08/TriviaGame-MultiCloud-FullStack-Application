// Firestore helper module to interface with the database
const dbClient = require('./firestoreHelper');

// AWS Lambda handler function
exports.lambdaHandler = async (event, context) => {
    const { name } = event;

    // Adding a new document with the provided name to the 'category' collection in Firestore
    const categoryDoc = await dbClient.collection('category').add({ name });

    return {
        categoryId: categoryDoc.id
    }
};
