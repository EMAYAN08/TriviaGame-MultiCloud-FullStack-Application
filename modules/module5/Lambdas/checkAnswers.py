from email import message
import boto3
import requests
from boto3 import resource
from boto3.dynamodb.conditions import Key
from collections import Counter

import json


from boto3.dynamodb.types import TypeDeserializer, TypeSerializer

dynamodb_resource = resource('dynamodb')



def sendRealTimeScore(gameId, teamId, newScore):
    realTimeScoreApi = "https://n6uiatys72.execute-api.us-east-1.amazonaws.com/receiveTeamScore"
    payload = createRealTimeTeamScorePayload(gameId, teamId, newScore)
    response = requests.post(realTimeScoreApi, json = payload)
    print("Response is ", response)

def createRealTimeTeamScorePayload(gameId, teamId, newScore):
    print("real time score update ", gameId, " team Id ", teamId, "new Score", newScore)
    payload = {"game_id":gameId, "team_id": teamId, "current_score":newScore}
    return payload



def from_dynamodb_to_json(item):
    d = TypeDeserializer()
    return {k: d.deserialize(value=v) for k, v in item.items()}

     
def GetActiveQuestionNumber(dynamoDB, gameId):
    tableName = "live_trivia_game_question_count"
    keyName = "live_trivia_game_id"
    response = None
    try:
        response = dynamoDB.get_item(
        TableName=tableName,
        Key={
            keyName: {
            'S': gameId}
        }
        )   
        item = from_dynamodb_to_json(response['Item'])
        activeQuestionNumber = item['live_trivia_game_current_question']
        print(activeQuestionNumber)
        return activeQuestionNumber
    except Exception as e:
        print("exception while getting active question number from live game table", e)
        return 0

def UpdateTeamScore(dynamoDB, gameId, teamId, questionNumber, scoreToIncrement, answeredBy):
    
    table_name = 'TeamGameScore'

    # Specify the primary key values for the item
    partition_key_value = gameId
    sort_key_value = teamId

    partitionKeyName = "live_trivia_game_id"
    sortKeyName = "team_id"

    # Define the update expression and attribute values for incrementing a column
    update_expression = 'SET score = score + :val, lastQuestionAnswered = :val2, answeredBy = :val3'
    attribute_values = {':val': {'N': str(scoreToIncrement)}, ':val2': {'N': str(questionNumber)}, ':val3': {'S': answeredBy}}  # Adjust the value to increment by as needed

    # Define the put item request parameters
    put_item_params = {
        'TableName': table_name,
        'Item': {
            'live_trivia_game_id': {'S': partition_key_value},
            'team_id': {'S': sort_key_value},
            'score': {'N': str(scoreToIncrement)} ,
            'lastQuestionAnswered': {'N' : str(questionNumber)},
            'answeredBy' : {'S': answeredBy}
            # Initial value or adjust as needed
        },
        'ConditionExpression': 'attribute_not_exists(live_trivia_game_id) AND attribute_not_exists(team_id)',  # Insert condition
        'ReturnValues': 'NONE'  # Return no values after the put item operation
    }

    # Define the update item request parameters
    update_item_params = {
        'TableName': table_name,
        'Key': {
            'live_trivia_game_id': {'S': partition_key_value},
            'team_id': {'S': sort_key_value}
        },
        'UpdateExpression': update_expression,
        'ExpressionAttributeValues': attribute_values,
        'ConditionExpression': 'attribute_exists(live_trivia_game_id) AND attribute_exists(team_id) AND lastQuestionAnswered < :val2',  # Update condition
        'ReturnValues': 'UPDATED_NEW'  # Return no values after the update item operation
    }

    # Try to insert the item
    try:
        putResponse = dynamoDB.put_item(**put_item_params)
        newScore = scoreToIncrement
        return (1, f"Question answered By User for {questionNumber} new score is ", newScore)
    except dynamoDB.exceptions.ConditionalCheckFailedException:
        # If the item already exists, update it instead
        try:
            updateResponse = dynamoDB.update_item(**update_item_params)
            newScoreResponse =  updateResponse.get('Attributes', {}).get('score', 0)
            newScore = int(newScoreResponse['N'])
            if(scoreToIncrement == 0):
                newScore = 0
            print(f"Question answered By User for team {questionNumber} new score is ", newScore, "type is ", type(newScore))
            return (1, "Question Answered by User", newScore)
        except dynamoDB.exceptions.ConditionalCheckFailedException:
            print("question already answered by someone")
            return (2, "Question already answered by TeamMate", 0)


def UpdateUserScore(dynamoDB, gameId, userId, questionNumber, scoreToIncrement):
    table_name = 'UserGameScore'

   

    # Define the update expression and attribute values for incrementing a column
    update_expression = 'SET score = score + :val, lastQuestionAnswered = :val2'
    attribute_values = {':val': {'N': str(scoreToIncrement)}, ':val2': {'N': str(questionNumber)}}  # Adjust the value to increment by as needed

    # Define the put item request parameters
    put_item_params = {
        'TableName': table_name,
        'Item': {
            'trivia_game_id': {'S': gameId},
            'user_id': {'S': userId},
            'score': {'N': str(scoreToIncrement)} ,
            'lastQuestionAnswered': {'N' : str(questionNumber)},
            # Initial value or adjust as needed
        },
        'ConditionExpression': 'attribute_not_exists(trivia_game_id) AND attribute_not_exists(user_id)',  # Insert condition
        'ReturnValues': 'NONE'  # Return no values after the put item operation
    }

    # Define the update item request parameters
    update_item_params = {
        'TableName': table_name,
        'Key': {
            'trivia_game_id': {'S': gameId},
            'user_id': {'S': userId}
        },
        'UpdateExpression': update_expression,
        'ExpressionAttributeValues': attribute_values,
        'ConditionExpression': 'attribute_exists(trivia_game_id) AND attribute_exists(team_id) AND lastQuestionAnswered < :val2',  # Update condition
        'ReturnValues': 'UPDATED_NEW'  # Return no values after the update item operation
    }

    # Try to insert the item
    try:
        putResponse = dynamoDB.put_item(**put_item_params)
        newScore =  scoreToIncrement
        return (1, "Question answered By User", newScore)
    except dynamoDB.exceptions.ConditionalCheckFailedException:
        # If the item already exists, update it instead
        try:
            updateResponse = dynamoDB.update_item(**update_item_params)
            newScoreResponse =  updateResponse.get('Attributes', {}).get('score', 0)
            newScore = int(newScoreResponse['N'])
            if(scoreToIncrement == 0):
                newScore = 0
            print("new score is for user ", newScore, "type is ", type(newScore))
            return  (1, "Question answered by User", newScore)
        except dynamoDB.exceptions.ConditionalCheckFailedException:
            return  (2, "Question already answered by User", 0)

def GetScoreForQuestion(difficultyLevel):
    if(difficultyLevel == "MEDIUM"):
        return 30
    elif(difficultyLevel == "EASY"):
        return 20
    else:
        return 40

        
def GetCorrectAnswerForQuestion(dynamoDB, tableName, triviaIdentifierName, triviaIdentifierValue,
                                    questionNumber):
        response = None
        try:
            table_name = tableName
            if triviaIdentifierName is not None and triviaIdentifierValue is not None:
                response = dynamoDB.get_item(
                TableName=table_name,
                Key={
                    triviaIdentifierName: {
                'S': triviaIdentifierValue}
                }
                )
            else:
                raise ValueError('Parameters missing or invalid')   
    
            item = from_dynamodb_to_json(response['Item'])
            if item:
                triviaQuestionsCorrectAnswer = []
                difficultyLevel = "MEDIUM"
                if('difficulty_level' in item.keys()):
                    difficultyLevel = item['difficulty_level']

                for k in item["questions"]:
                    if(k['question_number'] == questionNumber):
                        correctAnswerList = k['correct_answers']
                        if difficultyLevel in k:
                            difficultyLevel = k['difficulty_level']
                        for i in correctAnswerList:
                            triviaQuestionsCorrectAnswer.append(i)
                return (triviaQuestionsCorrectAnswer, difficultyLevel)
            else:
                print('Item not found')
                raise ValueError('No questions in the game') 
        except Exception as e:
            print (f"Exception occured while fetching questions for game with id {triviaIdentifierValue}")
            raise e


def lists_to_number(lst):
    return int(''.join(map(str, sorted(lst))))

def are_lists_equal(list1, list2):
    is_equal=  lists_to_number(list1) == lists_to_number(list2)
    print("list 1 is ", list1, "list two is ", list2, "is equal ", is_equal)
    return is_equal
# def are_lists_equal(list1, list2):
#     is_equal =  set(list1) == set(list2) and len(list1) == len(list2)
#     print("are list equal ", is_equal)
#     return is_equal

def GetFinalMessage(statusCodeUser, statusCodeTeam, scoreToIncrement):
    message = ""
    if(statusCodeUser == 1 and statusCodeTeam == 1):
        message = "Both team score and user score updated with user's answer"
    elif(statusCodeUser == 1 and statusCodeTeam == 2):
        message = "User score updated by current answer by user, Team mate already answered, and its included in teams score"
    elif(statusCodeUser == 2):
        message = "Question already answered by User"
    return message

def main(gameId, teamId, userId, questionNumber, userSubmittedAnswers, teamName):
    print("Checking Answers for Game", gameId)
    dynamo = boto3.client('dynamodb')
    team_id = teamId    
    user_id = userId
    table_name = 'TriviaGameTable'
    liveGameKey = 'trivia_game_id'
    liveGameId = gameId
    questionNumber = questionNumber
    print("question Number for which answer submmited ", questionNumber)
    currentQuestionInGame = GetActiveQuestionNumber(dynamo,liveGameId)
    print("currentQuestionInGame is ", currentQuestionInGame)
    if(int(questionNumber) >= currentQuestionInGame):
        (answersList, difficultyLevel) =  GetCorrectAnswerForQuestion(dynamo, table_name, liveGameKey,
                                                liveGameId, questionNumber)
        scoreToIncrement = 0
        print("answerList : ",answersList)
        print("userSubmtted Answers: ", userSubmittedAnswers)
        if(are_lists_equal(answersList, userSubmittedAnswers)):
            scoreToIncrement =  GetScoreForQuestion(difficultyLevel)
            print("score to increment", scoreToIncrement)
        else:
            print("Incorrect Answer")
        (statusCodeTeam , messageTeam, newScore) = UpdateTeamScore(dynamo, liveGameId, team_id, questionNumber, scoreToIncrement, user_id)
        (statusCodeUser, messageUser, newScoreUser) = UpdateUserScore(dynamo, liveGameId, user_id, questionNumber, scoreToIncrement)
        message = GetFinalMessage(statusCodeUser, statusCodeTeam, scoreToIncrement)
         
       
      
        if(newScore > 0):
            print("new score is ", newScore)
            sendRealTimeScore(gameId, teamName, newScore)
        return message
    return "Answer Time out"
    

def lambda_handler(event, context):
    
    print("event is ", event)

    gameId  = event["gameId"]
    teamId = event["teamId"]
    teamName = event["teamName"]
    questionNumber = event["questionNumber"]
    userId = event["userId"]
    answerList = event["answer"] 
    try:
        message = main(gameId, teamId, userId, questionNumber, answerList, teamName)
        return {
        'statusCode': 200,
        'body': json.dumps(message)
    }
    except Exception as e:  
        print("exception in server", e)
        message = "Error in server"
        return {
        'statusCode': 500,
        'body': json.dumps(message)
        }
        

    
