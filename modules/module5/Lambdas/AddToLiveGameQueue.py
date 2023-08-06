import json
import requests
import boto3
from boto3 import resource
from boto3.dynamodb.conditions import Key
import json
from datetime import datetime, timedelta

def getAuthenticatedSession(profileName=None, region=None):
    try:
        if(not profileName):
            return  boto3.Session()
        return boto3.Session(profile_name=profileName, region_name=region)
    except Exception as e:
        print(e)
        raise e
def getSQS(session):
    try:
        return session.client('sqs')
    except Exception as e:
        print(e)
        raise e

def getDynamoDB(session):
     try:
        return session.client('dynamodb')
     except Exception as e:
        print(e)
        raise e

def CreateMessagePayload(payload):
    jsonPayload = {}
    print("game Launches at ", payload["live_game_start_time"])
    jsonPayload["trivia_live_game_id"] = payload["live_game_id"]
    jsonPayload["trivia_live_game_start_time"] = payload["live_game_start_time"]
    jsonPayload["questions_count"] = 4
    return json.dumps(jsonPayload)
    
def WakeUpLiveGameJobsCreator():
    apiUrl = "https://livegamejobcreator-cf4azy4lca-uc.a.run.app/start_task"
    response = requests.post(apiUrl)
    print(response)


def PushToSQS(sqs, queueUrl, message):
    try:
        message_content = message
        response = sqs.send_message(
                QueueUrl=queueUrl,
                MessageBody=message_content
            )
        message_id = response['MessageId']
        print(f"Message sent. Message ID: {message_id}")
        return True
    except Exception as e:
        print("Exception while pushing live game to SQS ", e)
        return False
        
        
  



def main(payload):
    # Your code here
    session =  getAuthenticatedSession()
    print(session.region_name)
    queue_url = 'https://sqs.us-east-1.amazonaws.com/603952130835/LiveGameQueue'
    sqs = getSQS(session)
    triviaLiveGameId = "hVMXMQFWOdGGE03pfEjc"
    jsonPayload = CreateMessagePayload(payload)
    status = PushToSQS(sqs, queue_url, jsonPayload)
   
    return status

def lambda_handler(event, context):
    payload = json.loads(event['payload'])
    print("payload is ", payload)
    status = main(payload)
    response = {"status" : "success"}
    if(status): 
        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }
    else:
        response["status"] = "failure"
        return {
              'statusCode': 200,
            'body': json.dumps(response)
        }
