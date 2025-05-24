import streamlit as st
import pandas as pd
import random
import io
import docx2txt
from PyPDF2 import PdfReader
import plotly.express as px
import plotly.graph_objects as go
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests


def read_text_file(file):
    with io.open(file.name, 'r', encoding='utf-8') as f:
        return f.read()

def read_docx_file(file):
    return docx2txt.process(file)

def read_pdf_file(file):
    text = ""
    pdf_reader = PdfReader(file)
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text


def get_text_from_file(uploaded_file):
    if uploaded_file is not None:
        if uploaded_file.type == "text/plain":
            return read_text_file(uploaded_file)
        elif uploaded_file.type == "application/pdf":
            return read_pdf_file(uploaded_file)
        elif uploaded_file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return read_docx_file(uploaded_file)
    return ""


def generate_plagiarism_score(sentence, reference_corpus):
    vectorizer = TfidfVectorizer().fit_transform([sentence] + reference_corpus)
    cosine_sim = cosine_similarity(vectorizer[0:1], vectorizer[1:])
    return round(cosine_sim.max(), 2)  


def get_sentences(text):
    sentences = text.split('. ')
    return [sentence.strip() for sentence in sentences if sentence.strip()]


def display_plagiarism_status(plagiarism_percentage):
    if plagiarism_percentage > 0.3:
        return "Plagiarism Detected", "red"
    elif plagiarism_percentage > 0.1:
        return "May be Plagiarized", "orange"
    else:
        return "No Plagiarism Detected", "green"


def check_plagiarism_with_suggestions(text, reference_corpus):
    sentences = get_sentences(text)
    plagiarism_results = []
    
    for sentence in sentences:
        plagiarism_percentage = generate_plagiarism_score(sentence, reference_corpus)
        
        
        suggestions = get_serp_ai_suggestions(sentence)
        
        plagiarism_results.append({
            'Sentence': sentence,
            'Plagiarism Percentage': plagiarism_percentage,
            'Suggestion': suggestions['suggestion'],
            'Plagiarism Risk': suggestions['risk'],
            'Status': display_plagiarism_status(plagiarism_percentage)[0],
            'Color': display_plagiarism_status(plagiarism_percentage)[1]
        })
    
    return plagiarism_results


def get_serp_ai_suggestions(sentence):
    
    SERP_API_KEY = "7f9c9a289970bc0252573a02f0e44e24b7c3a9478720abfbc23fcba989b21668" 

  
    url = "https://serpapi.com/search"
    params = {
        "q": f"how to avoid plagiarism in the sentence: {sentence}",
        "api_key": SERP_API_KEY
    }

    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        api_data = response.json()
      
        suggestion = api_data.get("suggestion", "No suggestion found.")
        risk = random.choice(["High", "Medium", "Low"])  
    else:
        suggestion = "Could not fetch suggestion."
        risk = "Unknown"

    return {
        "suggestion": suggestion,
        "risk": risk
    }


def plot_enhanced_chart(plagiarism_percentage):
    fig = px.bar(
        x=["Overall Plagiarism"], 
        y=[plagiarism_percentage],
        title='Overall Plagiarism Score',
        labels={"y": "Plagiarism Similarity (%)"},
        color=["Overall Plagiarism"]
    )
    
 
    st.plotly_chart(fig, use_container_width=True)


def plot_pie_chart(plagiarism_percentages):
    labels = ['No Plagiarism', 'Maybe Plagiarized', 'Plagiarism Detected']
    counts = [
        sum([1 for x in plagiarism_percentages if x < 0.1]),
        sum([1 for x in plagiarism_percentages if 0.1 <= x <= 0.3]),
        sum([1 for x in plagiarism_percentages if x > 0.3])
    ]
    
    fig = go.Figure(data=[go.Pie(labels=labels, values=counts, hole=0.3)])
    fig.update_layout(title='Plagiarism Distribution')
    st.plotly_chart(fig, use_container_width=True)


def plot_heatmap(plagiarism_percentages):
    heatmap_data = [[plagiarism_percentages[i], i] for i in range(len(plagiarism_percentages))]
    fig = go.Figure(data=go.Heatmap(
        z=[plagiarism_percentages],
        colorscale='Viridis',
        showscale=True
    ))
    fig.update_layout(title='Plagiarism Heatmap', xaxis_title="Sentence Index", yaxis_title="Plagiarism Score")
    st.plotly_chart(fig, use_container_width=True)


def generate_anti_plag_tips(sentences):
   
    predefined_tips = [
        "1. Paraphrase the sentence by changing both the structure and wording. Use synonyms for key terms.",
        "2. Cite the original source properly to avoid plagiarism, and ensure your citations are accurate.",
        "3. Rework the sentence to present the information in your own unique voice and style.",
        "4. Use plagiarism detection tools to double-check your text before submission."
    ]
    
    tips = []
    for sentence in sentences:
        
        suggestion = random.choice(predefined_tips)
        tips.append(f"Sentence: {sentence}\n- {suggestion}")
    
    return tips


st.set_page_config(page_title='Plagiarism Detection', layout='wide')
st.title('📚 Plagiarism Detector')


st.markdown("""
    <style>
        .title {
            font-size: 50px;
            color: #FF6347;
            font-weight: bold;
            text-align: center;
            padding-top: 20px;
        }
        .description {
            font-size: 18px;
            text-align: center;
            margin-top: 10px;
            color: #555555;
        }
        .stButton>button {
            background-color: #4CAF50;
            color: white;
            font-size: 16px;
            border-radius: 10px;
            padding: 10px;
        }
    </style>
""", unsafe_allow_html=True)

st.markdown('<div class="title">Plagiarism Detection Tool</div>', unsafe_allow_html=True)
st.markdown('<div class="description">Enter your text or upload a file to check for plagiarism and similarities.</div>', unsafe_allow_html=True)

option = st.radio(
    "Select input option:",
    ('Enter text', 'Upload file')
)

if option == 'Enter text':
    text = st.text_area("Enter text here", height=200)
elif option == 'Upload file':
    uploaded_file = st.file_uploader("Upload file (.docx, .pdf, .txt)", type=["docx", "pdf", "txt"])
    if uploaded_file is not None:
        text = get_text_from_file(uploaded_file)
    else:
        text = ""

if st.button('Check for plagiarism'):
    if not text:
        st.write("Please enter some text or upload a file.")
    else:
        st.write("### Checking for plagiarism... This might take a moment.")
        
        
        reference_corpus = [
            "This is a sample document. It contains some generic text.",
            "Artificial Intelligence is transforming the tech industry rapidly.",
            "Machine Learning helps in predictive analysis and decision making."
        ]
        
        plagiarism_results = check_plagiarism_with_suggestions(text, reference_corpus)

        
        df = pd.DataFrame(plagiarism_results)
        df = df.sort_values(by=['Plagiarism Percentage'], ascending=False)

        
        overall_plagiarism_percentage = df['Plagiarism Percentage'].mean()  # Calculate mean plagiarism percentage
        
        st.write(f"### Overall Plagiarism Percentage: {overall_plagiarism_percentage * 100}%")
        display_message, display_color = display_plagiarism_status(overall_plagiarism_percentage)
        st.markdown(f"<p style='color:{display_color}; font-size:20px'>{display_message}</p>", unsafe_allow_html=True)

        
        plot_enhanced_chart(overall_plagiarism_percentage)

        
        st.write("### Detailed Plagiarism Results")
        st.dataframe(df)

        
        st.write("### Anti-Plagiarism Tips")
        sentences = df['Sentence'].tolist()
        tips = generate_anti_plag_tips(sentences)
        for tip in tips:
            st.write(tip)

        
        plot_pie_chart(df['Plagiarism Percentage'])

        
        plot_heatmap(df['Plagiarism Percentage'])