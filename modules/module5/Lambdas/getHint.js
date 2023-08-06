import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

 

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

 

export const handler = async (event) => {
  
  console.log("event is ", event)
  const body = event

  const params = {
    TableName: "TriviaGameTable",
    Key: {
      trivia_game_id: body.trivia_game_id
    },
    ProjectionExpression: "questions",
  };

  try {
    const data = await docClient.send(new GetCommand(params));

    const question = data.Item.questions.find(
      (q) => q.question_number === body.question_number
    );

    const response = {
      statusCode: 200,
      body: question.question_hint
    };
    return response;
  } catch (error) {
    console.error("Error retrieving data from DynamoDB:", error);
    const response = {
      statusCode: 500,
      body: JSON.stringify("Error getting hint"),
    };
    return response;
  }

};