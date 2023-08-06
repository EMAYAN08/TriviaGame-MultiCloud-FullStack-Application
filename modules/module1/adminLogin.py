import json

def lambda_handler(event, context):
    email = event['email']
    password = event['password']
    
    if email == 'admin@gmail.com' and password == 'Admin@123':
        # TODO implement
        return {
            'statusCode': 200,
            'body': "Admin Login Successful"
        }
        
    return {
        'statusCode': 401,
        'body': "Incorrect credentials"
    }
        
    
