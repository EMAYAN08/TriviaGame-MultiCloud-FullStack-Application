import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const dbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body);
  const teamId = body.teamId;
  const tableName = "ChatRooms";

  try {
    const getTeamIdParams = {
      TableName: tableName,
      Key: {
        TeamId: teamId
      },
    };

    // getting the team item
    const teamItem = await dbDocumentClient.send(new GetCommand(getTeamIdParams));
    const team = teamItem.Item;

    const teamMembersList = team.members;

    console.log(teamMembersList);
    console.log(connectionId);
    
    // checking if team member exists
    const teamMemberExists = teamMembersList.findIndex((team) => team.name === body.name);
    console.log(teamMemberExists);

    // if team member exists
    if (teamMemberExists !== -1) {
      // deleting team member connectionIds
      teamMembersList.splice(teamMemberExists, 1);

      console.log(teamMembersList);

      const updateMemberStatusParams = {
        TableName: tableName,
        Key: {
          TeamId: team.TeamId
        },
        UpdateExpression: "SET members = :members",
        ExpressionAttributeValues: {
          ":members": teamMembersList,
        },
      };

      await dbDocumentClient.send(new UpdateCommand(updateMemberStatusParams));

      const response = {
        statusCode: 200,
        body: JSON.stringify("Successfully updated member status"),
      };
      return response;
    }
  } catch (err) {
    console.log("Error updating member status ", err);
    const response = {
      statusCode: 500,
      body: JSON.tringify("Error updating member status"),
    };
    return response;
  }
};
