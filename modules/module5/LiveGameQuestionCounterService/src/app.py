
from numbers import Number
from flask import Flask,request, jsonify, Response
import time
from flask.scaffold import F
import pathlib
import configparser
import os
from flask_cors import CORS
from aws_auth import getAuthenticatedSession, getDynamoDB
import json 
import boto3
from boto3 import resource
from boto3.dynamodb.conditions import Key
from threading import Thread
from boto3.dynamodb.types import TypeDeserializer, TypeSerializer
from datetime import datetime
import requests



config_path = pathlib.Path(__file__).parent.absolute() / "config.ini"
config = configparser.ConfigParser()
config.read(config_path)

session = getAuthenticatedSession()

dynamodb = getDynamoDB(session)


dynamodb_resource = resource('dynamodb')


app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/*": {"origins": "*"}})

apiToTriggerOnGameEnd = "https://ucuhvg6c1f.execute-api.us-east-1.amazonaws.com/prod/sendUpdates"




def IncrementQuestionCount(tableName,liveGameId):
    attribute_to_increment = "live_trivia_game_current_question"
    increment = 1
    response = dynamodb.update_item(
    TableName=tableName,
    Key={
        'live_trivia_game_id': {'S': liveGameId}
    },
    UpdateExpression=f'SET {attribute_to_increment} = {attribute_to_increment} + :val',
    ExpressionAttributeValues={
        ':val': {'N': str(increment)}
    },
    ReturnValues='UPDATED_NEW'
    )
    return response

# Function to perform the asynchronous task

def TriggerReceiver(liveGameId, startTime, timeGap):
    time.sleep(timeGap)
    payload = {}
    payload['game_id'] = liveGameId
    payload['game_start_time'] = startTime
    payloadJson = json.dumps(payload)
    requests.post(apiToTriggerOnGameEnd, json=payloadJson)

def UpdateCurrentQuestion(tableName,liveGameId, startTime, totalQuestions, timeGap):
    currentDateTime= (datetime.utcnow())
    gameStartTime = datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S.%f")
    time_diff = (gameStartTime - currentDateTime).total_seconds()
    print("time diff between game start time and current time should be a small postivie vale: ", time_diff)
    if(time_diff > 0):
        time.sleep(time_diff)
    currentQuestion = 0
    while currentQuestion < totalQuestions:
        IncrementQuestionCount(tableName, liveGameId)
        print("current question is ", currentQuestion)
        time.sleep(timeGap)
        currentQuestion += 1
    thread = Thread(target=TriggerReceiver,args=(liveGameId, startTime, timeGap), daemon=True)
    thread.start()
   



# Endpoint to start the task
@app.route('/startGameCount', methods=['POST'])
def startGameCount():
    table_name = "live_trivia_game_question_count"
    content_type = request.headers.get('Content-Type')
    error_data = {"message": "Unknown error", "status":False}
    success_data = {"message" :"Task Started", "status" : True}
    if (content_type == 'application/json'):
        try:
            json_data = request.json
            liveGameId = json_data["live_game_id"]
            startTime = json_data["live_game_start_time"]
            timeDelay = json_data["live_game_time_delay"]
            totalQuestions = json_data["question_count"]
            print("start game count called for " + liveGameId)
            thread = Thread(target=UpdateCurrentQuestion,args=(table_name, liveGameId, startTime, totalQuestions, timeDelay), daemon=True)
            thread.start()
            return jsonify(success_data)
        except Exception as e:
            print(e)
    return jsonify(error_data)
            
    

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
