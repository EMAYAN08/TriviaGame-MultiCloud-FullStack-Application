import json
import boto3

def lambda_handler(event, context):
    # Initialize the AWS Cognito client
    cognito_client = boto3.client('cognito-idp')

    # # Check the event type to determine the action
    # if event['action'] == 'signup':
        # Extract the user details from the event
    # username = event['email']
    password = event['password']
    email = event['email']

    try:
        # Call the SignUp API to register a new user
        response = cognito_client.sign_up(
            ClientId='us-east-1_EJeogRyNW',
            Em=email,
            Password=password,
            UserAttributes=[
                {'email': 'email', 'Value': email}
            ]
        )
        
        # User signup successful
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User signup successful'})
        }
    
    except Exception as e:
        # User signup failed
        return {
            'statusCode': 400,
            'body': json.dumps({'message': str(e)})
        }

    # elif event['action'] == 'login':
    #     # Extract the user credentials from the event
    #     username = event['username']
    #     password = event['password']

    #     try:
    #         # Call the InitiateAuth API to authenticate the user
    #         response = cognito_client.initiate_auth(
    #             AuthFlow='USER_PASSWORD_AUTH',
    #             ClientId='us-east-1_EJeogRyNW',
    #             AuthParameters={
    #                 'USERNAME': username,
    #                 'PASSWORD': password
    #             }
    #         )
            
    #         # User login successful
    #         return {
    #             'statusCode': 200,
    #             'body': json.dumps({'message': 'User login successful', 'accessToken': response['AuthenticationResult']['AccessToken']})
    #         }
        
    #     except Exception as e:
    #         # User login failed
    #         return {
    #             'statusCode': 400,
    #             'body': json.dumps({'message': str(e)})
    #         }

    # else:
    #     # Invalid action
    #     return {
    #         'statusCode': 400,
    #         'body': json.dumps({'message': 'Invalid action'})
    #     }
