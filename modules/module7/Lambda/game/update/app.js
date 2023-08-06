// Firestore helper module to interact with the database
const dbClient = require('./firestoreHelper');

// AWS Lambda main handler to update game
exports.lambdaHandler = async (event, context) => {
    const { gameId, updateData } = event;

    // Fetching the current game document based on the provided gameId from Firestore
    const gameDoc = await dbClient.collection('game').doc(gameId).get();
    const gameData = gameDoc.data();

    // Merging the current participants with the new participants and ensuring there are no duplicates
    const uniqueParticipants = Array.from(new Set([...gameData.participants, ...updateData.participants]));

    // Updating the game document with the merged participants list
    await dbClient.collection('game').doc(gameId).update({ participants: uniqueParticipants });

    return {
        message: "success"
    };
};
