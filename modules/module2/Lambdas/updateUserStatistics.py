import json
import boto3
from boto3.dynamodb.types import TypeDeserializer, TypeSerializer
from decimal import Decimal

def updateDB(gameId, gameName, gameCategory,gamePoints, userPointsList):
    table_name = 'UserStats'
    dynamodb = boto3.client('dynamodb')
    users = []
    for user in userPointsList:
        userDict = {'game_id': gameId, "game_points":gamePoints, "user_id":user['userID'], "game_name": gameName, "game_category": gameCategory, "user_score":user['userScore']}
        users.append(userDict)
        
    put_requests = []
    for user in users:
        item = {
            'user_id': {'S': user['user_id']},
            'game_id': {'S': user['game_id']},
            'game_name': {'S': user['game_name']},
             'game_category': {'S': user['game_category']},
              'game_points': {'N': str(user['game_points'])},
            'user_score': {'N': str(user['user_score'])}
        }
        put_requests.append({'PutRequest': {'Item': item}})
    
    batch_write_params = {
        'RequestItems': {
            table_name: put_requests
        }
    }
    
    try:
        response = dynamodb.batch_write_item(**batch_write_params)
        print('Batch insert completed successfully.')
        return True
    except Exception as e:
        # Handle exceptions
        print('An error occurred check logs :', e)
        return False

def lambda_handler(event, context):
   
    eventJson = convert_decimal_to_regular(from_dynamodb_to_json(event))
    userPointsList = eventJson['User_points_earned']
    gameName = eventJson['Game_name']
    gameCategory = eventJson['Game_category']
    gameId = eventJson['game_id']
    gamePoints = eventJson["Game_points"]

    
    # {'Game_category': {'S': 'Sports'}, 'Game_name': {'S': 'Cricket'}, 'Game_id': {'S': 'hVMXMQFWOdGGE03pfEjc'}, 'Game_points': {'N': '100'}, 'Team_points_earned': {'L': [{'M': {'teamScore': {'N': '95'}, 'teamID': {'S': 'warriors'}}}, {'M': {'teamScore': {'N': '90'}, 'teamID': {'S': 'sparks'}}}, {'M': {'teamScore': {'N': '60'}, 'teamID': {'S': 'nerdies'}}}, {'M': {'teamScore': {'N': '40'}, 'teamID': {'S': 'techies'}}}]}, 'Rank': {'L': [{'M': {'teamID': {'S': 'warriors'}, 'rank': {'N': '1'}}}, {'M': {'teamID': {'S': 'sparks'}, 'rank': {'N': '2'}}}, {'M': {'teamID': {'S': 'nerdies'}, 'rank': {'N': '3'}}}, {'M': {'teamID': {'S': 'techies'}, 'rank': {'N': '4'}}}]}, 'User_points_earned': {'L': [{'M': {'userScore': {'N': '100'}, 'userID': {'S': 'abhijith'}}}, {'M': {'userScore': {'N': '90'}, 'userID': {'S': 'emayan'}}}, {'M': {'userScore': {'N': '65'}, 'userID': {'S': 'preetha'}}}]}, 'User_ranks': {'L': [{'M': {'rank': {'N': '1'}, 'userID': {'S': 'abhijith'}}}, {'M': {'rank': {'N': '2'}, 'userID': {'S': 'emayan'}}}, {'M': {'rank': {'N': '3'}, 'userID': {'S': 'preetha'}}}]}}
    status = updateDB(gameId, gameName, gameCategory, gamePoints, userPointsList)
    if(status):
        return {
            'statusCode': 200,
            'body': json.dumps('User statistics updated')
        }
    else:
        return {
            'statusCode': 200,
            'body': json.dumps('Error Updating user statistics check logs')
        }

def from_dynamodb_to_json(item):
    d = TypeDeserializer()
    return {k: d.deserialize(value=v) for k, v in item.items()}
    
def convert_decimal_to_regular(data):
    if isinstance(data, Decimal):
        return float(data) if data % 1 > 0 else int(data)
    if isinstance(data, dict):
        return {k:convert_decimal_to_regular(v) for k, v in data.items()}
    if isinstance(data, list):
        return [convert_decimal_to_regular(item) for item in data]
    return data