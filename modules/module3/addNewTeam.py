import boto3
import json, uuid

print('Loading function')
dynamo = boto3.resource('dynamodb')
# Initialize the AWS SNS client
sns_client = boto3.client('sns', region_name='us-east-1')


def lambda_handler(event, context):
    table = dynamo.Table('TriviaTeams')
    
    user_pool_id = 'us-east-1_EJeogRyNW'
    cognito_user_pool = boto3.client('cognito-idp')
    
    record = event  
    team_members = record['team_members']
    team_admins = record['team_admins']
    team_name = record['team_name']
    # print('event', event)
    # print('team_members', team_members)
    team_id = str(uuid.uuid4())
    record['TeamID'] = team_id
    
    team_created_by = team_admins[0].get('id')
    
    # for index, member in enumerate(team_members):
    #     print('index', index, 'member', member)
    #     email = member['email']
        
    #     try:
    #         response = cognito_user_pool.list_users(
    #             UserPoolId=user_pool_id,
    #             Filter=f'email = "{email}"'
    #         )
    #         if 'Users' in response:
    #             for user in response['Users']:
    #                 attributes = user.get('Attributes', [])
    #                 for attr in attributes:
    #                     if attr['Name'] == 'sub':
    #                         member['user_id'] = attr['Value']
    #                         if email in team_admins:
    #                             index = team_admins.index(email)
                                
    #                             admin_member = {
    #                                 'email': email,
    #                                 'id': attr['Value']
    #                             }
    #                             record['team_admins'][index] = admin_member
    #                         # user_ids.append(attr['Value'])
    #     except Exception as e:
    #         print(f'Error retrieving user for email {email}: {str(e)}')
            
    # print('final record:', record)
    
    # ------------------------------------------------------------------------------------------------
    # ------------------------------------------------------------------------------------------------
    
            
    for member in team_members:
        if member.get('id') != team_created_by:
            # member = member['M']
            print('member:', member, type(member))
            email = member.get('email')
            user_id = member.get('id')
            invitation_page_link_FE = 'https://sdp-14-6tdcine2na-uc.a.run.app/my-teams'
            # accept_invitation_link = f'https://6lwb6j2w0b.execute-api.us-east-1.amazonaws.com/dev/update-invitation-status?team_id={team_id}&user_id={user_id}&status=accepted'
            # reject_invitation_link = f'https://6lwb6j2w0b.execute-api.us-east-1.amazonaws.com/dev/update-invitation-status?team_id={team_id}&user_id={user_id}&status=rejected'
            email_message = f"\nYou have been invited to join a team named {team_name}. You can accept or reject the invitation by going to the website.\n Link to website: {invitation_page_link_FE}" 
            # attributes = {
            #             'email': [email]
            #         }
            # if not check_subscription(email):
            #     response = sns_client.subscribe(
            #         TopicArn='arn:aws:sns:us-east-1:877341190502:invite_team_members',
            #         Protocol='email',
            #         Endpoint=email,
            #         Attributes={
            #             'FilterPolicy': json.dumps(attributes)
            #         }
            #     )
            #     print('response from sns:', response)
                
                
            # sns_client = boto3.client('sns', region_name='your-region')
    
            message_attributes = {
                'email': {
                    'DataType': 'String',
                    'StringValue': email
                }
            }
        
            response = sns_client.publish(
                TopicArn='arn:aws:sns:us-east-1:877341190502:invite_team_members',
                Message=email_message,
                Subject='Invitation to join team - ' + team_name,
                MessageAttributes=message_attributes
            )
            
            print('response from SNS send email:', response)
                
            # accept_invitation_link = 'http://localhost:3000'
            # reject_invitation_link = 'http://localhost:3000'
            # email_message = f"You have been invited to join a team named {team_name}. You can accept or reject the invitation by clicking on links provided below.\n\n Accept Invitation: {accept_invitation_link}\n Reject Invitation: {reject_invitation_link}" 
            
            # Initialize the SQS client
            sqs_client = boto3.client('sqs', region_name='us-east-1')
        
            # Specify the URL of the SQS queue
            queue_url = 'https://sqs.us-east-1.amazonaws.com/877341190502/invite_team_members'
    
            # Send the message to the SQS queue
            response = sqs_client.send_message(QueueUrl=queue_url, MessageBody=email_message)
            print('response from sqs: ', response)
                        
    
    try:
        team_stats = {
            'total_games_played': 0,
            'top_3': 0,
            'total_team_points': 0,
            'total_game_points': 0
        }
        record['team_stats'] = team_stats
        
        
        response = table.put_item(Item=record)
        
        # Return the added record as the response payload
        return {
            'statusCode': 200,
            'body': response
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }
        
def check_subscription(email):
    response = sns_client.list_subscriptions_by_topic(
        TopicArn='arn:aws:sns:us-east-1:877341190502:invite_team_members'
    )

    # Check if the email is already subscribed to the topic
    for subscription in response['Subscriptions']:
        if subscription['Protocol'] == 'email' and subscription['Endpoint'] == email:
            return True

    return False
