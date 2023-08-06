import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

/**
 * send response to lex
 * @param {*} sessionState 
 * @param {*} fulfillmentState 
 * @param {*} message 
 * @param {*} requestAttributes 
 * @returns 
 */
function close(sessionState, fulfillmentState, message, requestAttributes) {
    sessionState.intent.state = fulfillmentState
    sessionState.dialogAction = {
        slotElicitationStyle: "Default",
        slotToElicit: "string",
        type: 'Close'
    };
    return {
        sessionState: sessionState,
        messages: [
            message
        ],
        requestAttributes: requestAttributes
    };
}

export const handler = async (event, context) => {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const slotName = Object.keys(event.sessionState.intent.slots);

    console.log(slotName);

    // checking if slot name is navigation
    if (slotName[0] === "Navigation") {
        // deployed application url
        const deployedUrl = "https://sdp-14-6tdcine2na-uc.a.run.app";
        
        // navigation links for pages
        const navigationLinks = [
            { "register": "/" },
            { "login": "/login-step1" },
            { "forgot password": "/forgot-password" },
            { "my teams": "/my-teams" },
            { "lobby": "/trivialobby" },
            { "leaderboard": "/leaderboard" },
            { "profile": "/user" },
            { "ingame": "/ingame" }
        ];

        // getting the slot value
        let navigationName = event.sessionState.intent.slots.Navigation.value.interpretedValue.toLowerCase();
        
        console.log(navigationName);

        // finding the navigation link for slot value
        const navigationLinkIndex = navigationLinks.findIndex((nav) => Object.keys(nav)[0] === navigationName);

        try {
            if (navigationLinkIndex === -1) {
                return close(event.sessionState, 'Fulfilled', { 'contentType': 'PlainText', 'content': 'Sorry. I cant find the page you are looking for.' }, event.requestAttributes);
            }
            const requestedNavLink = Object.values(navigationLinks[navigationLinkIndex])[0];
            return close(event.sessionState, 'Fulfilled', { 'contentType': 'PlainText', 'content': `Here is the link for ${navigationName}| ${deployedUrl}${requestedNavLink}` }, event.requestAttributes);
        } catch (err) {
            console.log("Error reading team name", err);
            return close(event.sessionState, 'Fulfilled', { 'contentType': 'PlainText', 'content': 'Sorry. I cant find navigation for that.' }, event.requestAttributes);
        }
    } else {
        // getting the team name from slot
        let teamName = event.sessionState.intent.slots.TeamName.value.interpretedValue;
        console.log(teamName);

        const command = new GetCommand({
            TableName: "TriviaTeams",
            Key: {
                teamID: teamName
            }
        });
        try {
            const dbResponse = await docClient.send(command);
            console.log(dbResponse);
            return close(event.sessionState, 'Fulfilled', { 'contentType': 'PlainText', 'content': `The score of ${teamName} is ${dbResponse.Item.teamScore}` }, event.requestAttributes);
        } catch (err) {
            console.log("Error reading team name", err);
            return close(event.sessionState, 'Fulfilled', { 'contentType': 'PlainText', 'content': 'Sorry. Something went wrong. May be you have entered wrong team name' }, event.requestAttributes);
        }
    }

};
