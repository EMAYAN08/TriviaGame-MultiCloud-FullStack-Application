import boto3
import json
import urllib
dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    for record in event['Records']:
        if record['eventName'] == 'INSERT':  
            new_image = record['dynamodb']['NewImage']
            user_id = new_image['user_id']['S']
            print("user id is ", user_id)
            game_count = get_game_count(user_id)
            
            thresholds = [2, 5, 10]
            for threshold in thresholds:
                if game_count > threshold:
                    send_notification(user_id, game_count, threshold)
                    return {
                        'statusCode': 200,
                        'body': json.dumps('User Acheivement Triggered')
                    }
    return {
             'statusCode': 200,
            'body': json.dumps('User Acheivement Not Triggered')
        }

def get_game_count(user_id):
    response = dynamodb.query(
        TableName='UserStats',
        KeyConditionExpression='user_id = :uid',
        ExpressionAttributeValues={
            ':uid': {'S': user_id}
        }
    )
    print("count is ", response['Count'])
    return response['Count']
def emailForUser(user_id):
    table_name = "UserProfile"
    projection_expression = 'email'
    
    response = dynamodb.get_item(
        TableName=table_name,
        Key={'user_id': {'S': user_id}},
        ProjectionExpression=projection_expression
    )
    if 'Item' in response:
        email = response['Item']['email']['S']  # Assuming "email" attribute is of type String (S)
        return email
    else:
        print('email not found for user Id')
        raise ValueError("email not found")
    

def send_notification(user_id, game_count, threshold):
    email = emailForUser(user_id)
    email_list = [email]
    email_subject =  f'Team Acheivement Unlocked!! {threshold} games played'
    email_body = f"Woohoooooo!!! \n\n You has unlocked another achivement!!!.\n\n Your have now played threshold games till now."
    
    payload = {
        'email_body': email_body, 
        'email_list': email_list, 
        'email_subject': email_subject, 
        'send_to': "some"
    }
    
    json_payload = json.dumps(payload).encode("utf-8")
    
    request = urllib.request.Request('https://479wpnc4oa.execute-api.us-east-1.amazonaws.com/dev/send_notification_email', data=json_payload, headers={"Content-Type": "application/json"})

    
    response = urllib.request.urlopen(request)
    print("response is ", response)

