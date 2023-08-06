import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const dbClient = new DynamoDBClient({ region: "us-east-1" });
const dbDocClient = DynamoDBDocumentClient.from(dbClient);

export const handler = async (event, context) => {
    const body = JSON.parse(event.body);
    console.log(body);
    // Extract the DynamoDB item from the event
    const dynamodb_item = body;

    const team_details = [];

    // Extract Team points earned and Rank data from the DynamoDB object
    console.log(dynamodb_item.Team_points_earned);

    const team_points_earned = dynamodb_item.Team_points_earned.L;
    const rank_data = dynamodb_item.Rank.L;

    // Create a set to store teamIDs with ranks 1, 2, or 3
    const top_3_teams = new Set(
        rank_data.filter((rank_info) => [1, 2, 3].includes(parseInt(rank_info.M.rank.N, 10)))
            .map((rank_info) => rank_info.M.teamID.S));

    for (const team of team_points_earned) {
        const team_id = team.M.teamID.S;
        const team_score = parseInt(team.M.teamScore.N, 10);

        // Check if the team is in the top 3 based on the rank
        const is_top_3 = top_3_teams.has(team_id);

        // Create the team details object for each team
        const team_detail = {
            teamID: team_id,
            top_3: is_top_3,
            teamScore: team_score,
        };

        team_details.push(team_detail);

        console.log("ttt", team_detail);
    }

    const table = 'TriviaTeams';
    const game_score = parseInt(dynamodb_item.Game_points.N, 10);

    try {
        for (const item of team_details) {
            const team_id = item.teamID;
            const team_score = item.teamScore;
            const top_3 = item.top_3;

            // Use query to get the team with the provided team_id

            const getParams = {
                TableName: table,
                Key: { teamID: team_id },
            };
            const scanCommand = new GetCommand(getParams);

            const response = await dbDocClient.send(scanCommand);

            // Check if a team with the provided team_id is found
            const items = response.Item;

            console.log("rrr", response.Item);

            if (!items) {
                const putCommand = new PutCommand({
                    TableName: "TriviaTeams",
                    Item: item,
                });
                await dbDocClient.send(putCommand);
            } else {
                console.log()
                const user = items;

                // Update the team_stats for the team
                // const current_stats = user.team_stats || {
                //     top_3: 0,
                //     total_games_played: 0,
                //     total_game_points: 0,
                //     total_team_points: 0,
                // };
                
                const current_stats = user;

                if (top_3) {
                    current_stats.top_3 += 1;
                }

                // current_stats.total_games_played += 1;
                // current_stats.total_game_points += game_score;
                current_stats.teamScore += team_score;

                const record = {
                    teamID: team_id,
                    teamScore: current_stats.teamScore,
                    top_3: current_stats.top_3
                };

                const putCommand = new PutCommand({
                    TableName: table,
                    Item: record,
                });
                await dbDocClient.send(putCommand);
            }
        }

        return {
            statusCode: 200,
            body: 'Records updated successfully',
        };
    } catch (error) {
        // Handle any errors that occurred during the updates
        console.log("Error adding team score ", error);
        return {
            statusCode: 500,
            body: error.toString(),
        };
    }

    // return {
    //   statusCode: 200,
    //   body: JSON.stringify("hello")
    // }
};