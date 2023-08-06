import boto3, json, urllib.request

    
def lambda_handler(event, context):
    # Get the team_id, member_id, and member_email from the event
    team_id = event.get('TeamID')
    team_name = event.get('team_name')
    member_id = event.get('MemberID')
    member_email = event.get('MemberEmail')

    if not team_id or not member_id or not member_email:
        return {
            'statusCode': 400,
            'body': 'Missing required parameters (TeamID, MemberID, or MemberEmail).'
        }
        
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('TriviaTeams')

    # Get the existing DynamoDB record for the given team_id
    response = table.get_item(Key={'TeamID': team_id})
    team_record = response.get('Item')

    if team_record:
        # Check if the member with the given member_id already exists in the team_admins array
        for admin in team_record.get('team_admins', []):
            if admin.get('id') == member_id:
                return {
                    'statusCode': 400,
                    'body': 'Member already exists in the team_admins array.'
                }

        # If the member does not exist in team_admins, add the new member details
        new_admin = {
            'id': member_id,
            'email': member_email
        }
        team_record['team_admins'].append(new_admin)

        # Update the DynamoDB record with the new team_admins array
        table.put_item(Item=team_record)
        
        t = send_emails(team_record, new_admin)

        return {
            'statusCode': 200,
            'body': 'Member added to team_admins array successfully.'
        }
        
    else:
        return {
            'statusCode': 404,
            'body': 'Team not found with the given TeamID.'
        }


def send_emails(team_record, new_admin):
    email_body = f"Hello!\n{new_admin.get('email')} has been promoted to admin for your team {team_record.get('team_name')}"
    email_subject = f"New admin for {team_record.get('team_name')}"
    emails = [admin["email"] for admin in team_record.get('team_members')]
    print(email_body, email_subject, emails)
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
    
    return {}

    
