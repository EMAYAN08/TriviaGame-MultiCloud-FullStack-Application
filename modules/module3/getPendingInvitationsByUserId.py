import boto3

def get_teams_with_pending_invitations(user_email):
    dynamodb = boto3.resource('dynamodb')
    table_name = 'TriviaTeams'  # Replace with the actual name of your DynamoDB table
    table = dynamodb.Table(table_name)

    response = table.scan()

    result = []
    for item in response['Items']:
        team_id = item.get('TeamID')
        team_name = item.get('team_name')

        team_members = [member for member in item.get('team_members', []) ]
        team_admins = [admin for admin in item.get('team_admins', []) if admin.get('email') != user_email]
        
        print('details ',team_members, team_admins)
        # Check if the user has a 'pending' invitation in the team_members
        user_pending_invitation = any(member.get('invitation_status') == 'pending' and member.get('email') == user_email for member in item.get('team_members', []))
        
        
        
        if user_pending_invitation:
            team_details = {
                'team_id': team_id,
                'team_name': team_name,
                'team_members': team_members,
                'team_admins': team_admins
            }
            
            print('team_details', team_details)
            result.append(team_details)
            
    print('result array', result)

    return result

def lambda_handler(event, context):
    user_email = event['user_email']
    # user_email = 'pr966330@dal.ca'  # Replace with the actual email of the user

    teams_with_pending_invitations = get_teams_with_pending_invitations(user_email)

    return {
        'statusCode': 200,
        'body': teams_with_pending_invitations
    }
