// Firestore helper module to interface with the database
const dbClient = require('./firestoreHelper');
const axios = require('axios');

// AWS Lambda handler function to add games
exports.lambdaHandler = async (event, context) => {
    const { name, categoryId, difficultyLevel, questionIds, startTime, description, participants } = event;

    // Fetching the current date and time in ISO format
    const currentDateTime = new Date().toISOString();

    // Defining the duration for each difficulty level per question
    const Duration = {
        'EASY': 20,
        'MEDIUM': 25,
        'HARD': 30
    }

    // Calculating the total duration for the game based on the difficulty level and number of questions
    const duration = Duration[difficultyLevel] * questionIds.length;

    // Adding a new game document to the 'game' collection in Firestore
    const gameDoc = await dbClient.collection('game').add({
        name,
        categoryId,
        difficultyLevel,
        questionIds,
        startTime,
        description,
        participants,
        createdAt: currentDateTime,
        duration,
    });

    // Making a post request to add the event associated with the game
    const response = await axios.post('https://3fs6fb1nvl.execute-api.us-east-1.amazonaws.com/prod/addEvent', {
        live_game_id: gameDoc.id,
        live_game_start_time: startTime
    });

    return gameDoc.id;
};
