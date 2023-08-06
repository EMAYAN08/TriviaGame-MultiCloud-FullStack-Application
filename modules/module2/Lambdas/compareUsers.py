import json
import boto3

def getUserStats(userId):
    lambda_client = boto3.client('lambda')
    target_function_name = 'getUserStats'
    payload = {
        "user_id": userId
    }
    
    response = lambda_client.invoke(
        FunctionName=target_function_name,
        InvocationType='RequestResponse',  # Use 'RequestResponse' to wait for response
        Payload=json.dumps(payload)  # Serialize payload to JSON
    )
    print("response is ", response)
    if(response['ResponseMetadata']['HTTPStatusCode'] == 200):
        response_payload = response['Payload'].read().decode('utf-8')
        print("response payload", response_payload)
        body =  json.loads(response_payload)['body']
        bodyJson =  json.loads(body)
        return bodyJson['metrics'], bodyJson['acments']
    return False
def compareUserMetrics(userOneId, userTwoId, user_one_stats, user_two_stats):
    user_one_metrics, user_one_acments = user_one_stats
    user_two_metrics, user_two_acments = user_two_stats
    compare_metric = {}
    for metric in user_two_metrics.keys():
        userOneVal = user_one_metrics[metric]
        userTwoVal = user_two_metrics[metric]
        compare_metric_for_metric_one = {}
        compare_metric_for_metric_one['metric_value'] = [userOneVal, userTwoVal]
        if(userOneVal > userTwoVal):
            compare_metric_for_metric_one['metric_winner'] = userOneId
        elif (userTwoVal > userOneVal):
            compare_metric_for_metric_one['metric_winner'] = userTwoVal
        else:
            compare_metric_for_metric_one['metric_winner'] = "Its a Tie"
        compare_metric[metric] = compare_metric_for_metric_one
    return compare_metric 

def lambda_handler(event, context):
    print("event is ", event)
    try:
        user_one_id = event['user_one_id']
        user_two_id = event['user_two_id']
        user_one_stats = getUserStats(user_one_id)
        user_two_stats = getUserStats(user_two_id)
        if(not user_one_stats or not  user_two_stats):
            return {
                'statusCode': 400,
                'body': json.dumps('Compare Failed')
            }
        else:
            compareResults = compareUserMetrics(user_one_id, user_two_id, user_one_stats, user_two_stats)
            return {
                'statusCode': 400,
                'body': json.dumps(compareResults)
            }
    except Exception as e:
        print("exception occurd", e)
        return {
                'statusCode': 400,
                'body': json.dumps("Compare Failed")
            }
        
            
        
