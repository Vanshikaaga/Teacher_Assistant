# -*- coding: utf-8 -*-
"""Simplified Linear Regression Model for Grade Prediction"""

# Importing libraries
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import pickle  # For saving the model

# Load dataset
df = pd.read_excel("Book1.xlsx")

# Data preprocessing
X = df.drop(['Score'], axis=1)  # Independent variables
y = df['Score']                # Dependent variable

# Splitting data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardizing the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Model training with Linear Regression
model = LinearRegression()
model.fit(X_train_scaled, y_train)

# Save the trained model to a .pkl file
with open('model1_linear_regression.pkl', 'wb') as file:
    pickle.dump(model, file)

# Save the scaler to a .pkl file
with open('scaler.pkl', 'wb') as file:
    pickle.dump(scaler, file)

# Model predictions
y_pred = model.predict(X_test_scaled)

# Evaluation metrics
print("Linear Regression Performance:")
print("Mean Squared Error:", mean_squared_error(y_test, y_pred))
print("Mean Absolute Error:", mean_absolute_error(y_test, y_pred))
print("R2 Score:", r2_score(y_test, y_pred))
