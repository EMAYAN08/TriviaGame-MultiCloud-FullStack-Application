import boto3
import json
import urllib.request

def lambda_handler(event, context):
    # If the event contains a 'body' key, parse the JSON data from it
    if 'body' in event:
        data = json.loads(event['body'])
    else:
        # If there's no 'body' key, assume the event data is already in JSON format
        data = event

    # Fetch categories
    categories = fetch_categories()

    # Fetch game details
    game_details = fetch_game_details()

    # Rest of the code remains the same
    game_id = data['game_id']
    user_score_list = data['user_score_list']
    team_score_list = data['team_score_list']
    
    # Initialize the DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table_name = "TriviaGameScore"
    table = dynamodb.Table(table_name)
    
    # Fetch the corresponding game detail
    game_detail = next((g for g in game_details if g.get('id') == game_id), None)
    if game_detail:
        item = {
            'game_id': game_id,
            'Game_category': game_detail.get('category'),
            'Game_name': game_detail.get('name'),
            'Game_points': 100,  # default value
            'Rank': [],
            'Team_points_earned': [],
            'User_points_earned': [],
            'User_ranks': [],
            'duration': game_detail.get('duration'),
            'createdAt': game_detail.get('createdAt'),
            'difficultyLevel': game_detail.get('difficultyLevel'),
            'description': game_detail.get('description'),
            'startTime': game_detail.get('startTime'),
            'participants': game_detail.get('participants')
        }
    else:
        return {
            'statusCode': 500,
            'body': json.dumps('Game detail not found for game_id: {}'.format(game_id))
        }

    # Calculate ranks and scores for teams
    sorted_team_scores = sorted(team_score_list, key=lambda x: x['team_score'], reverse=True)
    for rank, team_score in enumerate(sorted_team_scores, start=1):
        if rank > 10:
            break
        team_id = team_score['team_id']
        score = team_score['team_score']
        item['Team_points_earned'].append({"teamID": team_id, "teamScore": score})
        item['Rank'].append({"rank": rank, "teamID": team_id})

    # Calculate ranks and scores for users
    sorted_user_scores = sorted(user_score_list, key=lambda x: x['user_score'], reverse=True)
    for rank, user_score in enumerate(sorted_user_scores, start=1):
        if rank > 10:
            break
        user_id = user_score['user_id']
        score = user_score['user_score']
        item['User_points_earned'].append({"userID": user_id, "userScore": score})
        item['User_ranks'].append({"rank": rank, "userID": user_id})

    # Store the item in the DynamoDB table
    try:
        response = table.put_item(Item=item)
        # After storing the data in DynamoDB, send it to a cloud function
        try:
            cloud_function_url = 'https://us-central1-serverless-a2-emayan.cloudfunctions.net/leaderboard'  # Replace with your cloud function URL
            headers = {'Content-Type': 'application/json'}
            data = json.dumps(item).encode()  # Convert the data to bytes
            req = urllib.request.Request(cloud_function_url, headers=headers, data=data, method='POST')
            with urllib.request.urlopen(req) as response:
                if response.status != 200:
                    return {
                        'statusCode': 500,
                        'body': json.dumps('Error sending data to the cloud function: {}'.format(response.read().decode()))
                    }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps('Error sending data to the cloud function: {}'.format(str(e)))
            }
        return {
            'statusCode': 200,
            'body': json.dumps('Data stored successfully in DynamoDB.')
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps('Error storing data in DynamoDB: {}'.format(str(e)))
        }

def fetch_categories():
    categories_url = "https://2ta7t7duj3.execute-api.ca-central-1.amazonaws.com/dev"
    with urllib.request.urlopen(categories_url) as response:
        categories_data = json.loads(response.read().decode())
    categories_data = categories_data['body']
    return categories_data

def fetch_game_details():
    games_url = "https://7wldkmbyq5.execute-api.ca-central-1.amazonaws.com/dev"
    games_request = urllib.request.Request(games_url, method='POST')
    with urllib.request.urlopen(games_request) as response:
        games_data = json.loads(response.read().decode())
    return games_data['body']