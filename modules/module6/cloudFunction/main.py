import functions_framework
import json
import logging
from google.cloud import firestore

# Initialize the Firestore client
db = firestore.Client()

@functions_framework.http
def hello_http(request):
    request_json = request.get_json(silent=True)
    if request_json:
        try:
            # Add the document to the 'triviaGameScores' collection
            db.collection('triviaGameScores').add(request_json)
            return json.dumps({"success": True, "message": "Data stored in Firestore successfully."}), 200
        except Exception as e:
            # Log the exception
            logging.error("Error occurred while storing data in Firestore: %s", e)
            return json.dumps({"success": False, "message": str(e)}), 500
    else:
        return json.dumps({"success": False, "message": "No data provided."}), 400