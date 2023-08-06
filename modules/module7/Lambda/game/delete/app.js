// Firestore helper module to interact with the database
const dbClient = require('./firestoreHelper');

// AWS Lambda handler function to delete game
exports.lambdaHandler = async (event, context) => {
    const { gameId } = event;

    // Deleting the specified game document from the 'game' collection in Firestore
    await dbClient.collection('game').doc(gameId).delete();

    return {
        message: "success"
    };
};
