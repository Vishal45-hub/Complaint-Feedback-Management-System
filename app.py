from flask import Flask, render_template, request, jsonify
from flask_pymongo import PyMongo
from datetime import datetime
import os
from dotenv import load_dotenv
import json
import warnings
import webbrowser
from bson import ObjectId

# Suppress Flask development server warning
warnings.filterwarnings('ignore', message='.*development server.*')

load_dotenv()

app = Flask(__name__)

# MongoDB Configuration - Use a more reliable connection string
app.config["MONGO_URI"] = os.environ.get("MONGO_URI", "mongodb://localhost:27017/complaints_db?connectTimeoutMS=30000&serverSelectionTimeoutMS=30000")
app.config["SECRET_KEY"] = "complaint_system_secret_key"

# Initialize MongoDB with error handling
try:
    mongo = PyMongo(app)
    # Test the connection
    mongo.db.command('ping')
    print("MongoDB connection successful!")
    db_available = True
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    print("Note: MongoDB might not be running. The app will work with a file-based database for now.")
    mongo = None
    db_available = False

# File-based fallback database
COMPLAINTS_FILE = 'complaints.json'

def load_complaints():
    """Load complaints from file"""
    if os.path.exists(COMPLAINTS_FILE):
        try:
            with open(COMPLAINTS_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_complaints(complaints):
    """Save complaints to file"""
    with open(COMPLAINTS_FILE, 'w') as f:
        json.dump(complaints, f, indent=2)

def get_next_id():
    """Get next ID for file-based storage"""
    complaints = load_complaints()
    if not complaints:
        return "1"
    max_id = max(int(c['_id']) for c in complaints if c['_id'].isdigit())
    return str(max_id + 1)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    """Get all complaints sorted by date (newest first)"""
    if db_available and mongo:
        # Use MongoDB
        complaints = list(mongo.db.complaints.find().sort('date', -1))
        for complaint in complaints:
            complaint['_id'] = str(complaint['_id'])
            complaint['date'] = complaint['date'].strftime('%Y-%m-%d %H:%M:%S')
    else:
        # Use file-based storage
        complaints = load_complaints()
        # Sort by date (newest first)
        complaints.sort(key=lambda x: x['date'], reverse=True)
    return jsonify(complaints)

@app.route('/api/complaints', methods=['POST'])
def submit_complaint():
    """Submit a new complaint"""
    data = request.get_json()
    
    if db_available and mongo:
        # Use MongoDB
        complaint = {
            'name': data['name'],
            'subject': data['subject'],
            'message': data['message'],
            'status': 'Pending',
            'date': datetime.now()
        }
        
        result = mongo.db.complaints.insert_one(complaint)
        complaint['_id'] = str(result.inserted_id)
        complaint['date'] = complaint['date'].strftime('%Y-%m-%d %H:%M:%S')
    else:
        # Use file-based storage
        complaints = load_complaints()
        complaint = {
            '_id': get_next_id(),
            'name': data['name'],
            'subject': data['subject'],
            'message': data['message'],
            'status': 'Pending',
            'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        complaints.append(complaint)
        save_complaints(complaints)
    
    return jsonify({
        'success': True,
        'message': 'Complaint submitted successfully!',
        'complaint': complaint
    })

@app.route('/api/complaints/<complaint_id>', methods=['PUT'])
def update_complaint(complaint_id):
    """Update complaint status"""
    data = request.get_json()
    status = data.get('status', 'Pending')
    
    if db_available and mongo:
        # Use MongoDB - convert string ID back to ObjectId
        try:
            object_id = ObjectId(complaint_id)
        except:
            return jsonify({
                'success': False,
                'message': 'Invalid complaint ID format.'
            }), 400
            
        result = mongo.db.complaints.update_one(
            {'_id': object_id},
            {'$set': {'status': status}}
        )
        
        if result.modified_count > 0:
            return jsonify({
                'success': True,
                'message': 'Complaint status updated successfully!'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Complaint not found or no changes made.'
            }), 404
    else:
        # Use file-based storage
        complaints = load_complaints()
        complaint_found = False
        
        for complaint in complaints:
            if complaint['_id'] == complaint_id:
                complaint['status'] = status
                complaint_found = True
                break
        
        if complaint_found:
            save_complaints(complaints)
            return jsonify({
                'success': True,
                'message': 'Complaint status updated successfully!'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Complaint not found or no changes made.'
            }), 404

@app.route('/api/complaints/<complaint_id>', methods=['DELETE'])
def delete_complaint(complaint_id):
    """Delete a complaint"""
    if db_available and mongo:
        # Use MongoDB - convert string ID back to ObjectId
        try:
            object_id = ObjectId(complaint_id)
        except:
            return jsonify({
                'success': False,
                'message': 'Invalid complaint ID format.'
            }), 400
            
        result = mongo.db.complaints.delete_one({'_id': object_id})
        
        if result.deleted_count > 0:
            return jsonify({
                'success': True,
                'message': 'Complaint deleted successfully!'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Complaint not found.'
            }), 404
    else:
        # Use file-based storage
        complaints = load_complaints()
        complaint_found = False
        
        # Filter out the complaint to delete
        new_complaints = [c for c in complaints if c['_id'] != complaint_id]
        complaint_found = len(new_complaints) < len(complaints)
        
        if complaint_found:
            save_complaints(new_complaints)
            return jsonify({
                'success': True,
                'message': 'Complaint deleted successfully!'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Complaint not found.'
            }), 404

if __name__ == '__main__':
    # Create collection if it doesn't exist (only if MongoDB is available)
    if db_available and mongo:
        if 'complaints' not in mongo.db.list_collection_names():
            mongo.db.create_collection('complaints')
    
    # Automatically open browser when server starts
    webbrowser.open("http://127.0.0.1:5000")
    
    # Run with minimal logging
    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    
    app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False)
