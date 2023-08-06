// Firestore helper module to interact with the database
const axios = require('axios');
const dbClient = require('./firestoreHelper');

// AWS Lambda function handler to add questions
exports.lambdaHandler = async (event, context) => {
    const { questionText, categoryId, difficultyLevel, answers, options } = event;

    // Making an API call to get tags related to the question text
    const response = await axios.post('https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/question/tags', {
        questionText
    });
    // Extracting tags from the API response
    const tags = response.data.questionTags;

    // Storing the question and its related information in Firestore
    const questionDoc = await dbClient.collection('question').add({
        questionText,
        categoryId,
        difficultyLevel,
        answers,
        options,
        tags,
    });

    return questionDoc.id;
};
