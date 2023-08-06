import json, boto3, urllib.request

def lambda_handler(event, context):
    
    print('event', event)
    email = event['request']['userAttributes']['email']
    user_id = event['request']['userAttributes']['sub']
    attributes = {
                    'email': [email, 'all']
                }
    sns_client = boto3.client('sns', region_name='us-east-1')
    response = sns_client.subscribe(
        TopicArn='arn:aws:sns:us-east-1:877341190502:invite_team_members',
        Protocol='email',
        Endpoint=email,
        Attributes={
            'FilterPolicy': json.dumps(attributes)
        }
    )
    
    payload = {
            'user_id': user_id, 
            'email': email 
        }
        
    json_payload = json.dumps(payload).encode("utf-8")
    
    request = urllib.request.Request('https://7tnancjd1l.execute-api.us-east-1.amazonaws.com/prod/adduser/', data=json_payload, headers={"Content-Type": "application/json"})

    # Send the HTTP request to the API
    response = urllib.request.urlopen(request)
    
    print('response from sns:', response)
    # TODO implement
    return event
