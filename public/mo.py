import numpy as np
import cv2
import joblib
import random
import face_recognition
import matplotlib.pyplot as plt
from sklearn.datasets import fetch_lfw_people

# === Load saved components ===
svm_model = joblib.load('svm_face_model.pkl')
scaler = joblib.load('scaler.pkl')
pca = joblib.load('pca.pkl')

# === Load dataset ===
lfw = fetch_lfw_people(min_faces_per_person=50, resize=1.0)
X_images = lfw.images
y = lfw.target
target_names = lfw.target_names

# === Make 5 random predictions ===
count = 0
attempts = 0
max_attempts = 20  # just in case some images fail embedding

while count < 5 and attempts < max_attempts:
    idx = random.randint(0, len(X_images) - 1)
    gray_img = (X_images[idx] * 255).astype(np.uint8)
    rgb_img = cv2.cvtColor(gray_img, cv2.COLOR_GRAY2RGB)
    true_name = target_names[y[idx]]

    # Extract face embedding
    face_locations = face_recognition.face_locations(rgb_img, model='cnn')
    if not face_locations:
        attempts += 1
        continue

    encodings = face_recognition.face_encodings(rgb_img, known_face_locations=face_locations)
    if not encodings:
        attempts += 1
        continue

    embedding = encodings[0].reshape(1, -1)
    embedding_scaled = scaler.transform(embedding)
    embedding_pca = pca.transform(embedding_scaled)

    pred_label = svm_model.predict(embedding_pca)[0]
    pred_name = target_names[pred_label]
    probs = svm_model.predict_proba(embedding_pca)[0]
    confidence = max(probs) * 100

    print(f"\n Prediction {count + 1}:")
    print(f"    True     : {true_name}")
    print(f"    Predicted: {pred_name} ({confidence:.2f}%)")

    # Optional: Show image with label
    plt.imshow(gray_img, cmap='gray')
    plt.title(f"True: {true_name} | Pred: {pred_name}")
    plt.axis('off')
    plt.show()

    count += 1
    attempts += 1
