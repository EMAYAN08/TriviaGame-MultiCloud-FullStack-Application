import json
import boto3

def lambda_handler(event, context):
    team_id = event.get('TeamID')

    if not team_id:
        return {
            'statusCode': 400,
            'body': 'Missing TeamID in the request.'
        }

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('TriviaTeams')

    response = table.get_item(Key={'TeamID': team_id})
    team_record = response.get('Item')
    
    print('team_record', team_record)


    if not team_record:
        return {
            'statusCode': 404,
            'body': 'Team record not found.'
        }

    return {
        'statusCode': 200,
        'body': team_record
    }
