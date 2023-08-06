import json
import urllib.request

def lambda_handler(event, context):
    userID = event['user_id']  # Correct the key to 'user_id' to match the request body

    api_url = 'https://dqod94jn34.execute-api.us-east-1.amazonaws.com/dev/get_all_teams_by_userid'
    
    # Make the API request with the provided event data using urllib.requests
    req = urllib.request.Request(api_url, method='POST', data=json.dumps(event).encode('utf-8'))
    req.add_header('Content-Type', 'application/json')
    
    try:
        with urllib.request.urlopen(req) as response:
            response_data = json.loads(response.read().decode('utf-8'))
            if response_data['statusCode'] == 200:
                response_body = response_data['body']  # Keep the body as a string
                if isinstance(response_body, list):
                    return {
                        'statusCode': 200,
                        'body': response_body
                    }
                else:
                    teams = json.loads(response_body)  # Parse the 'body' key as JSON
                    accepted_teams = [
                        team for team in teams
                        if any(
                            member.get('invitation_status') == 'accepted' and member.get('email') == userID
                            for member in team.get('team_members', [])
                        )
                    ]
                    return {
                        'statusCode': 200,
                        'body': accepted_teams
                    }
            else:
                return {
                    'statusCode': response_data['statusCode'],
                    'body': response_data['body']
                }
    except urllib.error.HTTPError as e:
        return {
            'statusCode': e.code,
            'body': e.reason
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }
