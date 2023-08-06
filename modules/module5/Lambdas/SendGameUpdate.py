import json
import boto3
from datetime import datetime, timedelta
from boto3.dynamodb.types import TypeDeserializer, TypeSerializer
from decimal import Decimal
import requests
import os

    
def from_dynamodb_to_json(item):
    d = TypeDeserializer()
    return {k: d.deserialize(value=v) for k, v in item.items()}


profile_name = "default"
regionName = "us-east-1"


def list_files_in_current_directory():
    current_directory = os.getcwd()
    files = os.listdir(current_directory)
    return files








def SendUpdates(gameId):
    teamScoreList = getTeamScores(gameId)
    userScoreList = getUserScores(gameId)
    responseList = createResponsePayload(gameId,teamScoreList, userScoreList)
    urlToSend = "https://wkoyznh1ag.execute-api.ca-central-1.amazonaws.com/dev"
    fireStoreApiUrl = "https://us-central1-serverlessproject-391516.cloudfunctions.net/AddToFireStore"
    
    try:
        response = requests.post(url = urlToSend, json= responseList)
        print(response)
        print("response dict is ", responseList)
        print(f"Sending updates of Game {gameId} to other modules")
        responseFireStore = requests.post(url= fireStoreApiUrl, json= responseList)
        print("response firestore", responseFireStore)
        return True
    except Exception as e:
        print("Error while sending scores to client API", e, type(e))
    return False


def convert_decimal_to_regular(data):
    if isinstance(data, Decimal):
        return float(data) if data % 1 > 0 else int(data)
    if isinstance(data, dict):
        return {k:convert_decimal_to_regular(v) for k, v in data.items()}
    if isinstance(data, list):
        return [convert_decimal_to_regular(item) for item in data]
    return data

def createResponsePayload(gameId, teamScoreList, userScoreList):
    responseDict = {"game_id": gameId, "team_score_list": teamScoreList, "user_score_list": userScoreList}
    return responseDict

def getTeamScores(gameId):
    dynamodb = boto3.client('dynamodb')
    # Define the table name and the partition key value to query
    table_name = 'TeamGameScore'
    partition_key_value = gameId

    # Perform the query
    response = dynamodb.query(
        TableName=table_name,
        KeyConditionExpression='live_trivia_game_id = :pkval',
        ExpressionAttributeValues={':pkval': {'S': partition_key_value}}
    )

    # Extract the items from the response
    items = response.get('Items', [])
    itemsJsonObjectList = []
    for item in items:
        itemsJsonObjectList.append(convert_decimal_to_regular( from_dynamodb_to_json(item)))
    teamScoreList = []
    for item in itemsJsonObjectList:
        teamDict = {}
        teamDict['team_id'] = item['team_id']
        teamDict['team_score'] = item['score']
        teamScoreList.append(teamDict)
    return teamScoreList

def getUserScores(gameId):  
    dynamodb = boto3.client('dynamodb')
    # Define the table name and the partition key value to query
    table_name = 'UserGameScore'
    partition_key_value = gameId

    # Perform the query
    response = dynamodb.query(
        TableName=table_name,
        KeyConditionExpression='trivia_game_id  = :pkval',
        ExpressionAttributeValues={':pkval': {'S': partition_key_value}}
    )

    # Extract the items from the response
    items = response.get('Items', [])
    itemsJsonObjectList = []
    for item in items:
        itemsJsonObjectList.append(convert_decimal_to_regular( from_dynamodb_to_json(item)))
    userScoreList = []
    for item in itemsJsonObjectList:
        userDict = {}
        userDict['user_id'] = item['user_id']
        userDict['user_score'] = item['score']
        userScoreList.append(userDict)
    return userScoreList

def lambda_handler(event, context):
    print("event is ", event)
    files_list = list_files_in_current_directory()
    print("Files in the current directory:")
    for file in files_list:
        print(file)
    
    try:
        event = json.loads(event)
        gameId = event['game_id']
        gameStartTime = event['game_start_time']
        status = SendUpdates(gameId)
        if(status):
            return {
                'statusCode': 200,
                'body': json.dumps('Game Scores send successfully')
                }
        else:
            return {
                'statusCode': 200,
                'body': json.dumps('Game score sending failed , check logs')
                }
            
    except Exception as e:
        print(e)
        return {
            'statusCode': 400,
            'body': json.dumps('Error Sending Game Updates')
            } 
