import boto3


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