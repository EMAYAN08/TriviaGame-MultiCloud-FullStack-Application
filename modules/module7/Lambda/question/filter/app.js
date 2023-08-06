// Firestore helper module to interact with the database
const dbClient = require('./firestoreHelper');

// AWS Lambda function handler to filter questions
exports.lambdaHandler = async (event, context) => {
    const { categoryId, difficultyLevel } = event;

    // Initialize the question collection from Firestore
    let questionCollection = await dbClient.collection('question');

    // Applying filters based on the provided criteria
    if (categoryId) questionCollection = questionCollection.where('categoryId', '==', categoryId);
    if (difficultyLevel) questionCollection = questionCollection.where('difficultyLevel', '==', difficultyLevel);

    // Fetch all the questions based on the applied filters
    const questionDocs = await questionCollection.get();

    const questions = [];

    // Iterating over each document and extracting the required data
    questionDocs.forEach(doc => {
        const questionData = doc.data();
        questionData.id = doc.id;
        questions.push(questionData);
    });

    return questions;
};
