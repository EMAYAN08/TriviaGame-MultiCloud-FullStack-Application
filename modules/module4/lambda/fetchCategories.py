import json
import urllib.request

def lambda_handler(event, context):
    api_url = 'https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/category/getall'
    
    try:
        with urllib.request.urlopen(api_url) as response:
            if response.getcode() == 200:
                response_data = json.loads(response.read().decode('utf-8'))
                return {
                    'statusCode': 200,
                    'body': response_data
                }
            else:
                return {
                    'statusCode': response.getcode(),
                    'body': 'Failed to fetch categories.'
                }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }
