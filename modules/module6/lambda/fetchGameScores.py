import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('TriviaGameScore')

    try:
        response = table.scan()
    except ClientError as e:
        print(e.response['Error']['Message'])
        return {
            'statusCode': 500,
            'body': e.response['Error']['Message']
        }
    else:
        items = response['Items']
        print('Scan succeeded. Items:', items)
        return {
            'statusCode': 200,
            'body': items
        }
