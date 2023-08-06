// Firestore helper module to interact with the database
const dbClient = require('./firestoreHelper');

// AWS Lambda main handler to get questions for game
exports.lambdaHandler = async (event, context) => {
    const { gameId } = event;

    // Fetch the game document based on gameId from the Firestore database
    const gameDoc = await dbClient.collection('game').doc(gameId).get();
    const gameData = await gameDoc.data();

    // Prepare an array to hold promises for fetching questions associated with the game
    const questionPromiseArr = [];
    for (let questionId of gameData.questionIds) {
        questionPromiseArr.push(dbClient.collection('question').doc(questionId).get());
    }

    // Await for all promises to resolve and fetch the question data
    const questionData = await Promise.all(questionPromiseArr);

    // Extract and structure the question data
    const questions = [];
    questionData.forEach(question => {
        questions.push(question.data());
    })

    return {
        startTime: gameData.startTime,
        questions,
    };
};
