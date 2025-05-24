from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from difflib import SequenceMatcher
import PyPDF2
import os
import requests
import uuid

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the uploads directory exists

# Function to read the text from a PDF file
def read_pdf_content(file_path):
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''.join([page.extract_text() for page in reader.pages if page.extract_text()])
    return text

# Function to calculate similarity percentage
def calculate_similarity(text1, text2):
    return SequenceMatcher(None, text1, text2).ratio() * 100

BASE_URL = 'http://localhost:5001'  # Adjust based on your local setup

# Function to download a file
def download_file(file_url, save_path):
    try:
        # If the URL is relative, prepend the BASE_URL
        if not file_url.startswith('http'):
            file_url = BASE_URL + file_url
        
        response = requests.get(file_url)
        if response.status_code == 200:
            with open(save_path, 'wb') as file:
                file.write(response.content)
        else:
            print(f"Failed to fetch file: {file_url}, Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error downloading file: {e}")
        return None
    return save_path

# Route to serve uploaded files
@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# API route to compare two PDFs
@app.route('/compare-pdfs', methods=['POST'])
def compare_pdfs():
    try:
        # Check if the file URLs are provided in the request
        if 'file1' not in request.json or 'file2' not in request.json:
            return jsonify({"error": "Two file URLs (file1 and file2) must be provided."}), 400

        # Retrieve file URLs from the request
        file1_url = request.json['file1']
        file2_url = request.json['file2']

        # Generate unique local paths to store the downloaded files
        file1_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.pdf")
        file2_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.pdf")

        # Download the files from the URLs and save them locally
        if download_file(file1_url, file1_path) is None or download_file(file2_url, file2_path) is None:
            return jsonify({"error": "Failed to download one or both of the files."}), 400

        # Extract text from the downloaded PDFs
        text1 = read_pdf_content(file1_path)
        text2 = read_pdf_content(file2_path)

        # Calculate similarity
        similarity = calculate_similarity(text1, text2)

        # Return similarity percentage
        return jsonify({
            "plagiarism_percentage": similarity
        })

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
