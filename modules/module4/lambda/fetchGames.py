import json
import urllib.request

def lambda_handler(event, context):
    api_url = 'https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/game/filter'
    headers = {'Content-Type': 'application/json'}
    
    try:
        data = {}
        
        # Check for presence of attributes in the event data and build the data dictionary
        if 'categoryId' in event:
            data['categoryId'] = event['categoryId']
        
        if 'difficultyLevel' in event:
            data['difficultyLevel'] = event['difficultyLevel']
        
        if 'duration' in event:
            data['duration'] = event['duration']
        
        # Send the request
        req = urllib.request.Request(api_url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
        
        with urllib.request.urlopen(req) as response:
            if response.getcode() == 200:
                response_data = json.loads(response.read().decode('utf-8'))
                return {
                    'statusCode': 200,
                    'body': response_data
                }
            else:
                return {
                    'statusCode': response.getcode(),
                    'body': 'Failed to fetch games.'
                }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }
