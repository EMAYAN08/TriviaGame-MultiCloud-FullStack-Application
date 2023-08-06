
import boto3
import readers_lock
from boto3.dynamodb.types import TypeDeserializer, TypeSerializer
import json
from decimal import Decimal

# Question list is stored in json string form not object form
class QuestionsCache:
    def __init__(self, dynamodb_) -> None:
        self.shared_lock = readers_lock.ReadWriteLock()
        self.questions_dict = {} # live game id question list dict 
        self.otherProperties = {}
        self.privateInfoDict = {}
        self.dynamoDB = dynamodb_
    def AddQuestion(self, liveGameId, questionList, startTime, timeDelay, totalQuestionsCount, privateInfo):
        self.shared_lock.acquire_write()
        try:
            self.questions_dict[liveGameId] = questionList
            self.otherProperties[liveGameId] = {}
            self.otherProperties[liveGameId]['startTime'] = startTime
            self.otherProperties[liveGameId]['timeDelay'] = timeDelay
            self.otherProperties[liveGameId]["totalQuestionsCount"] = totalQuestionsCount
            self.privateInfoDict[liveGameId] = privateInfo
            self.shared_lock.release_write()
            return True
        except Exception as e:
            print(e)
            self.shared_lock.release_write()
            return False
        
    def AddQuestionWithoutLocks(self, liveGameId, questionList, startTime, timeDelay, totalQuestionsCount):
        try:
            self.questions_dict[liveGameId] = questionList
            self.otherProperties[liveGameId] = {}
            self.otherProperties[liveGameId]['startTime'] = startTime
            self.otherProperties[liveGameId]['timeDelay'] = timeDelay
            self.otherProperties[liveGameId]["totalQuestionsCount"] = totalQuestionsCount
            return True
        except Exception as e:
            print(e)
            return False
        
    def GetQuestionList(self, liveGameId):
        self.shared_lock.acquire_read()
        try:
            result = self.questions_dict[liveGameId]
            self.shared_lock.release_read()
            return result
        except KeyError:
            self.shared_lock.release_read()
            print("Key not found.")
        except Exception as e:
            print(e)
            self.shared_lock.release_read()
            raise e
    def GetQuestion(self, liveGameId, questionNumber):
        if(questionNumber >=  1 and questionNumber <= self.GetTotalQuestions(liveGameId)):
            self.shared_lock.acquire_read()
            try:
                result = self.questions_dict[liveGameId][questionNumber - 1]
                self.shared_lock.release_read()
                return result
            except Exception as e:
                print(e)
                raise e
        else:
            raise ValueError(f"Invalid Question Number : {questionNumber}")
    def GetPrivateInfoForQuestion(self, liveGameId, questionNumber):
        if(questionNumber >=  1 and questionNumber <= self.GetTotalQuestions(liveGameId)):
            self.shared_lock.acquire_read()
            try:
                result = self.privateInfoDict[liveGameId][questionNumber - 1]
                self.shared_lock.release_read()
                return result
            except Exception as e:
                print(e)
                raise e
        else:
            raise ValueError(f"Invalid Question Number : {questionNumber}")
    
    def GetTimeDelay(self, liveGameId):
        self.shared_lock.acquire_read()
        timeDelay = None
        if(self.otherProperties.get(liveGameId)):
            timeDelay = self.otherProperties[liveGameId]['timeDelay']
        self.shared_lock.release_read()
        if not timeDelay:
            raise ValueError(f"No time delay present for {liveGameId}")
        return timeDelay
    def GetTotalQuestions(self, liveGameId):
        self.shared_lock.acquire_read()
        totalQuestions = None
        if(self.otherProperties.get(liveGameId)):
            totalQuestions = self.otherProperties[liveGameId]["totalQuestionsCount"]
        self.shared_lock.release_read()
        if not totalQuestions:
            raise ValueError(f"No question count present for {liveGameId}")
        return totalQuestions
    
    def GetStartTime(self, liveGameId):
        self.shared_lock.acquire_read()
        startTime = None
        if(self.otherProperties.get(liveGameId)):
            startTime =  self.otherProperties[liveGameId]['startTime']
        self.shared_lock.release_read()
        if not startTime:
            raise ValueError(f"No start time present for {liveGameId}")
        return startTime
     
    def HasQuestionList(self, liveGameId):
        self.shared_lock.acquire_read()
        try:
            isKeyPresent = liveGameId in self.questions_dict
            self.shared_lock.release_read()
            return isKeyPresent
        except Exception as e:
            print(e)
            self.shared_lock.release_read()
            return False
        
    def Print(self):
        pass

    def from_dynamodb_to_json(self, item):
        d = TypeDeserializer()
        return {k: d.deserialize(value=v) for k, v in item.items()}
    
    def convert_decimal_to_regular(self,data):
        if isinstance(data, Decimal):
            return float(data) if data % 1 > 0 else int(data)
        if isinstance(data, dict):
            return {k: self.convert_decimal_to_regular(v) for k, v in data.items()}
        if isinstance(data, list):
            return [self.convert_decimal_to_regular(item) for item in data]
        return data
    
    def PopulateGameDetailsFromDB(self, gameId):
        try:
            (questions, privateInfo) = self.GetLiveGameQuestions(gameId)
            liveGameDetails = self.GetActiveGameDetails(gameId)
            startTime = liveGameDetails["start_timestamp"]
            timeDelay = liveGameDetails["time_per_question"]
            totalQuestions = liveGameDetails["total_questions"]
            self.AddQuestion(gameId, questions, startTime, timeDelay, totalQuestions, privateInfo)
            return True
        except Exception as e:
            print(e)
            return False
    def GetLiveGameQuestions(self, gameId):
        response = None
        try:
            table_name = "TriviaGameTable"
          
            response = self.dynamoDB.get_item(
                TableName=table_name,
                Key={
                    "trivia_game_id": {
                'S': gameId}
                }
                )
            
    
            item = self.from_dynamodb_to_json(response['Item'])
            if item:
                triviaQuestionsWithoutCorrectAnswer = []
                triviaPrivateInfoList = []
                for k in item["questions"]:
                    triviaPrivateInfo = {}
                    triviaPrivateInfo['correct_answers'] = k['correct_answers']
                    triviaPrivateInfo ["question_hint"] = k["question_hint"]
                    triviaPrivateInfo ["question_explanation"] = k["question_explanation"]
                    k.pop('correct_answers', None)
                    k.pop('question_hint', None)
                    k.pop('question_explanation', None)
                    triviaQuestionsWithoutCorrectAnswer.append(json.dumps(k))
                    triviaPrivateInfoList.append(json.dumps(triviaPrivateInfo))
                return (triviaQuestionsWithoutCorrectAnswer, triviaPrivateInfoList)
            else:
                print('Item not found')
                raise ValueError('No questions in the game') 
        except Exception as e:
            print (f"Exception occured while fetching questions for game with id {gameId}")
            raise e
    def GetActiveGameDetails(self, gameId):
        tableName = "live_trivia_game_question_count"
        keyName = "live_trivia_game_id"
        response = None
        try:
            response = self.dynamoDB.get_item(
            TableName=tableName,
            Key={
                keyName: {
                'S': gameId}
            }
            )   
            item = self.from_dynamodb_to_json(response['Item'])
            item = self.convert_decimal_to_regular(item)
            print("item is ", item)
            return item
        except Exception as e:
            print("exception while getting active question number from live game table", e)
            return 0
    