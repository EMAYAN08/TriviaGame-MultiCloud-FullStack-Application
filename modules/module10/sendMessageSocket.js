import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new ApiGatewayManagementApiClient({ endpoint: "https://olm4n20mc8.execute-api.us-east-1.amazonaws.com/production", region: "us-east-1" });

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const dbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (event) => {
  const tableName = "ChatRooms";
  const body = JSON.parse(event.body);
  const message = body.message;
  const teamId = body.teamId;
  const memberName = body.name;
  
  const connectionId = event.requestContext.connectionId;
  
  const item = {
    TeamId: teamId,
    members: [
      {
        name: memberName,
        memberConnectionId: connectionId,
        isActive: "true"
      },
    ]
  };
  
  // check if temId is there in dynamodb
  const getTeamIdParams = {
    TableName: tableName,
    Key: {
      TeamId: teamId
    },
  };
  
  // getting team members
  const teamItem = await dbDocumentClient.send(new GetCommand(getTeamIdParams));
  const team = teamItem.Item;
  
  // if team id is same
  if(team.TeamId === teamId) {
    const teamMembersList = team.members;
    
    const teamMemberExists = teamMembersList.findIndex((team) => team.name === memberName);
    
    if(teamMemberExists === -1) {
      teamMembersList.push({
        name: memberName,
        memberConnectionId: connectionId
      });
    } else {
      teamMembersList[teamMemberExists].memberConnectionId = connectionId;
      teamMembersList[teamMemberExists].isActive = "true";
    }
    
    
    console.log(teamMembersList);
    
    try {
        // updating member connectionId
        const addMemberParams = {
          TableName: tableName,
          Key: {
            TeamId: team.TeamId
          },
          UpdateExpression: "SET members = :members",
          ExpressionAttributeValues: {
            ":members": teamMembersList,
          },
        };
      
      await dbDocumentClient.send(new UpdateCommand(addMemberParams));
    } catch (err) {
      console.log("Error updating member", err);
    }
  } else {
    console.log("inside else");
      try {
      const putCommand = new PutCommand({
        TableName: tableName,
        Item: item
      });
      await dbDocumentClient.send(putCommand);
    } catch (err) {
      console.log("Error inserting chatroom", err);
    }
  }
  
  try {
    // getting connectionIds of all members
    const teamMembersId = await dbDocumentClient.send(new GetCommand(getTeamIdParams));
    const teamMembersIdItem = teamMembersId.Item;
    console.log("nn", teamMembersIdItem);
    
    console.log("newwww", teamMembersIdItem.members);
  
    for(const teammember of teamMembersIdItem.members) {
      // sending message to all team members
      const input = {
        Data: event.body,
        ConnectionId: teammember.memberConnectionId,
      };
      console.log(input);
      const command = new PostToConnectionCommand(input);
      await client.send(command);
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify("Successfully sent messages to team members"),
    };
    return response;
  } catch (err) {
    console.log("Error sending message ", err);
  }
  
};
