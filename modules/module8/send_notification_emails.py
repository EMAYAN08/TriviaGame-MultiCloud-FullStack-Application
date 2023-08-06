import json,boto3

def lambda_handler(event, context):
    
    send_to = event['send_to']
    email_subject = event['email_subject']
    email_body = event['email_body']
    
    print(send_to, email_subject, email_body)
    
    sns_client = boto3.client('sns', region_name='us-east-1')
    
    if event['send_to'] == "all":
        message_attributes = {
            'email': {
                    'DataType': 'String',
                    'StringValue': 'all'
                }
        }
        response = sns_client.publish(
            TopicArn='arn:aws:sns:us-east-1:877341190502:invite_team_members',
            Message=email_body,
            Subject=email_subject,
            MessageAttributes=message_attributes
        )
    
    if event['send_to'] == "some":
        email_list = event['email_list']
        
        for email in email_list:
            message_attributes = {
                    'email': {
                        'DataType': 'String',
                        'StringValue': email
                    }
                }
            
            response = sns_client.publish(
                TopicArn='arn:aws:sns:us-east-1:877341190502:invite_team_members',
                Message=email_body,
                Subject=email_subject,
                MessageAttributes=message_attributes
            )
            
        return {}
            