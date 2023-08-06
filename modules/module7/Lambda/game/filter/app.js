// Firestore helper module to interact with the database
const dbClient = require('./firestoreHelper');

// AWS Lambda handler function to filter games
exports.lambdaHandler = async (event, context) => {
    const gamesData = [];
    const { categoryId, difficultyLevel, duration } = event;

    // Starting with the base 'game' collection
    let gameCollection = await dbClient.collection('game');

    // Applying filters based on the provided criteria
    if (categoryId) gameCollection = gameCollection.where('categoryId', '==', categoryId);
    if (difficultyLevel) gameCollection = gameCollection.where('difficultyLevel', '==', difficultyLevel);
    if (duration) gameCollection = gameCollection.where('duration', '==', duration);

    // Fetching the filtered game documents
    const gameDocs = await gameCollection.get();

    // Iterating through each game document to extract and format the required data
    for (let doc of gameDocs.docs) {
        const docData = doc.data();

        // Fetching the category name for the game using the categoryId
        const categoryDoc = await dbClient.collection('category').doc(docData.categoryId).get();
        const categoryName = await categoryDoc.data().name;

        // Storing the game ID and its associated category name
        docData.id = doc.id;
        docData.category = categoryName;

        // Removing fields that are not required in the response
        delete docData.questionIds;
        delete docData.categoryId;

        gamesData.push(docData);
    }
    return gamesData;
};
