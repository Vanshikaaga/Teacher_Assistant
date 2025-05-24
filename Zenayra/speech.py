from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import google.generativeai as genai
import json
import os
from bson import ObjectId

from werkzeug.utils import secure_filename
import pandas as pd
import firebase_admin
from firebase_admin import credentials, db
app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://faceattendacerealtime-85c07-default-rtdb.firebaseio.com/'
})

# Reference to the Students node in Firebase
students_ref = db.reference("Students")
# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")  # Connect to your MongoDB instance
db = client["assignmentManager"]  # Database name
classes_collection = db["classes"]

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Configure the Google Gemini API
GOOGLE_API_KEY = "AIzaSyA-3WdB-Fks-cv6QeqdjgrwXnu4PGU4s-c"
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')


def add_class_to_db(class_data):
    """Insert class data into the MongoDB collection."""
    try:
        class_id = classes_collection.insert_one(class_data).inserted_id
        return str(class_id)
    except Exception as e:
        print(f"Error inserting class: {e}")
        return None

@app.route('/update_student', methods=['POST'])
def update_student():
    # Get data from the request
    student_id = request.json.get('student_id')
    updates = request.json.get('updates')

    # Validate input
    if not student_id or not updates:
        return jsonify({"error": "Missing student_id or updates"}), 400

    try:
        # Update the specific student's record
        students_ref.child(student_id).update(updates)
        return jsonify({"message": f"Student {student_id} updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/chat', methods=['POST'])
def chat_with_gemini():
    """Handle chatbot interactions (text and voice)."""
    data = request.form  # Capture incoming JSON
    user_input = request.form.get('text', '')  # Extract text or transcribed voice input
    is_voice = request.form.get('is_voice', False)  # Check if the input is from voice
    file_data = request.files.get('file')  # Check for file upload
    assignments = list(db["assignments"].find({})) 
    assignments_info = json.dumps(assignments, default=str) 
    print("User input:", user_input)
    print("Is voice:", is_voice)
    print("File:", file_data)

    if not user_input:
        return jsonify({'error': 'No input text provided'}), 400

    prompt = f"""
    You are a voice assistant. When the user speaks or types, your task is to:
    1. Understand the user's intent and classify it in one of the follows: greeting, create-class,students-submitted,mark-attendance,others,unknown.
    2. If the intent is 'create-class', classify entities into:
       - className: The name of the class.
       - instructorName: The instructor's name.
       - subject: The subject of the class.
    for mark-attendance please repond in json format:
    {{
      "intent": "<classified_intent>",
        "entities": {{
            "Name": "<student_name>",
            "enrollment": "<enrollment>",
    }},"response": "<friendly_response>"}}
    Please respond in this JSON format for create-class intent:
    {{
        "intent": "<classified_intent>",
        "entities": {{
            "className": "<class_name>",
            "instructorName": "<instructor_name>",
            "subject": "<subject>",
             
        }},
        
        "response": "<friendly_response>"
    }}
    for students-submitted Please extract relevant details from the assignments data or respond based on the user's request.The following are details about the available assignments in our system:
    {assignments_info}
    User's request: "{user_input}"
    handle other intents like fetching data from assignments collections which you can handle and write response with line breaks and proper bullets
    """

    try:
        # Send input to the Gemini model
        response = model.generate_content(prompt)
        outline = response.text if hasattr(response, 'text') else str(response)

        # Parse the response JSON
        result = json.loads(outline)
        intent = result.get('intent', 'unknown')
        entities = result.get('entities', {})
        bot_reply = result.get('response', 'I am not sure how to help with that.')
        students = []
        if intent == "create-class":
            # Handle class creation
            class_name = entities.get('className', 'Untitled Class')
            instructor_name = entities.get('instructorName', 'Unknown Instructor')
            subject = entities.get('subject', 'General')
            # students=entities.get('students','none')
            
        
            if file_data and (file_data.filename.endswith('.xlsx') or file_data.filename.endswith('.xls')):
                df = pd.read_excel(file_data)

        # Check if required columns are present
                if 'Name' in df.columns and 'EnrollmentNumber' in df.columns:
    # Convert the DataFrame to a list of dictionaries, without using an index
                    for _, row in df.iterrows():
                        student = {
                            '_id': str(ObjectId()),  # Add a random ObjectId for each student
                            'Name': row['Name'],
                            'EnrollmentNumber': row['EnrollmentNumber']
                        }
                        students.append(student)
                    
                    class_data = {
                    "className": class_name,
                    "instructorName": instructor_name,
                    "subject": subject,
                    "students": students
                     }
                    class_id = add_class_to_db(class_data)
                    if class_id:
                        bot_reply = f"Class created successfully with {len(students)} students added!" 
                        return jsonify({'students': students, 'reply': bot_reply}), 200
                else:
                    bot_reply = "Excel file missing required columns (Name, EnrollmentNumber)."
                    return jsonify({'reply': bot_reply}), 400

      
            print(students)
            class_data = {
                "className": class_name,
                "instructorName": instructor_name,
                "subject": subject,
                "students": students
            }

            # Add the class to the database
            class_id = add_class_to_db(class_data)
            if class_id:
                bot_reply = f"Class '{class_name}' created successfully with ID: {class_id}!"
            else:
                bot_reply = "An error occurred while creating the class."
          
        elif intent == "mark-attendance":
            # Extract student details
            student_name = entities.get('Name')
            enrollment = entities.get('enrollment')

            if not student_name or not enrollment:
                return jsonify({'error': 'Incomplete attendance details provided.'}), 400

            # Update attendance in Firebase
            student_record_ref = students_ref.child(enrollment)
            student_record = students_ref.child(enrollment).get()

            if student_record:
                # Update attendance fields
                new_total_attendance = student_record.get('total_attendence', 0) + 1
                student_record_ref.update({
                    "total_attendence": new_total_attendance
                    
                })
                bot_reply = f"Attendance marked for {student_name} (Enrollment: {enrollment})."
            else:
                bot_reply = f"No record found for Enrollment: {enrollment}."

            return jsonify({'reply': bot_reply}), 200




        # elif intent == "students-submitted":
        #     # Fetch assignments from MongoDB
        #     assignments = list(db["assignments"].find({}, {"_id": 1, "title": 1, "description": 1}))
        #     if assignments:
        #         # Format assignments as dropdown options
        #         dropdown_html = '<form method="POST"><select name="assignmentId">'
        #         for assignment in assignments:
        #             dropdown_html += f'<option value="{str(assignment["_id"])}">{assignment["title"]} - {assignment["description"]}</option>'
        #         dropdown_html += '</select><button type="submit">Submit</button></form>'
        #         replied="Here are the available assignments. Please select one:"
        #         bot_reply = f"Here are the available assignments. Please select one: {dropdown_html}"
        #     else:
        #         bot_reply = "No assignments found in the database."

        #     return jsonify({
        #         'reply': replied,
        #         'intent': intent,
                
        #     })

        return jsonify({
            'reply': bot_reply,
            'intent': intent,
            'entities': entities,
            'students': students,
            'is_voice': is_voice
        })
    except Exception as e:
        print(f"Error querying Gemini: {e}")
        return jsonify({'error': 'Error processing request'}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5003)
