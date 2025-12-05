"""
Unified ML Service for ResQ Connect
Integrates Text, Image, and Audio disaster classification models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
import json
import logging
from prediction_tracker import PredictionTracker

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class MLService:
    def __init__(self):
        self.text_model = None
        self.text_vectorizer = None
        self.image_model = None
        self.image_class_names = None
        self.audio_model = None
        self.audio_preprocessor = None
        self.models_loaded = False
        
    def load_models(self):
        """Load all trained models"""
        try:
            # Text Model
            try:
                import joblib
                self.text_model = joblib.load('Text_Disaster_Prediction/disaster_model_FINAL.pkl')
                self.text_vectorizer = joblib.load('Text_Disaster_Prediction/vectorizer_FINAL.pkl')
                logger.info("✓ Text model loaded successfully")
            except Exception as e:
                logger.warning(f"Text model not loaded: {e}")
            
            # Image Model
            try:
                from tensorflow import keras
                self.image_model = keras.models.load_model('nischal major project/disaster_mobilenet.h5')
                with open('nischal major project/class_names.json', 'r') as f:
                    self.image_class_names = json.load(f)
                logger.info("✓ Image model loaded successfully")
            except Exception as e:
                logger.warning(f"Image model not loaded: {e}")
            
            # Audio Model
            try:
                import tensorflow as tf
                self.audio_model = tf.keras.models.load_model('saved_models/cnn_model.h5')
                from audio_preprocessor import AudioPreprocessor
                self.audio_preprocessor = AudioPreprocessor()
                self.audio_preprocessor.load_preprocessor('saved_models/label_encoder.pkl')
                logger.info("✓ Audio model loaded successfully")
            except Exception as e:
                logger.warning(f"Audio model not loaded: {e}")
            
            self.models_loaded = True
            logger.info("ML Service initialized")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.models_loaded = False
    
    def predict_text(self, text):
        """Predict disaster type from text"""
        if not self.text_model or not self.text_vectorizer:
            return self._fallback_text_prediction(text)
        
        try:
            # Enhanced keyword detection
            text_lower = text.lower().strip()
            
            keywords = {
                'flood': ['submerged', 'underwater', 'flooded', 'flood', 'water', 'river', 'rain', 'overflow'],
                'earthquake': ['building', 'collapse', 'crack', 'shake', 'tremor', 'seismic', 'quake'],
                'fire': ['smoke', 'burn', 'flame', 'fire', 'blaze', 'wildfire'],
                'hurricane': ['wind', 'storm', 'hurricane', 'cyclone', 'typhoon'],
                'landslide': ['slide', 'mud', 'rock', 'slope', 'debris', 'avalanche'],
                'tsunami': ['wave', 'tsunami', 'sea', 'ocean', 'coastal'],
                'accident': ['crash', 'collision', 'accident', 'vehicle', 'train']
            }
            
            # Check for strong keyword matches
            best_match = None
            max_matches = 0
            
            for disaster, words in keywords.items():
                matches = sum(1 for word in words if word in text_lower)
                if matches > max_matches:
                    max_matches = matches
                    best_match = disaster
            
            # Use keyword match if strong
            if max_matches >= 2:
                danger_score = min(95, 70 + (max_matches * 5))
                return {
                    'disaster_type': best_match.title(),
                    'danger_score': danger_score,
                    'confidence': 0.90,
                    'tags': [best_match, 'urgent'] if danger_score > 80 else [best_match]
                }
            
            # Use ML model
            text_vec = self.text_vectorizer.transform([text])
            prediction = self.text_model.predict(text_vec)[0]
            probability = self.text_model.predict_proba(text_vec)[0].max()
            
            # Calculate danger score based on disaster type and confidence
            danger_score = int(probability * 100)
            if prediction.lower() in ['fire', 'earthquake', 'tsunami', 'flood']:
                danger_score = min(95, danger_score + 15)
            
            return {
                'disaster_type': prediction.title(),
                'danger_score': danger_score,
                'confidence': float(probability),
                'tags': [prediction.lower(), 'ml_classified']
            }
            
        except Exception as e:
            logger.error(f"Text prediction error: {e}")
            return self._fallback_text_prediction(text)
    
    def predict_image(self, image_path):
        """Predict disaster type from image"""
        if not self.image_model:
            return {'disaster_type': 'Unknown', 'danger_score': 70, 'confidence': 0.5, 'tags': ['image', 'unclassified']}
        
        try:
            from tensorflow.keras.preprocessing import image
            from PIL import Image
            
            img = Image.open(image_path).convert('RGB')
            img = img.resize((224, 224))
            img_array = image.img_to_array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            
            predictions = self.image_model.predict(img_array, verbose=0)[0]
            predicted_idx = np.argmax(predictions)
            predicted_class = self.image_class_names[predicted_idx]
            confidence = float(predictions[predicted_idx])
            
            # Calculate danger score
            danger_score = int(confidence * 100)
            if predicted_class.lower() in ['wildfire', 'earthquake', 'tsunami', 'flood']:
                danger_score = min(95, danger_score + 10)
            
            return {
                'disaster_type': predicted_class.title(),
                'danger_score': danger_score,
                'confidence': confidence,
                'tags': ['image', predicted_class.lower()]
            }
            
        except Exception as e:
            logger.error(f"Image prediction error: {e}")
            return {'disaster_type': 'Unknown', 'danger_score': 70, 'confidence': 0.5, 'tags': ['image', 'error']}
    
    def predict_audio(self, audio_path):
        """Predict disaster type from audio"""
        if not self.audio_model or not self.audio_preprocessor:
            return {'disaster_type': 'Unknown', 'danger_score': 75, 'confidence': 0.5, 'tags': ['audio', 'unclassified']}
        
        try:
            import joblib
            
            # Extract features
            features = self.audio_preprocessor.extract_features(audio_path)
            if features is None:
                raise Exception("Feature extraction failed")
            
            # Prepare feature vector
            feature_vector = []
            feature_vector.extend(features['mfcc_mean'])
            feature_vector.extend(features['mfcc_std'])
            feature_vector.append(features['spectral_centroid_mean'])
            feature_vector.append(features['spectral_centroid_std'])
            feature_vector.append(features['spectral_rolloff_mean'])
            feature_vector.append(features['spectral_rolloff_std'])
            feature_vector.append(features['zcr_mean'])
            feature_vector.append(features['zcr_std'])
            feature_vector.extend(features['chroma_mean'])
            feature_vector.extend(features['chroma_std'])
            
            # Load scaler and predict
            scaler = joblib.load('saved_models/scaler.pkl')
            traditional_features = scaler.transform([feature_vector])
            
            mel_spec = features['mel_spec']
            mel_features = mel_spec.reshape(1, mel_spec.shape[0], mel_spec.shape[1], 1)
            
            prediction = self.audio_model.predict(mel_features, verbose=0)
            predicted_class = np.argmax(prediction, axis=1)[0]
            confidence = float(np.max(prediction))
            
            class_name = self.audio_preprocessor.label_encoder.inverse_transform([predicted_class])[0]
            
            danger_score = int(confidence * 100)
            if class_name.lower() in ['explosion', 'fire', 'earthquake']:
                danger_score = min(95, danger_score + 15)
            
            return {
                'disaster_type': class_name.title(),
                'danger_score': danger_score,
                'confidence': confidence,
                'tags': ['audio', class_name.lower()]
            }
            
        except Exception as e:
            logger.error(f"Audio prediction error: {e}")
            return {'disaster_type': 'Unknown', 'danger_score': 75, 'confidence': 0.5, 'tags': ['audio', 'error']}
    
    def _fallback_text_prediction(self, text):
        """Fallback prediction when model is not loaded"""
        text_lower = text.lower()
        
        # Simple keyword-based classification
        if any(word in text_lower for word in ['fire', 'burn', 'smoke', 'flame']):
            return {'disaster_type': 'Fire', 'danger_score': 85, 'confidence': 0.75, 'tags': ['fire', 'keyword']}
        elif any(word in text_lower for word in ['flood', 'water', 'submerged', 'underwater']):
            return {'disaster_type': 'Flood', 'danger_score': 90, 'confidence': 0.80, 'tags': ['flood', 'keyword']}
        elif any(word in text_lower for word in ['earthquake', 'shake', 'tremor', 'collapse']):
            return {'disaster_type': 'Earthquake', 'danger_score': 95, 'confidence': 0.85, 'tags': ['earthquake', 'keyword']}
        elif any(word in text_lower for word in ['accident', 'crash', 'collision']):
            return {'disaster_type': 'Accident', 'danger_score': 70, 'confidence': 0.70, 'tags': ['accident', 'keyword']}
        else:
            return {'disaster_type': 'Emergency', 'danger_score': 75, 'confidence': 0.60, 'tags': ['general', 'keyword']}

# Initialize service
ml_service = MLService()
ml_service.load_models()

# Initialize prediction tracker
tracker = PredictionTracker()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': ml_service.models_loaded,
        'text_model': ml_service.text_model is not None,
        'image_model': ml_service.image_model is not None,
        'audio_model': ml_service.audio_model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Unified prediction endpoint"""
    try:
        content_type = request.form.get('type', 'text')
        
        if content_type == 'text':
            text = request.form.get('text', '')
            if not text:
                return jsonify({'error': 'No text provided'}), 400
            
            result = ml_service.predict_text(text)
            
            # Log prediction
            tracker.log_prediction('text', result, text)
            
            return jsonify(result)
        
        elif content_type == 'image':
            if 'file' not in request.files:
                return jsonify({'error': 'No image file provided'}), 400
            
            file = request.files['file']
            temp_path = 'temp_image.jpg'
            file.save(temp_path)
            
            result = ml_service.predict_image(temp_path)
            
            # Log prediction
            tracker.log_prediction('image', result, f'Image: {file.filename}')
            
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return jsonify(result)
        
        elif content_type == 'audio':
            if 'file' not in request.files:
                return jsonify({'error': 'No audio file provided'}), 400
            
            file = request.files['file']
            temp_path = 'temp_audio.wav'
            file.save(temp_path)
            
            result = ml_service.predict_audio(temp_path)
            
            # Log prediction
            tracker.log_prediction('audio', result, f'Audio: {file.filename}')
            
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return jsonify(result)
        
        else:
            return jsonify({'error': 'Invalid content type'}), 400
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_statistics():
    """Get prediction statistics"""
    try:
        days = request.args.get('days', 7, type=int)
        stats = tracker.get_statistics(days)
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Stats error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/recent', methods=['GET'])
def get_recent():
    """Get recent predictions"""
    try:
        limit = request.args.get('limit', 50, type=int)
        predictions = tracker.get_recent_predictions(limit)
        return jsonify({'predictions': predictions})
    except Exception as e:
        logger.error(f"Recent predictions error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/hourly', methods=['GET'])
def get_hourly():
    """Get hourly statistics"""
    try:
        hours = request.args.get('hours', 24, type=int)
        stats = tracker.get_hourly_stats(hours)
        return jsonify({'hourly_stats': stats})
    except Exception as e:
        logger.error(f"Hourly stats error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7004))
    app.run(host='0.0.0.0', port=port, debug=False)
