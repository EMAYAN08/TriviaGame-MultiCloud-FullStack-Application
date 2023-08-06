// Firestore helper module to interact with the database
const dbClient = require('./firestoreHelper');

// AWS Lambda function handler to delete the question
exports.lambdaHandler = async (event, context) => {
    const { questionId, updateData } = event;

    // Update the specific question document in Firestore with the provided update data
    await dbClient.collection('question').doc(questionId).update(updateData);

    return {
        message: "success"
    };
};
