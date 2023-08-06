// Firestore helper module to interact with the database
const dbClient = require('./firestoreHelper');
const AWS = require('aws-sdk');

// Function to convert DynamoDB's native format to a JavaScript object
const deserializeDynamoDBItem = (item) => {
    return AWS.DynamoDB.Converter.unmarshall(item);
}

// Function to extract, format, and structure the game data from the raw DynamoDB format
const analyzeGameData = (data) => {
    // Extracting and structuring user data
    const users = (data.User_points_earned || []).map((user, index) => {
        return {
            userID: user.userID,
            userScore: user.userScore,
            // Find the rank for this user; if not found, default to an empty object
            userRank: (data.User_ranks.find(rankObj => rankObj.userID === user.userID) || {}).rank
        };
    });

    // Extracting and structuring team data
    const teams = (data.Team_points_earned || []).map((team, index) => {
        return {
            teamID: team.teamID,
            teamScore: team.teamScore,
            // Find the rank for this team; if not found, default to an empty object
            teamRank: (data.Rank.find(rankObj => rankObj.teamID === team.teamID) || {}).rank
        };
    });

    // Return the structured game data
    return {
        gameCategory: data.Game_category,
        gameName: data.Game_name,
        gameID: data.Game_id,
        gamePoints: data.Game_points,
        users: users,
        teams: teams
    };
}

// AWS Lambda main handler to add game data
exports.lambdaHandler = async (event, context) => {
    // Convert the event data from DynamoDB format to a regular JavaScript object
    const gameData = deserializeDynamoDBItem(event);

    // Get the structured and formatted game data
    const analyzedData = analyzeGameData(gameData);

    try {
        // Store the structured game data in Firestore
        await dbClient.collection('gameData').doc(analyzedData.gameID).set(analyzedData);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success" })
        };
    } catch(error) {
        console.error("Error storing data in Firestore:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" })
        };
    }
};
