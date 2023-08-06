import boto3

def lambda_handler(event, context):
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('TriviaTeams')
    
    given_user_id = event['user_id']

    # Given userID to search for in the team_members array
    # given_user_id = 'b4382408-1071-7017-d74d-9bcf504499be'

    try:
        # # Query DynamoDB to find records with the given user ID in team_members array
        # response = table.scan(
        #     FilterExpression='contains(team_members, :given_user_id)',
        #     ExpressionAttributeValues={':given_user_id': given_user_id }
        # )
        
        # Use the GSI for querying
        # response = table.query(
        #     IndexName='team_members-id-index',  # Replace with the name of your GSI
        #     KeyConditionExpression="team_members = :user_id",
        #     ExpressionAttributeValues={":user_id": given_user_id}
        # )
        response = table.scan()
        print('response', response)

        # Manually filter records with the given user_id in the team_members array
        matching_records = []
        for item in response['Items']:
            team_members = item.get('team_members', [])
            for member in team_members:
                if member.get('id') == given_user_id and member.get('invitation_status') == 'accepted':
                    matching_records.append(item)
                    break
                
        print('matching_records:', len(matching_records))
    
        # return matching_records
        

        # Retrieve the matching items from the response
        # items = response['Items']

        # Optionally, you can perform further processing or filtering on the items
        # For example, if you want to return only specific attributes, you can map the items.

        return {
            'statusCode': 200,
            'body': matching_records
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }
