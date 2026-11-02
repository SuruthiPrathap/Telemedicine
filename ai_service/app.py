from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import numpy as np

app = Flask(__name__)
CORS(app)

# --- Dummy Scikit-Learn Model Setup --- #
# In a real app, you would load a large pre-trained model (e.g., joblib.load('model.pkl'))
# We are training a very basic Naive Bayes text classifier in memory for demonstration.

symptoms_data = [
    "I have a severe headache and nausea",
    "I have been coughing and sneezing with a runny nose",
    "My chest hurts when I breathe deeply",
    "I feel itchy everywhere and have red spots",
    "I am very sleepy, tired and have body aches",
    "My stomach hurts and I have diarrhea",
    "I twisted my ankle, it is swollen and hurts a lot"
]

conditions_labels = [
    "Migraine",
    "Common Cold / Flu",
    "Possible Respiratory Infection",
    "Allergic Reaction",
    "Viral Fever / Fatigue",
    "Food Poisoning / Gastroenteritis",
    "Physical Sprain"
]

recommendations = {
    "Migraine": "Rest in a dark, quiet room. Take over-the-counter pain relievers if appropriate. Consult a doctor if severe.",
    "Common Cold / Flu": "Stay hydrated, rest, and consider warm fluids. Consult a doctor if symptoms persist past a week.",
    "Possible Respiratory Infection": "Please consult a doctor urgently for proper chest examination.",
    "Allergic Reaction": "Take an antihistamine if you have one. If you experience shortness of breath, seek emergency care immediately.",
    "Viral Fever / Fatigue": "Get plenty of rest and drink fluids. Monitor your temperature.",
    "Food Poisoning / Gastroenteritis": "Drink plenty of water/electrolytes to prevent dehydration. Seek help if you cannot keep liquids down.",
    "Physical Sprain": "Apply ICE (Ice, Compression, Elevation). Do not put weight on it. Get an X-ray to rule out fractures."
}

vectorizer = CountVectorizer(stop_words='english')
X = vectorizer.fit_transform(symptoms_data)
clf = MultinomialNB()
clf.fit(X, conditions_labels)
# -------------------------------------- #

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "running"}), 200

@app.route('/predict', methods=['POST'])
def predict_condition():
    data = request.json
    if not data or 'symptoms' not in data:
        return jsonify({"error": "No symptoms provided"}), 400
        
    user_symptoms = data['symptoms']
    
    # Predict using Scikit-Learn model
    X_test = vectorizer.transform([user_symptoms])
    predicted_condition = clf.predict(X_test)[0]
    
    # Calculate dummy confidence score (probabilities)
    probs = clf.predict_proba(X_test)[0]
    max_prob = np.max(probs) * 100
    
    # If the confidence is really low or it doesn't match dictionary well, generic response
    if "pain" in user_symptoms.lower() and max_prob < 20: # Fallback hack for basic inputs
        predicted_condition = "General Pain"
        max_prob = 50.0
        recommendations["General Pain"] = "Observe and take standard pain relief. Consult a doctor if it persists."
    
    response = {
        "condition": predicted_condition,
        "confidence": round(max_prob, 2),
        "recommendation": recommendations.get(predicted_condition, "Consult a doctor for advice."),
        "disclaimer": "DISCLAIMER: This is an AI-powered advisory tool, NOT a medical diagnosis. Please consult a qualified doctor."
    }
    
    return jsonify(response)

if __name__ == '__main__':
    print("Starting AI Module on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001)
