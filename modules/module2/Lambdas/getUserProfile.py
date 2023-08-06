import json
import boto3
from boto3.dynamodb.types import TypeDeserializer, TypeSerializer

        
def from_dynamodb_to_json(item):
    d = TypeDeserializer()
    return {k: d.deserialize(value=v) for k, v in item.items()}
    
def getUserProfile(userID):
    dynamodb = boto3.client('dynamodb')
    table_name = "UserProfile"
    query_params = {
    'TableName': table_name,
    'KeyConditionExpression': '#partition_key = :partition_value',
    'ExpressionAttributeNames': {
        '#partition_key': 'user_id'
    },
    'ExpressionAttributeValues': {
        ':partition_value': {'S':userID}
    }
}
    response = dynamodb.query(**query_params)
    items = response.get('Items', [])
    itemsJson = None
    for item in items:
        itemsJson = (from_dynamodb_to_json(item))
        break
    if not 'user_address' in itemsJson.keys():
        itemsJson['user_address']= ""
    if not 'user_phone_number' in itemsJson.keys():
        itemsJson["user_phone_number"] = ""
    if not 'user_profile_picture' in itemsJson.keys():
        itemsJson['user_profile_picture'] = None
    return itemsJson
    

def lambda_handler(event, context):
    print("event is ", event)
    try:
        #bodyJson = json.loads(event['body'])
        userID = event['user_id']
        response = getUserProfile(userID)
        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }
    except Exception as e:
        print("exception happened", e)
        return {
            'statusCode': 400,
            'body': "Error Fetching Profile failed"
        }
