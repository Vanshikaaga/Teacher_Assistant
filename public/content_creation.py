# from flask import Flask, request, jsonify,send_from_directory
# import google.generativeai as genai
# from dotenv import load_dotenv
# import unicodedata
# from fpdf import FPDF
# from difflib import SequenceMatcher
# import PyPDF2
# import os
# import requests
# import uuid
# import os
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)
# # Load environment variables
# load_dotenv()
# api_key = ""
# genai.configure(api_key=api_key)

# # Initialize global variables
# model = genai.GenerativeModel('gemini-pro')


# def generate_pdf(content, filename):
#     """Normalize content and save it as a PDF."""
#     content = unicodedata.normalize('NFKD', content).encode('ascii', 'ignore').decode('ascii')
#     pdf = FPDF()
#     pdf.add_page()
#     pdf.set_font('Arial', 'B', 12)
#     pdf.multi_cell(0, 10, content)
#     pdf.output(filename, 'F')
#     return filename


# @app.route('/generate-outline', methods=['POST'])
# def generate_outline():
#     """Generate course outline based on user inputs."""
#     data = request.json
#     course_name = data.get("course_name")
#     target_audience_edu_level = data.get("target_audience_edu_level")
#     difficulty_level = data.get("difficulty_level")
#     num_modules = data.get("num_modules")
#     course_duration = data.get("course_duration")
#     course_credit = data.get("course_credit")

#     if not course_name or not target_audience_edu_level or not difficulty_level or not num_modules:
#         return jsonify({"error": "Missing required fields"}), 400

#     tabler_prompt = f"""
#     You are Prompter, the world's best Prompt Engineer. I am using another GenAI tool, Tabler,
#     that helps generate a course outline for trainers and professionals for automated course content generation.create course outline with module name.
#     Strictly use the following inputs to create a prompt for Tabler:
#     1) Course Name: {course_name}
#     2) Target Audience Edu Level: {target_audience_edu_level}
#     3) Course Difficulty Level: {difficulty_level}
#     4) No. of Modules: {num_modules}
#     5) Course Duration: {course_duration}
#     6) Course Credit: {course_credit}
#     Ensure that the prompt is comprehensive and integrates these inputs.
#     """
#     try:
#         response = model.generate_content(tabler_prompt)
#         outline = response.text if hasattr(response, 'text') else str(response)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     return jsonify({"outline": outline})


# @app.route('/refine-content', methods=['POST'])
# def refine_content():
#     """Refine generated content based on user feedback."""
#     data = request.json
#     content = data.get("content")
#     feedback = data.get("feedback")
#     print("Received data:", data)
#     if not content or not feedback:
#         return jsonify({"error": "Content and feedback are required"}), 400

#     refinement_prompt = f"""
#     Based on the following content:
#     {content}

#     Apply the following modifications:
#     {feedback}
#     """
#     try:
#         print("Refinement prompt:", refinement_prompt)

#         response = model.generate_content(refinement_prompt)
#         refined_content = response.text if hasattr(response, 'text') else str(response)
#     except Exception as e:
#         print("Error during refinement:", str(e))
#         return jsonify({"error": str(e)}), 500
#     print(print("Response data:", refined_content))
#     return jsonify({"refined_content": refined_content})


# @app.route('/generate-course-content', methods=['POST'])
# def generate_course_content():
#     """Generate course content based on refined outline."""
#     data = request.json
#     refined_outline = data.get("refined_outline")

#     if not refined_outline:
#         return jsonify({"error": "Refined outline is required"}), 400

#     dictator_prompt = f"""
#     I have provided you with the following refined course outline:
#     {refined_outline}

#     Your task is to generate a comprehensive and learner-friendly course content for each module, following Bloom's Taxonomy.
#     The content should include introductions, key concepts, real-world applications, interactive elements, and be well-structured for online platforms.
#     """
#     try:
#         response = model.generate_content(dictator_prompt)
#         course_content = response.text if hasattr(response, 'text') else str(response)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     return jsonify({"course_content": course_content})


# @app.route('/generate-quiz', methods=['POST'])
# def generate_quiz():
#     """Generate quiz questions based on course content."""
#     data = request.json
#     course_content = data.get("course_content")

#     if not course_content:
#         return jsonify({"error": "Course content is required"}), 400

#     quiz_prompt = f"""
#     Based on the course content:
#     {course_content}

#     Generate quiz questions for each module with answers. Ensure the questions test different cognitive levels from Bloom's Taxonomy.
#     """
#     try:
#         response = model.generate_content(quiz_prompt)
#         quiz_content = response.text if hasattr(response, 'text') else str(response)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     return jsonify({"quiz_content": quiz_content})


# @app.route('/save-pdf', methods=['POST'])
# def save_pdf():
#     """Save content as a PDF."""
#     data = request.json
#     content = data.get("content")
#     filename = data.get("filename", "output.pdf")

#     if not content:
#         return jsonify({"error": "Content is required"}), 400

#     try:
#         file_path = generate_pdf(content, filename)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     return jsonify({"message": f"PDF saved as {file_path}"})

# if __name__ == '__main__':
#     app.run(debug=True,port=5001)

# UPLOAD_FOLDER = 'uploads'
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the uploads directory exists

# # Function to read the text from a PDF file
# def read_pdf_content(file_path):
#     text = ""
#     with open(file_path, 'rb') as file:
#         reader = PyPDF2.PdfReader(file)
#         text = ''.join([page.extract_text() for page in reader.pages if page.extract_text()])
#     return text

# # Function to calculate similarity percentage
# def calculate_similarity(text1, text2):
#     return SequenceMatcher(None, text1, text2).ratio() * 100

# BASE_URL = 'http://localhost:5001'  # Adjust based on your local setup

# # Function to download a file
# def download_file(file_url, save_path):
#     try:
#         # If the URL is relative, prepend the BASE_URL
#         if not file_url.startswith('http'):
#             file_url = BASE_URL + file_url
        
#         response = requests.get(file_url)
#         if response.status_code == 200:
#             with open(save_path, 'wb') as file:
#                 file.write(response.content)
#         else:
#             print(f"Failed to fetch file: {file_url}, Status code: {response.status_code}")
#             return None
#     except Exception as e:
#         print(f"Error downloading file: {e}")
#         return None
#     return save_path

# # Route to serve uploaded files
# @app.route('/uploads/<filename>')
# def serve_uploaded_file(filename):
#     return send_from_directory(UPLOAD_FOLDER, filename)

# # API route to compare two PDFs
# @app.route('/compare-pdfs', methods=['POST'])
# def compare_pdfs():
#     try:
#         # Check if the file URLs are provided in the request
#         if 'file1' not in request.json or 'file2' not in request.json:
#             return jsonify({"error": "Two file URLs (file1 and file2) must be provided."}), 400

#         # Retrieve file URLs from the request
#         file1_url = request.json['file1']
#         file2_url = request.json['file2']

#         # Generate unique local paths to store the downloaded files
#         file1_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.pdf")
#         file2_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.pdf")

#         # Download the files from the URLs and save them locally
#         if download_file(file1_url, file1_path) is None or download_file(file2_url, file2_path) is None:
#             return jsonify({"error": "Failed to download one or both of the files."}), 400

#         # Extract text from the downloaded PDFs
#         text1 = read_pdf_content(file1_path)
#         text2 = read_pdf_content(file2_path)

#         # Calculate similarity
#         similarity = calculate_similarity(text1, text2)

#         # Return similarity percentage
#         return jsonify({
#             "plagiarism_percentage": similarity
#         })

#     except Exception as e:
#         return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500



# if __name__ == '__main__':
#     app.run(debug=True,port=5001)
from flask import Flask, request, jsonify, send_from_directory
from google import genai
from google.genai import types
from dotenv import load_dotenv
import unicodedata
import re
from fpdf import FPDF
from flask_cors import CORS
from difflib import SequenceMatcher
from pymongo import MongoClient
import PyPDF2
import os
import requests
import uuid
app = Flask(__name__)
CORS(app)
# Load environment variables
load_dotenv()


clients = genai.Client(api_key='AIzaSyBgrEBRQ9uv43QTMrvpwcPl9h1Z3ZTTq-o')

# Initialize global variables


client = MongoClient("mongodb://localhost:27017/")
db = client["assignmentManager"]  # Replace with your database name
students_collection = db["students"]
def generate_pdf(content, filename):
    """Normalize content and save it as a PDF."""
    content = unicodedata.normalize('NFKD', content).encode('ascii', 'ignore').decode('ascii')
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 12)
    pdf.multi_cell(0, 10, content)
    pdf.output(filename, 'F')
    return filename


@app.route('/generate-outline', methods=['POST'])
def generate_outline():
    """Generate course outline based on user inputs."""
    data = request.json
    course_name = data.get("course_name")
    target_audience_edu_level = data.get("target_audience_edu_level")
    difficulty_level = data.get("difficulty_level")
    num_modules = data.get("num_modules")
    course_duration = data.get("course_duration")
    course_credit = data.get("course_credit")

    if not course_name or not target_audience_edu_level or not difficulty_level or not num_modules:
        return jsonify({"error": "Missing required fields"}), 400

    tabler_prompt = f"""
    You are Prompter, the world's best Prompt Engineer. I am using another GenAI tool, Tabler,
    that helps generate a course outline for trainers and professionals for automated course content generation.create course outline with only module name.
    Strictly use the following inputs to create a prompt for Tabler:
    1) Course Name: {course_name}
    2) Target Audience Edu Level: {target_audience_edu_level}
    3) Course Difficulty Level: {difficulty_level}
    4) No. of Modules: {num_modules}
    5) Course Duration: {course_duration}
    6) Course Credit: {course_credit}
    Ensure that the prompt is comprehensive and integrates these inputs and dont add any headings in bold.

    """
    try:
        response = clients.models.generate_content( model='gemini-2.0-flash-001', contents=tabler_prompt)
        outline = response.text if hasattr(response, 'text') else str(response)
        outline = re.sub(r"^```json\s*|\s*```$", "", outline.strip(), flags=re.MULTILINE).strip()
        print(outline)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"outline": outline})


@app.route('/refine-content', methods=['POST'])
def refine_content():
    """Refine generated content based on user feedback."""
    data = request.json
    content = data.get("content")
    feedback = data.get("feedback")
    print("Received data:", data)
    if not content or not feedback:
        return jsonify({"error": "Content and feedback are required"}), 400

    refinement_prompt = f"""
    Based on the following content:
    {content}

    Apply the following modifications:
    {feedback}
    """
    try:
        print("Refinement prompt:", refinement_prompt)
        response = clients.models.generate_content( model='gemini-2.0-flash-001', contents=refinement_prompt)
        outline = response.text if hasattr(response, 'text') else str(response)
        refined_content = re.sub(r"^```json\s*|\s*```$", "", outline.strip(), flags=re.MULTILINE).strip()
        
    except Exception as e:
        print("Error during refinement:", str(e))
        return jsonify({"error": str(e)}), 500
    print(print("Response data:", refined_content))
    return jsonify({"refined_content": refined_content})


@app.route('/generate-course-content', methods=['POST'])
def generate_course_content():
    """Generate course content based on refined outline."""
    data = request.json
    refined_outline = data.get("refined_outline")

    if not refined_outline:
        return jsonify({"error": "Refined outline is required"}), 400

    dictator_prompt = f"""
    I have provided you with the following refined course outline:
    {refined_outline}

    Your task is to generate a comprehensive and learner-friendly course content for each module, following Bloom's Taxonomy.
    The content should include introductions, key concepts, real-world applications, interactive elements, and be well-structured for online platforms.
    dont add any headings in bold.dont mention bloom's taxonomy word in prompt
    """
    try:
        response = clients.models.generate_content( model='gemini-2.0-flash-001', contents=dictator_prompt)
        outline = response.text if hasattr(response, 'text') else str(response)
        course_content = re.sub(r"^```json\s*|\s*```$", "", outline.strip(), flags=re.MULTILINE).strip()
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"course_content": course_content})


@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    """Generate quiz questions based on course content."""
    data = request.json
    course_content = data.get("course_content")

    if not course_content:
        return jsonify({"error": "Course content is required"}), 400

    quiz_prompt = f"""
    Based on the course content:
    {course_content}

    Generate quiz questions for each module with answers. Ensure the questions test different cognitive levels from Bloom's Taxonomy.dont mention bloom's taxonomy word in prompt and add numerical questions also.
    """
    try:
        response = clients.models.generate_content( model='gemini-2.0-flash-001', contents=quiz_prompt)
        outline = response.text if hasattr(response, 'text') else str(response)
        quiz_content = re.sub(r"^```json\s*|\s*```$", "", outline.strip(), flags=re.MULTILINE).strip()
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"quiz_content": quiz_content})


@app.route('/save-pdf', methods=['POST'])
def save_pdf():
    """Save content as a PDF."""
    data = request.json
    content = data.get("content")
    filename = data.get("filename", "output.pdf")

    if not content:
        return jsonify({"error": "Content is required"}), 400

    try:
        file_path = generate_pdf(content, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": f"PDF saved as {file_path}"})

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
        studentId= request.json['studentId']
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
        student_document = students_collection.find_one({"enrollmentNumber": studentId})
        previous_similarity = student_document.get("answer", 0)
        updated_similarity = (previous_similarity + similarity) / 2
        update_result = students_collection.update_one(
            {"enrollmentNumber": studentId},  # Assuming `studentId` is stored as `_id` in MongoDB
            {"$set": {"answer": updated_similarity}}
        )
        # Return similarity percentage
        return jsonify({
            "plagiarism_percentage": similarity
        })

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True,port=5001)
