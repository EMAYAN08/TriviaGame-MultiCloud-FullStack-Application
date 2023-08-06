// Firestore helper module to interact with the database
const dbClient = require('./firestoreHelper');

// AWS Lambda function handler to delete questions
exports.lambdaHandler = async (event, context) => {
    const { questionId } = event;

    // Delete the question document from Firestore using the provided ID
    await dbClient.collection('question').doc(questionId).delete();

    return {
        message: "success"
    };
};
