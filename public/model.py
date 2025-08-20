import numpy as np
import cv2
import face_recognition
from tqdm import tqdm
from sklearn.datasets import fetch_lfw_people
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.svm import SVC
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

# === Step 1: Load the LFW dataset ===
print(" Fetching LFW Dataset...")
lfw = fetch_lfw_people(min_faces_per_person=50, resize=1.0)
X_images = lfw.images  # grayscale images
y = lfw.target
target_names = lfw.target_names
print(" Samples:", len(X_images), "| Image shape:", X_images[0].shape)

# === Step 2: Convert grayscale to RGB and extract embeddings ===
def get_face_embedding(gray_img):
    gray_img = (gray_img * 255).astype(np.uint8)
    rgb_img = cv2.cvtColor(gray_img, cv2.COLOR_GRAY2RGB)

    # Use CNN face detector
    face_locations = face_recognition.face_locations(rgb_img, model='cnn')
    if len(face_locations) == 0:
        return None
    encoding = face_recognition.face_encodings(rgb_img, known_face_locations=face_locations)
    if len(encoding) == 0:
        return None
    return encoding[0]

print(" Extracting face embeddings...")
embeddings = []
labels = []
for i in tqdm(range(len(X_images))):
    embedding = get_face_embedding(X_images[i])
    if embedding is not None:
        embeddings.append(embedding)
        labels.append(y[i])

print(f" Total embeddings extracted: {len(embeddings)}")

# === Step 3: Split into train/test sets ===
X_train, X_test, y_train, y_test = train_test_split(
    embeddings, labels, stratify=labels, test_size=0.3, random_state=42
)

# === Step 4: Normalize features ===
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# === Step 5 (Optional): PCA to reduce dimensionality ===
print(" Applying PCA...")
pca = PCA(n_components=0.95, whiten=True)
X_train = pca.fit_transform(X_train)
X_test = pca.transform(X_test)
print(f" PCA reduced dimensions to: {X_train.shape[1]}")

# === Step 6: Train SVM with GridSearch ===
print(" Tuning and training SVM...")
param_grid = {
    'C': [1, 10],
    'gamma': [0.001, 0.0001],
    'kernel': ['rbf']
}
svm = SVC(probability=True, class_weight='balanced')
grid = GridSearchCV(svm, param_grid, cv=3, scoring='accuracy', verbose=1)
grid.fit(X_train, y_train)

print(" Best Params:", grid.best_params_)
best_svm = grid.best_estimator_

# === Step 7: Evaluate ===
y_pred = best_svm.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(" Final SVM Accuracy:", round(accuracy * 100, 2), "%")
print("\n Classification Report:")
print(classification_report(y_test, y_pred, target_names=target_names))
# === Save the model and prediction results ===
import joblib
import pandas as pd

# Save the model, scaler, and PCA
joblib.dump(best_svm, 'svm_face_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(pca, 'pca.pkl')
print("  Saved model, scaler, and PCA to disk.")

# Save predictions
predicted_names = [target_names[i] for i in y_pred]
true_names = [target_names[i] for i in y_test]

df_results = pd.DataFrame({
    'True Label': true_names,
    'Predicted Label': predicted_names
})

df_results.to_csv("face_recognition_predictions.csv", index=False)
print(" Saved predictions to face_recognition_predictions.csv")
