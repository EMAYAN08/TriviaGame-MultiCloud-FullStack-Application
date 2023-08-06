import json
import urllib.request

def lambda_handler(event, context):
    # Check if the event contains the required data
    if 'gameId' not in event or 'updateData' not in event:
        return {
            'statusCode': 400,
            'body': 'Missing gameId or updateData in the request body.'
        }

    api_url = 'https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/game'
    request_body = event  # Get the request body from the input event

    try:
        # Convert the request body to JSON format
        data = json.dumps(request_body).encode('utf-8')

        # Make the PUT request to the API endpoint
        req = urllib.request.Request(api_url, data=data, method='PUT', headers={'Content-Type': 'application/json'})
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
                    'body': 'Failed to update game data.'
                }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }
