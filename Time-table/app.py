from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import pandas as pd
import os

app = Flask(__name__)
CORS(app)    

# Path to the Excel file
EXCEL_FILE_PATH = "timetable.xlsx"

# Function to extract tables from the PDF
def extract_table_from_pdf(pdf_file):
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if table:
                # Convert the table to a DataFrame
                df = pd.DataFrame(table)
                df.columns = df.iloc[0]  # Set the first row as the header
                df = df[1:]  # Remove the first row
                return df
    return None

# Save the extracted table to an Excel file
def save_table_to_excel(df):
    df.to_excel(EXCEL_FILE_PATH, index=False)

# Read timetable from the Excel file
def read_table_from_excel():
    if os.path.exists(EXCEL_FILE_PATH):
        return pd.read_excel(EXCEL_FILE_PATH)
    else:
        raise FileNotFoundError("Timetable Excel file not found. Please upload a timetable first.")

@app.route('/upload', methods=['POST'])
def upload_timetable():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    pdf_file = request.files['file']

    try:
        # Extract table from the PDF
        df = extract_table_from_pdf(pdf_file)
        if df is None:
            return jsonify({"error": "No table found in the uploaded PDF"}), 400

        # Save the table to Excel
        save_table_to_excel(df)

        return jsonify({"message": "Timetable uploaded and saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to process the file: {str(e)}"}), 500

@app.route('/schedule', methods=['GET'])
def get_schedule():
    # Get the day parameter
    day = request.args.get('day', '').capitalize()

    if not day:
        return jsonify({"error": "Day parameter is required"}), 400

    try:
        # Read the timetable from the Excel file
        df = read_table_from_excel()

        if day not in df.columns:
            return jsonify({"error": f"No schedule found for {day}"}), 404

        # Extract the column for the requested day
        day_schedule = df[["Period", day]].dropna().to_dict(orient="records")

        return jsonify({"day": day, "schedule": day_schedule})
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve schedule: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True,port=5004)
