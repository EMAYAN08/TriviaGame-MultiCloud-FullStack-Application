// Firestore helper module to interface with the database
const dbClient = require('./firestoreHelper');

// AWS Lambda handler function for Get all categories
exports.lambdaHandler = async (event, context) => {
    const categoryData = [];

    // Fetch all documents from the 'category' collection in Firestore
    const documents = await dbClient.collection('category').get();

    // Iterate over each document and Extract data from the document
    documents.forEach(doc => {
        const docData = doc.data();
        categoryData.push({
            id: doc.id,
            name: docData.name,
        });
    });

    return categoryData;
};
