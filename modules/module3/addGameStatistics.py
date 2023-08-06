import json, boto3, urllib.request
from boto3.dynamodb.types import TypeDeserializer

def lambda_handler(event, context):
    # print('event', event)
#     dynamodb_item = {
#   'Game_category': {
#     'S': 'Sports'
#   },
#   'Game_name': {
#     'S': 'Cricket'
#   },
#   'Game_id': {
#     'S': 'hVMXMQFWOdGGE03pfEjc' 
#   },
#   'Game_points': {
#     'N': '100'
#   },
#   'Team_points_earned': {
#     'L': [
#       {
#         'M': {
#           'teamScore': {
#             'N': '95'
#           },
#           'teamID': {
#             'S': '714af683-32c9-412b-bac3-ff015c8f187c'
#           }
#         }
#       },
#       {
#         'M': {
#           'teamScore': {
#             'N': '90'
#           },
#           'teamID': {
#             'S': 'c1d04a4f-8be4-4d74-a9a1-66e2e5ac52dd'
#           }
#         }
#       },
#       {
#         'M': {
#           'teamScore': {
#             'N': '60'
#           },
#           'teamID': {
#             'S': 'c1d04a4f-8be4-4d74-a9a1-66e2e5ac52db'
#           }
#         }
#       },
#       {
#         'M': {
#           'teamScore': {
#             'N': '40'
#           },
#           'teamID': {
#             'S': 'aa631e66-4feb-4f15-bf4a-6e84bb2dbb99'
#           }
#         }
#       }
#     ]
#   },
#   'Rank': {
#     'L': [
#       {
#         'M': {
#           'teamID': {
#             'S': '714af683-32c9-412b-bac3-ff015c8f187c'
#           },
#           'rank': {
#             'N': '1'
#           }
#         }
#       },
#       {
#         'M': {
#           'teamID': {
#             'S': 'c1d04a4f-8be4-4d74-a9a1-66e2e5ac52dd'
#           },
#           'rank': {
#             'N': '2'
#           }
#         }
#       },
#       {
#         'M': {
#           'teamID': {
#             'S': 'c1d04a4f-8be4-4d74-a9a1-66e2e5ac52db'
#           },
#           'rank': {
#             'N': '3'
#           }
#         }
#       },
#       {
#         'M': {
#           'teamID': {
#             'S': 'aa631e66-4feb-4f15-bf4a-6e84bb2dbb99'
#           },
#           'rank': {
#             'N': '4'
#           }
#         }
#       }
#     ]
#   },
#   'User_points_earned': {
#     'L': [
#       {
#         'M': {
#           'userScore': {
#             'N': '100'
#           },
#           'userID': {
#             'S': 'abhijith'
#           }
#         }
#       },
#       {
#         'M': {
#           'userScore': {
#             'N': '90'
#           },
#           'userID': {
#             'S': 'emayan'
#           }
#         }
#       },
#       {
#         'M': {
#           'userScore': {
#             'N': '65'
#           },
#           'userID': {
#             'S': 'preetha'
#           }
#         }
#       }
#     ]
#   },
#   'User_ranks': {
#     'L': [
#       {
#         'M': {
#           'rank': {
#             'N': '1'
#           },
#           'userID': {
#             'S': 'abhijith'
#           }
#         }
#       },
#       {
#         'M': {
#           'rank': {
#             'N': '2'
#           },
#           'userID': {
#             'S': 'emayan'
#           }
#         }
#       },
#       {
#         'M': {
#           'rank': {
#             'N': '3'
#           },
#           'userID': {
#             'S': 'preetha'
#           }
#         }
#       }
#     ]
#   }
# }
    dynamodb_item = event

    # python_object = boto3.dynamodb.types.TypeDeserializer().deserialize(dynamodb_item)
    
    # Create a DynamoDB TypeDeserializer
    deserializer = TypeDeserializer()

    # Convert the DynamoDB item to a regular Python dictionary
    game_data = {key: deserializer.deserialize(value) for key, value in dynamodb_item.items()}
    print(game_data)
    
    # ---------------------------------------------------------------------------------------------------------------------
    
    team_details = []
    
    # Extract Team points earned and Rank data from the DynamoDB object
    team_points_earned = game_data.get('Team_points_earned', [])
    rank_data = game_data.get('Rank', [])
    
    # Create a set to store teamIDs with ranks 1, 2, or 3
    top_3_teams = set(rank_info['teamID'] for rank_info in rank_data if int(rank_info.get('rank')) in [1, 2, 3])
    
    for team in team_points_earned:
        team_id = team.get('teamID')
        team_score = int(team.get('teamScore'))
        
        # Check if the team is in the top 3 based on the rank
        is_top_3 = team_id in top_3_teams
        
        # Create the team details object for each team
        team_detail = {
            'teamID': team_id,
            'top_3': is_top_3,
            'teamScore': team_score
        }
        
        team_details.append(team_detail)
    print('team_details array', team_details)
    
    # -----------------------------------------------------------------------------------------------------------------------
        
    dynamodb = boto3.resource('dynamodb') 
    table = dynamodb.Table('TriviaTeams')
    game_score = game_data['Game_points']
    
    try:
        for item in team_details:
            print('current team in FOR LOOP', item)
            team_id = item.get('teamID')
            team_score = item.get('teamScore')
            top_3 = item.get('top_3')
            
            # Use scan to filter the table based on the email
            response = table.scan(
                FilterExpression='TeamID = :val',
                ExpressionAttributeValues={':val': team_id}
            )
    
            # Check if a user with the provided email is found
            items = response['Items']
            if(items):
                print('response from get team', items)
                
                user = items[0]
                print('current team from DB', user)
                
                current_stats = user.get('team_stats')
                print('current_stats BEFORE', current_stats)
                
                if top_3:
                    current_stats['top_3']  += 1
                # current_stats['top_3']  = current_stats['top_3'] + 1 if top_3 else 
                current_stats['total_games_played'] += 1
                current_stats['total_game_points'] += game_score
                current_stats['total_team_points'] += team_score
                
                print('current_stats AFTER', current_stats)
                
                record = user
                record['team_stats'] = current_stats
                
                table.put_item(
                        Item=record
                    )
                    
                checkForAchievements(record)
    
                # # Update the DynamoDB record with the new details
                # response = table.update_item(
                #     Key={'teamID': team_id},
                #     UpdateExpression='SET #ft3 = :flag_top_3, #ts = :teamScore',
                #     ExpressionAttributeNames={
                #         '#ft3': 'flag_top_3',
                #         '#ts': 'teamScore'
                #     },
                #     ExpressionAttributeValues={
                #         ':flag_top_3': item['flag_top_3'],
                #         ':teamScore': team_score
                #     }
                # )
    
                return {
                    'statusCode': 200,
                    'body': 'Records updated successfully'
                }
            return {
                    'statusCode': 200,
                    'body': 'No teams found with given id'
                }
    except Exception as e:
        # Handle any errors that occurred during the updates
        return {
            'statusCode': 500,
            'body': str(e)
        }

        # # Print the result (optional)
        # print('FINAL', team_details)
    
        # # TODO implement
        # return {
        #     'statusCode': 200,
        #     'body': json.dumps('Hello from Lambda!')
        # }
    
    
def checkForAchievements(record):
    #  record = {
    #     'team_stats': {
    #         'total_games_played': 40
    #     },
    #     'team_name': 'TESTING',
    #     'team_members': [
    #         {
    #             'email': 'preethamkachhadiya@gmail.com',
    #             'id': "gds8erwf8sd"
    #         },
    #         {
    #             'email': 'pr966330@dal.ca',
    #             'id': "43j24i5h34"
    #         }
    #     ]
    # }
    team_stats = record['team_stats']
    team_members = record['team_members']
    
    if(team_stats['total_games_played'] % 10 == 0):
        email_list = [item["email"] for item in team_members]
        team_name = record['team_name']
        email_subject = f'Team Acheivement Unlocked!!'
        email_body = f"Woohoooooo!!! \n\n Your team {team_name} has unlocked another achivement!!!.\n\n Your team has now played {team_stats['total_games_played']} games till now."
        
        payload = {
            'email_body': email_body, 
            'email_list': email_list, 
            'email_subject': email_subject, 
            'send_to': "some"
        }
        
        json_payload = json.dumps(payload).encode("utf-8")
        
        request = urllib.request.Request('https://479wpnc4oa.execute-api.us-east-1.amazonaws.com/dev/send_notification_email', data=json_payload, headers={"Content-Type": "application/json"})

        # Send the HTTP request to the API
        response = urllib.request.urlopen(request)
    # team_stats = record['team-stats']
    # team_members = record['team_members']
    
    # if(team_states.total_games_played % 10 == 0):
    #     email_list = [item["email"] for item in team_members]
    #     team_name = record['team_name']
    #     email_subject = f'Team Acheivement Unlocked!!'
    #     email_body = f'Woohoooooo!!! \n\n Your team {team_name} has unlocked another achivement!!!.\n\n Your team has now played {team_states.total_games_played} games till now.'
        
    #     payload = {
    #         email_body, email_list, email_subject, "send_to": "some"
    #     }
        
    #     json_payload = json.dumps(data).encode("utf-8")
        
    #     request = urllib.request.Request('https://479wpnc4oa.execute-api.us-east-1.amazonaws.com/dev/send_notification_email', data=json_payload, headers={"Content-Type": "application/json"})

    #     # Send the HTTP request to the API
    #     response = urllib.request.urlopen(request)
    
