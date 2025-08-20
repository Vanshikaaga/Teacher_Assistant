from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from pymongo import MongoClient
# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins
client = MongoClient("mongodb://localhost:27017/")
db = client["assignmentManager"]  # Replace with your database name
students_collection = db["students"]

# Load the trained model and scaler
with open('model1_linear_regression.pkl', 'rb') as model_file:
    model = pickle.load(model_file)

with open('scaler1.pkl', 'rb') as scaler_file:
    scaler = pickle.load(scaler_file)

@app.route('/')
def home():
    return "Welcome to the Grade Prediction API!"

# API endpoint for grade prediction
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input data from the request in JSON format
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        student_id = data.get("studentId")
        if not student_id:
            return jsonify({"error": "studentId is required"}), 400

        # Convert input data to a numpy array
        input_features = np.array(data["features"]).reshape(1, -1)  # Ensure it's a 2D array

        # Scale the input features
        input_features_scaled = scaler.transform(input_features)

        # Make prediction
        prediction = model.predict(input_features_scaled)
        predicted_value = float(prediction[0])
        update_result = students_collection.update_one(
            {"enrollmentNumber": student_id},  # Assuming `studentId` is stored as `_id` in MongoDB
            {"$set": {"predicted_final_grade": predicted_value}}
        )

        if update_result.matched_count == 0:
            return jsonify({"error": "Student not found in database"}), 404
        # Return prediction as a JSON response
        return jsonify({
            "prediction": float(prediction[0])
        })

    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5002)
