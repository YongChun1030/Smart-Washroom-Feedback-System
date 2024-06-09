from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from bson.json_util import dumps, ObjectId
from datetime import timezone, datetime
from waitress import serve
from twilio.rest import Client
from dotenv import load_dotenv
import pytz
import os

# Load environment variables from .env file
load_dotenv()

MYT = pytz.timezone('Asia/Kuala_Lumpur')

app = Flask(__name__, static_folder='../swfs-project-frontend/dist')

# Allow CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

# MongoDB connection
mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://yongchun021030:lkpFNX0Hun8tUh1Z@cluster-swfs.zvavyj2.mongodb.net/')
client = MongoClient(mongo_uri)
db = client['washroom']

# Collections
configurations = db['configurations']
feedback = db['feedback']
problems = db['problems']
cleaner_logs = db['cleaner_logs']

# Your Twilio credentials
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_phone_number = os.getenv('TWILIO_PHONE_NUMBER')

# Check if Twilio credentials are provided
if not account_sid or not auth_token or not twilio_phone_number:
    raise ValueError("Twilio account SID, auth token, and phone number must be provided")

# Initialize Twilio client
client = Client(account_sid, auth_token)

def send_whatsapp_message(to, message):
    client.messages.create(
        body=message,
        from_=f'whatsapp:{twilio_phone_number}',
        to=f'whatsapp:{to}'
    )

# API routes
@app.route('/api/configuration', methods=['POST'])
def save_configuration():
    try:
        data = request.get_json()
        toiletType = data.get('toiletType')
        floor = data.get('floor')

        # Check if the configuration already exists
        existing_configuration = configurations.find_one({
            'toiletType': toiletType,
            'floor': floor
        })

        if existing_configuration:
            return jsonify({'message': 'Configuration already exists'}), 400

        # Insert the new configuration
        configurations.insert_one({
            'toiletType': toiletType,
            'floor': floor
        })

        return jsonify({'message': 'Configuration saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/configuration', methods=['GET'])
def get_configuration():
    try:
        config = configurations.find_one()
        if config:
            return dumps(config)
        return jsonify({'message': 'No configuration found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rating', methods=['POST'])
def save_rating():
    try:
        data = request.get_json()
        rating = data.get('rating')
        toiletType = data.get('toiletType')
        floor = data.get('floor')
        timestamp = datetime.now(MYT)
        timestamp_str = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        feedback.insert_one({
            'rating': rating,
            'toiletType': toiletType,
            'floor': floor,
            'timestamp': timestamp_str
        })
        return jsonify({'message': 'Rating saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/problem', methods=['POST'])
def save_problem():
    try:
        data = request.get_json()
        problems_list = data.get('problems', [])
        toiletType = data.get('toiletType')
        floor = data.get('floor')
        timestamp = datetime.now(MYT)
        timestamp_str = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        problems_to_insert = [
            {
                'description': problem,
                'toiletType': toiletType,
                'floor': floor,
                'timestamp': timestamp_str,
                'solved': False
            }
            for problem in problems_list
        ]
        problems.insert_many(problems_to_insert)

        # Send WhatsApp message to the cleaner
        message = f"{', '.join(problems_list)} at {toiletType}, {floor}"
        send_whatsapp_message('+60195403338', message)  # Replace with the cleaner's WhatsApp number

        return jsonify({'message': 'Problems saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/other-problem', methods=['POST'])
def save_other_problem():
    try:
        data = request.get_json()
        description = data.get('description')
        toiletType = data.get('toiletType')
        floor = data.get('floor')
        timestamp = datetime.now(MYT)
        timestamp_str = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        problems.insert_one({
            'description': description,
            'toiletType': toiletType,
            'floor': floor,
            'timestamp': timestamp_str,
            'solved': False
        })

        # Send WhatsApp message to the cleaner
        message = f"{description} at {toiletType}, {floor}"
        send_whatsapp_message('+60195403338', message)  # Replace with the cleaner's WhatsApp number

        return jsonify({'message': 'Problem saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/problems', methods=['GET'])
def get_problems():
    try:
        toiletType = request.args.get('toiletType')
        floor = request.args.get('floor')
        query = {'solved': False}
        if toiletType:
            query['toiletType'] = toiletType
        if floor:
            query['floor'] = floor
        problem_list = problems.find(query)
        return dumps({'problems': [problem for problem in problem_list]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cleaner-login', methods=['POST'])
def cleaner_login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if username == 'cleaner' and password == 'password':
            return jsonify({'message': 'Login successful'}), 200
        return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/solve-problems', methods=['POST'])
@cross_origin()
def solve_problems():
    try:
        data = request.get_json()
        print("Request data received:", data)  # Log the received data

        problem_ids = data.get('problemIds', [])
        cleaner_id = data.get('cleanerId')

        print("Received problem IDs:", problem_ids)
        print("Received cleaner ID:", cleaner_id)

        # Ensure that the problem IDs are in the correct format
        object_ids = []
        for problem_id in problem_ids:
            try:
                obj_id = ObjectId(problem_id['$oid']) if isinstance(problem_id, dict) else ObjectId(problem_id)
                object_ids.append(obj_id)
            except Exception as e:
                print(f"Error converting problem_id {problem_id} to ObjectId: {str(e)}")

        print("Converted Object IDs:", object_ids)

        # Find descriptions and additional information of the selected problems
        descriptions_cursor = problems.find(
            {'_id': {'$in': object_ids}},
            {'description': 1, 'toiletType': 1, 'floor': 1}
        )

        problem_details = {str(desc['_id']): {
            'description': desc['description'],
            'toiletType': desc.get('toiletType', ''),
            'floor': desc.get('floor', '')
        } for desc in descriptions_cursor}
        print("Problem details:", problem_details)

        # Check if we have valid descriptions
        if not problem_details:
            print("No descriptions found for the provided problem IDs.")
            return jsonify({'error': 'No descriptions found for the provided problem IDs.'}), 400

        # Update problems to set solved=True for all problems with the same description
        update_result = problems.update_many(
            {'description': {'$in': [desc['description'] for desc in problem_details.values()]}},
            {'$set': {'solved': True}}
        )

        print(f"Updated {update_result.matched_count} document(s), {update_result.modified_count} document(s) modified")

        timestamp = datetime.now(MYT)
        timestamp_str = timestamp.strftime('%Y-%m-%d %H:%M:%S')

        # Log the cleaning actions
        for object_id, details in problem_details.items():
            log_entry = {
                'problem_id': object_id,
                'description': details['description'],
                'toiletType': details['toiletType'],
                'floor': details['floor'],
                'cleaner_id': cleaner_id,
                'timestamp': timestamp_str
            }
            result = cleaner_logs.insert_one(log_entry)
            print(f"Logged cleaning for problem ID: {object_id}, description: {details['description']}")
            print(f"Toilet type: {details['toiletType']}, Floor: {details['floor']}")
            print(f"Log entry: {log_entry}")
            print(f"Insertion result: {result.inserted_id}")

        return jsonify({'message': 'Problems marked as solved'}), 200
    except Exception as e:
        print(f"Error in solve_problems: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=5000)
