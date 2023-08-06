import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const dbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    //deliting connectionIds from table
    const params = {
        TableName: "TeamScore",
        Item: {
            connectionId: connectionId,
        },
    };

    try {
        const deleteCommand = new DeleteCommand(params);
        await dbDocumentClient.send(deleteCommand);
        const response = {
            statusCode: 200,
            body: JSON.stringify("Successfully disconnected!"),
        };
        return response;
    } catch (err) {
        console.log("Error putting connectionId in db ", err);
        const response = {
            statusCode: 500,
            body: JSON.stringify("Error deleting item in db"),
        };
        return response;
    }

};
