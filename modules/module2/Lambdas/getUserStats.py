import json
import boto3

def get_user_stats(user_id):
    dynamodb = boto3.client('dynamodb')

    partition_key = user_id
    table_name = 'UserStats'
    
    params = {
        'TableName': table_name,  # Replace with your DynamoDB table name
        'KeyConditionExpression': 'user_id = :partitionKey',
        'ExpressionAttributeValues': {
            ':partitionKey': {'S': partition_key}
        }
    }
    
    response = dynamodb.query(**params)
    
    items = response.get('Items', [])
    
    metrics = {
        'sum': 0,
        'avg': 0,
        'max': -1,
        'min': 101,
        'count': 0
    }
    
    acments = {'games_played': '', 'score': ''}
    
    for item in items:
        game_score = int(item.get('user_score', {'N': '0'})['N'])
        total_score = int(item.get('game_points', {'N': '0'})['N'])
    
        normalized_score = 0 if total_score == 0 else (game_score / total_score) * 100
    
        metrics['sum'] += normalized_score
        metrics['count'] += 1
        metrics['max'] = max(metrics['max'], normalized_score)
        metrics['min'] = min(metrics['min'], normalized_score)
      
    metrics['avg'] = metrics['sum'] / metrics['count'] if metrics['count'] > 0 else 0
    
    if(metrics['count'] == 0):
        metrics['max'] = 0;
        metrics['min'] = 0;
    
    if(metrics['count'] > 0 and metrics['count'] < 2):
        acments['games_played'] = "Rookie Trivia Player"
    elif metrics['count'] > 2 and metrics['count'] < 5:
        acments['games_played'] = "Pro Trivia Player"
    elif metrics['count'] > 5:
        acments['games_played'] = "Expert Trivia Player"
        
    if(metrics['avg'] > 50 and metrics['avg'] < 75):
        acments['score'] = "Rookie Scorer"
    elif metrics['avg'] > 75 and metrics['avg'] < 90:
        acments['score'] = "Pro Scorer"
    elif metrics['avg'] > 90:
        acments['score'] = "Expert Scorer"
        
    
        
    
    print('Metrics:', metrics)
    print("Acheivements: ", acments)
    return metrics, acments

def lambda_handler(event, context):
    try:
        user_id = event['user_id']
        metrics, acments = get_user_stats(user_id)
        return {
            'statusCode': 200,
            'body': json.dumps({'metrics':metrics, 'acments': acments})
        }
    except Exception as e:
        print("exception occured", e)
        return {
            'statusCode': 400,
            'body': json.dumps("Getting User Stats Failed")
        }
        
