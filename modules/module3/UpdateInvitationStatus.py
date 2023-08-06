import boto3, urllib.request, json

def lambda_handler(event, context):
    # Extract query parameters
    print('query parameters: ', event, context)
    user_id = event['user_id']
    team_id = event['team_id']
    status = event['status']

    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
    table = dynamodb.Table('TriviaTeams')

    try:
        # Query DynamoDB to find the matching record
        response = table.get_item(
            Key={
                'TeamID': team_id
            }
        )

        # Update the 'invitation_status' for the specific user_id
        team_record = response.get('Item')
        if team_record:
            
            for member in team_record.get('team_members', []):
                if member.get('id') == user_id:
                    member['invitation_status'] = status
                    print('member', member)
                    break

            # Save the updated record back to DynamoDB
            table.put_item(Item=team_record)
            
            emails = [member["email"] for member in team_record.get('team_members')]
            email_body = f'Team member {user_id} accepted your invitation for team {team_record.get("team_name")}'
            email_subject = f'Team member accepted team inviation'
            
            payload = {
            'email_body': email_body, 
            'email_list': emails, 
            'email_subject': email_subject, 
            'send_to': "some"
            }
        
        json_payload = json.dumps(payload).encode("utf-8")
        
        request = urllib.request.Request('https://479wpnc4oa.execute-api.us-east-1.amazonaws.com/dev/send_notification_email', data=json_payload, headers={"Content-Type": "application/json"})

        # Send the HTTP request to the API
        response = urllib.request.urlopen(request)

        return {
            'statusCode': 200,
            'body': 'Invitation status updated successfully.'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }
