
import glob
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
from datetime import datetime, timedelta
from QuestionsCache import QuestionsCache
import requests





questionsListHardCoded = '[{\"answers\":[{\"answer_content\":\"Mango\",\"answer_number\":\"1\"},{\"answer_content\":\"Apple\",\"answer_number\":\"2\"},{\"answer_content\":\"Banana\",\"answer_number\":\"3\"},{\"answer_content\":\"Strawberry\",\"answer_number\":\"4\"}],\"question_content\":\"Whatisthebestfruit?\",\"question_type\":\"MS\",\"question_number\":\"1\",\"status\":1},{\"answers\":[{\"answer_content\":\"AWS\",\"answer_number\":\"1\"},{\"answer_content\":\"GoogleCloud\",\"answer_number\":\"2\"},{\"answer_content\":\"Azure\",\"answer_number\":\"3\"},{\"answer_content\":\"Openstack\",\"answer_number\":\"4\"}],\"question_content\":\"Whatisthebestcloud?\",\"question_type\":\"MC\",\"question_number\":\"2\",\"status\":1},{\"answers\":[{\"answer_content\":\"DynamoDB\",\"answer_number\":\"1\"},{\"answer_content\":\"Firestore\",\"answer_number\":\"2\"},{\"answer_content\":\"Aurora\",\"answer_number\":\"3\"},{\"answer_content\":\"MySQL\",\"answer_number\":\"4\"}],\"question_content\":\"Whichisthefirstdatabase\",\"question_type\":\"MC\",\"question_number\":\"3\",\"status\":1},{\"answers\":[{\"answer_content\":\"Nodeveloeprs\",\"answer_number\":\"1\"},{\"answer_content\":\"Somelangaugesarepopular\",\"answer_number\":\"2\"},{\"answer_content\":\"Forcepeopletoselectingalanguage\",\"answer_number\":\"3\"},{\"answer_content\":\"OtherReasons\",\"answer_number\":\"4\"}],\"question_content\":\"WhyawsdoestprovidesamefunctionalityinallSDKS?\",\"question_type\":\"MS\",\"question_number\":\"4\",\"status\":1}]'




config_path = pathlib.Path(__file__).parent.absolute() / "config.ini"
config = configparser.ConfigParser()
config.read(config_path)

session = getAuthenticatedSession()

dynamodb = getDynamoDB(session)


questionsCache = QuestionsCache(dynamodb)


dynamodb_resource = resource('dynamodb')
table_name = "live_trivia_game_question_count"


app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/*": {"origins": "*"}})





def ConvertResponseStringToEventStreamFormat(responseString):
    return f'data: {responseString}\n\n'


def GetCurrentQuestionCount(tableName,liveGameId):
    attribute_to_get = "live_trivia_game_current_question"
    response = dynamodb.get_item(
    TableName=tableName,
    Key={
        'live_trivia_game_id': {'S': liveGameId}
    },
    ProjectionExpression=attribute_to_get
    )
    if 'Item' in response:
        item = response['Item']
        attribute_value = item.get(attribute_to_get)
        return int(attribute_value['N'])
    raise ValueError("Cannot Fetch Live Question Count\n")

# Function to perform the asynchronous task
def AddCurrentQuestion(liveGameId, startTime, timeDelay, totalQuestions, questionsList, privateList):
    global questionsCache
    questionsCache.AddQuestion(liveGameId, questionsList, startTime, timeDelay, totalQuestions, privateList)


# Endpoint to start the task
@app.route('/FetchLiveGameDetails', methods=['POST'])
def FetchQuestions():
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
            questionsList = json_data["questions_list"]
            privateList = json_data ["private_list"]
            thread = Thread(target=AddCurrentQuestion,args=(liveGameId, startTime, timeDelay, totalQuestions, questionsList, privateList), daemon=True)
            thread.start()
            return jsonify(success_data)
        except Exception as e:
            print(e)
    return jsonify(error_data)

# uses server side events
@app.route('/PushQuestions/<liveGameId>',  methods=['POST', 'GET'])
def PushQuestions(liveGameId):
    game_not_started_data = {"message": "Game Not Started", "status":0}
    game_over_data = {"message" :"Game Over", "status" : 2}
    game_data_error = {"message" :"Unknown Error", "status" : 3}
    game_already_over = {"message": "Game already over at : ", "status":5}
    game_almost_started = {"message": "Game will start shortly in : ", "status":6}
    game_not_started_data_string = json.dumps(game_not_started_data)
    game_over_data_string = json.dumps(game_over_data)
    game_data_error_string = json.dumps(game_data_error)
    
    currentQuestionsCache = QuestionsCache(dynamodb)
    
    status = currentQuestionsCache.PopulateGameDetailsFromDB(liveGameId)
    if(not status):
        return Response(ConvertResponseStringToEventStreamFormat(game_data_error_string), mimetype='text/event-stream')
    startTime = currentQuestionsCache.GetStartTime(liveGameId)
    gameStartTime = datetime.strptime(startTime,"%Y-%m-%d %H:%M:%S.%f")
    totalQuestions = currentQuestionsCache.GetTotalQuestions(liveGameId)
    timeDelay = currentQuestionsCache.GetTimeDelay(liveGameId)
    currentDateTime= (datetime.utcnow())
    estimatedGameEndTime = gameStartTime + timedelta(seconds = totalQuestions * timeDelay)
    print("current date Time: ", currentDateTime, " estimated end time: ", estimatedGameEndTime)
    if(currentDateTime > estimatedGameEndTime):
         game_already_over["message"] = game_already_over["message"] + str(estimatedGameEndTime)
         game_already_over_string = json.dumps(game_already_over)
         return Response(ConvertResponseStringToEventStreamFormat(game_already_over_string), mimetype='text/event-stream')
    time_diff = (gameStartTime - currentDateTime).total_seconds()
    if(time_diff > 150):
        return Response(ConvertResponseStringToEventStreamFormat(game_not_started_data_string), mimetype='text/event-stream')

    
    currentQuestionNumber = GetCurrentQuestionCount(table_name, liveGameId)
    def event_stream(currentQuestionNumber):
        currentDateTime= (datetime.utcnow())
        time_diff = (gameStartTime - currentDateTime).total_seconds()
        print("time difference in seconds between game start time and current time is ",time_diff)
        if(time_diff > 0):
            if(time_diff > 5):
                print("timer started")
                game_almost_started = {"message": "Game will start shortly in : ", "status":6}
                game_almost_started['time_counter'] = int(time_diff)
                game_almost_started_string = json.dumps(game_almost_started)
                print("return string ", game_almost_started_string)
                yield 'data: {}\n\n'.format(game_almost_started_string) 
            else:
                time.sleep(time_diff - 2)
        currentQuestionNumber = GetCurrentQuestionCount(table_name, liveGameId)
        while(currentQuestionNumber < 1 and datetime.utcnow() < gameStartTime):
            currentQuestionNumber = GetCurrentQuestionCount(table_name, liveGameId)
        if(currentQuestionNumber < 1):
            currentQuestionNumber = 1
        firstTimeDelay = None
        useFirstDelayTime = False
        if(currentQuestionNumber > 0):
            currentDateTime= (datetime.utcnow())
            currentQuestionEndTime = gameStartTime + timedelta(seconds = timeDelay * (currentQuestionNumber))
            firstTimeDelay = (currentQuestionEndTime - currentDateTime).total_seconds()
            print(currentQuestionNumber, "is the current question number")
            print("second time diff", firstTimeDelay)
            if(firstTimeDelay > 0):
                useFirstDelayTime = True
        
        # nonlocal firstTimeDelay
        # nonlocal useFirstDelayTime
        currentQuestionNumberInEvent = currentQuestionNumber
        while currentQuestionNumberInEvent <= totalQuestions:
            questionToSend = currentQuestionsCache.GetQuestion(liveGameId, currentQuestionNumberInEvent)
            privateInfo = None
            if(currentQuestionNumberInEvent > 1):
                privateInfo = currentQuestionsCache.GetPrivateInfoForQuestion(liveGameId, currentQuestionNumberInEvent)
            payloadDict = {}
            payloadDict["status"] = 1
            payload = []
            payload.append(questionToSend)
            payload.append(privateInfo)
            payloadDict["payload"] = payload
            payloadDictJson = json.dumps(payloadDict)
            yield 'data: {}\n\n'.format(payloadDictJson)
            currentQuestionNumberInEvent += 1
            if useFirstDelayTime:
                time.sleep(firstTimeDelay)
                useFirstDelayTime = False
            else:
                time.sleep(timeDelay)
        privateInfoForLastQuestion = currentQuestionsCache.GetPrivateInfoForQuestion(liveGameId, totalQuestions)
        game_over_data ['private_info'] = privateInfoForLastQuestion
        game_over_data_string = json.dumps(game_over_data)
        yield ConvertResponseStringToEventStreamFormat(game_over_data_string)
    return Response(event_stream(currentQuestionNumber), mimetype='text/event-stream')



# uses server side events
@app.route('/PushQuestions2/<liveGameId>',  methods=['POST', 'GET'])
def PushQuestions2(liveGameId):
    game_not_started_data = {"message": "Game Not Started", "status":0}
    game_over_data = {"message" :"Game Over", "status" : 2}
    game_data_error = {"message" :"Unknown Error", "status" : 3}
    game_not_started_data_string = json.dumps(game_not_started_data)
    game_over_data_string = json.dumps(game_over_data)
    game_data_error_string = json.dumps(game_data_error)
    
    global questionsCache
    global questionsListHardCoded
    currentTime = datetime.utcnow()
    timeString = currentTime.strftime("%Y-%m-%d %H:%M:%S.%f")
    questionsListHardCodedObject = json.loads(questionsListHardCoded)
    questionsCache.AddQuestion("1", questionsListHardCodedObject, timeString, 20, 4)
    questionsCache.Print()

    if(not questionsCache.HasQuestionList(liveGameId)):
        return Response(ConvertResponseStringToEventStreamFormat(game_data_error_string), mimetype='text/event-stream')
    startTime = questionsCache.GetStartTime(liveGameId)
    currentDateTime= (datetime.utcnow())
    gameStartTime = datetime.strptime(startTime,"%Y-%m-%d %H:%M:%S.%f")
    time_diff = (gameStartTime - currentDateTime).total_seconds()
    totalQuestions = questionsCache.GetTotalQuestions(liveGameId)
    timeDelay = questionsCache.GetTimeDelay(liveGameId)
  
    if(time_diff > 0):
        if(time_diff < 60):
            time.sleep(time_diff)
        else:
            return Response(ConvertResponseStringToEventStreamFormat(game_not_started_data_string), mimetype='text/event-stream')
    currentQuestionNumber = 1
    while(currentQuestionNumber < 1):
        currentQuestionNumber = GetCurrentQuestionCount(table_name, liveGameId)
    firstTimeDelay = None
    useFirstDelayTime = False
    if(currentQuestionNumber > 0):
        currentDateTime= (datetime.utcnow())
        currentQuestionEndTime = gameStartTime + timedelta(seconds = timeDelay * (currentQuestionNumber))
        firstTimeDelay = (currentQuestionEndTime - currentDateTime).total_seconds()
        print(currentQuestionNumber, "is the current question number")
        print("second time diff", firstTimeDelay)
        if(firstTimeDelay > 0):
            useFirstDelayTime = True
    def event_stream(currentQuestionNumber):
        nonlocal firstTimeDelay
        nonlocal useFirstDelayTime
        currentQuestionNumberInEvent = currentQuestionNumber
        while currentQuestionNumberInEvent <= totalQuestions:
            questionToSend = json.dumps(questionsCache.GetQuestion(liveGameId, currentQuestionNumberInEvent))
            yield 'data: {}\n\n'.format(questionToSend)
            currentQuestionNumberInEvent += 1
            if useFirstDelayTime:
                time.sleep(firstTimeDelay)
                useFirstDelayTime = False
            else:
                time.sleep(timeDelay)
        yield ConvertResponseStringToEventStreamFormat(game_over_data_string)
    return Response(event_stream(currentQuestionNumber), mimetype='text/event-stream')
            
    

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080)
