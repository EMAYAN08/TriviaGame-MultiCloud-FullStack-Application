import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const dbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    // storing connectionIds in table
    const params = {
        TableName: "TeamScore",
        Item: {
            connectionId: connectionId,
        },
    };

    try {
        const putCommand = new PutCommand(params);
        await dbDocumentClient.send(putCommand);
        const response = {
            statusCode: 200,
            body: JSON.stringify("Successfully connected!"),
        };
        return response;
    } catch (err) {
        console.log("Error putting connectionId in db ", err);
        const response = {
            statusCode: 500,
            body: JSON.stringify("Error putting item in db"),
        };
        return response;
    }

};
