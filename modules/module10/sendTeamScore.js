import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new ApiGatewayManagementApiClient({ endpoint: "https://9cxhl45ymf.execute-api.us-east-1.amazonaws.com/production", region: "us-east-1" });

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const dbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (event) => {
    console.log(event.body);

    try {
        const params = {
            TableName: "SendTeamScore",
        };
        
        // scaning the table for getting all active connectionIds
        const command = new ScanCommand(params);

        const response = await dbDocumentClient.send(command);
        
        console.log(response);

        const activeConnections = response.Items;
        
        console.log(activeConnections);

        // checking if active connections
        if (activeConnections.length !== 0) {
            // sending team score to all connections
            for (const connection of activeConnections) {
                console.log(connection);
                try {
                    const input = {
                        Data: event.body,
                        ConnectionId: connection.connectionId,
                    };
                    const command = new PostToConnectionCommand(input);
                    await client.send(command);
                } catch (err) {
                    console.log("Error sending score to connections ", err);
                }
            }
        }
    } catch (err) {
        const response = {
            statusCode: 200,
            body: JSON.stringify("Error sending score to connections"),
        };
        return response;
    }
    
    const response = {
        statusCode: 200,
        body: JSON.stringify('Score sent successfully!'),
    };
    return response;

};
