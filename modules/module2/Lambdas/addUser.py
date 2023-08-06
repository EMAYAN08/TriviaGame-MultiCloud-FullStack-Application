import json
import boto3


def AddUser(user_id, email):
    table_name = "UserProfile"
    dynamodb = boto3.client('dynamodb')
    item = {
        'user_id': {'S': user_id},
        'email': {'S': email}
    }
    
    transaction_params = {
        'TransactItems': [
            {
                'Put': {
                    'TableName': table_name,
                    'Item': item,
                    'ConditionExpression': 'attribute_not_exists(user_id)'
                }
            }
        ]
    }
    
    try:
        response = dynamodb.transact_write_items(**transaction_params)
        print('User inserted successfully.')
        return (True,"User inserted successfully.")
    except dynamodb.exceptions.TransactionCanceledException as e:
        print(e)
        cancellation_reasons = e.response.get('CancellationReasons', [])
        for reason in cancellation_reasons:
            print(f"User insertion failed: {reason.get('Message')}")
            return (False, f"User insertion failed: {reason.get('Message')} User Name Exists")
    except Exception as e:
        print('An error occurred:', e)
        return (False, "Error adding user check logs")
    

def lambda_handler(event, context):
    user_id = event['user_id']
    email = event['email']
    status, message = AddUser(user_id, email)
    payload = {"status": status, "message":message}
    return {
        'statusCode': 200,
        'body': json.dumps(payload)
    }
