import boto3, json, urllib.request

def lambda_handler(event, context):
    # Extract the TeamID and member's email from the event
    team_id = event['TeamID']
    member_id = event['MemberID']
    member_email = event['MemberEmail']
    admin_id = event['AdminID']
    admin_email = ''
    
    if "AdminEmail" in event:
        admin_email = event['AdminEmail']
    # member_email = 'preethamkachhadiya@gmail.com'  # Change this to the email of the member you want to remove

    # Initialize the DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('TriviaTeams')

    # Get the current record from DynamoDB
    response = table.get_item(Key={'TeamID': team_id})
    team_record = response.get('Item')
    
    print(team_record)
    old_team_record = team_record

    team_members = team_record['team_members']
    updated_members = [member for member in team_members if member['id'] != member_id]
    team_record['team_members'] = updated_members

    team_admins = team_record['team_admins']
    updated_admins = [admin for admin in team_admins if admin['id'] != member_id]
    team_record['team_admins'] = updated_admins

    # Update the DynamoDB record
    table.put_item(Item=team_record)

    send_emails(old_team_record, member_email)
    
    # Return a success response
    return {
        'statusCode': 200,
        'body': 'Team member removed successfully.'
    }
    

def send_emails(team_record, member_email):
    email_body = f"{member_email} has been removed from your team {team_record.get('team_name')}"
    email_subject = f"Member removed from {team_record.get('team_name')}"
    emails = [admin["email"] for admin in team_record.get('team_members')]
    
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
        statusCode: 200,
        body: "member removed successfully"
    }
