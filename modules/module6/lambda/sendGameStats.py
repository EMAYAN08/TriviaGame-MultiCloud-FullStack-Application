import json
import urllib.request

def lambda_handler(event, context):
    
    print("event details: ", event)
    # Loop over each record in the event
    for record in event['Records']:
        # Ensure the event is an INSERT event
        if record['eventName'] == 'INSERT':
            # Extract new image (the inserted record)
            new_record = record['dynamodb']['NewImage']
            
            # Convert the new record to JSON
            new_record_json = json.dumps(new_record)

            # Define the URLs to send the POST requests to
            urls = [
                'https://n6uiatys72.execute-api.us-east-1.amazonaws.com/addTeamScore',
                'https://b4u5mvovgf.execute-api.us-east-1.amazonaws.com/dev/add_game_statistics',
                'https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/game/getdata',
                'https://my5dvb2kej.execute-api.us-east-1.amazonaws.com/prod/gamescore'
            ]

            # Loop over each URL
            for url in urls:
                # Create a request
                req = urllib.request.Request(
                    url, 
                    data=new_record_json.encode('utf-8'), 
                    headers={'content-type': 'application/json'}, 
                    method='POST'
                )
                
                # Send the request
                try:
                    response = urllib.request.urlopen(req)
                    print(f'Response from {url}: ', response.read().decode())
                except Exception as e:
                    print(f'Error occurred while sending POST request to {url}: ', e)

    return {
        'statusCode': 200,
        'body': json.dumps('Lambda function executed successfully!')
    }
