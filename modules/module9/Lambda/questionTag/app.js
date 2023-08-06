// Google Cloud Language client
const language = require('@google-cloud/language');

// Initializing the language service client with project details and credentials
const client = new language.LanguageServiceClient({
    projectId: 'module-7-sdp-14',
    keyFilename: 'module-7-sdp-14-8e73d061475e.json',
});

// Function to get tags for a given question using Google Cloud Platform
const getTagsFromGCP = async (question) => {
    // Defining the document structure required by GCP
    const document = {
        content: question,
        type: 'PLAIN_TEXT'
    };

    try {
        // Request to GCP's analyzeEntities API
        const response = await client.analyzeEntities({document: document});
        const [result] = response;
        const entities = result.entities;

        // Extracting unique entity types from the response
        const types = new Set();
        entities.forEach(entity => {
            types.add(entity.type);
        });

        // Converting Set to Array
        const tags = Array.from(types);
        return tags;

    } catch (error) {
        console.error("Error analyzing entities from GCP: ", error);
        throw error;
    }
};

// AWS Lambda handler to retrieve question tags
exports.lambdaHandler = async (event) => {
    const { questionText } = event;
    const questionTags = await getTagsFromGCP(questionText);

    return {
        questionTags
    };
};
