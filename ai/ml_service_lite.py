"""
Lightweight ML Service for ResQ Connect
Works without heavy ML dependencies - uses intelligent keyword-based classification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class LightweightMLService:
    def __init__(self):
        # Comprehensive disaster keywords with severity weights
        self.disaster_patterns = {
            'flood': {
                'keywords': ['flood', 'flooded', 'submerged', 'underwater', 'water', 'river overflow', 
                            'inundated', 'waterlogged', 'drowning', 'dam burst', 'heavy rain'],
                'base_score': 85,
                'urgent_keywords': ['submerged', 'drowning', 'underwater', 'dam burst']
            },
            'fire': {
                'keywords': ['fire', 'burn', 'burning', 'smoke', 'flame', 'blaze', 'wildfire', 
                            'inferno', 'combustion', 'explosion'],
                'base_score': 90,
                'urgent_keywords': ['explosion', 'wildfire', 'trapped', 'burning']
            },
            'earthquake': {
                'keywords': ['earthquake', 'quake', 'tremor', 'shake', 'shaking', 'building collapse', 
                            'crack', 'seismic', 'aftershock', 'rubble'],
                'base_score': 95,
                'urgent_keywords': ['collapse', 'trapped', 'rubble', 'casualties']
            },
            'landslide': {
                'keywords': ['landslide', 'mudslide', 'rockfall', 'avalanche', 'slope failure', 
                            'debris', 'mud', 'rock slide'],
                'base_score': 80,
                'urgent_keywords': ['buried', 'trapped', 'avalanche']
            },
            'tsunami': {
                'keywords': ['tsunami', 'tidal wave', 'sea wave', 'ocean surge', 'coastal flooding'],
                'base_score': 95,
                'urgent_keywords': ['tsunami', 'tidal wave']
            },
            'cyclone': {
                'keywords': ['cyclone', 'hurricane', 'typhoon', 'storm', 'tornado', 'wind', 
                            'tempest', 'gale'],
                'base_score': 85,
                'urgent_keywords': ['cyclone', 'hurricane', 'tornado']
            },
            'accident': {
                'keywords': ['accident', 'crash', 'collision', 'vehicle', 'car', 'train', 
                            'derailment', 'wreck', 'injured'],
                'base_score': 70,
                'urgent_keywords': ['casualties', 'injured', 'trapped', 'explosion']
            },
            'medical_emergency': {
                'keywords': ['medical', 'ambulance', 'heart attack', 'unconscious', 'bleeding', 
                            'injury', 'sick', 'emergency'],
                'base_score': 75,
                'urgent_keywords': ['unconscious', 'bleeding', 'heart attack']
            },
            'chemical': {
                'keywords': ['gas leak', 'chemical', 'toxic', 'poison', 'fumes', 'radiation'],
                'base_score': 88,
                'urgent_keywords': ['gas leak', 'toxic', 'radiation']
            }
        }
        
        # Urgency modifiers
        self.urgency_keywords = ['urgent', 'emergency', 'help', 'sos', 'immediate', 'critical', 
                                'dying', 'trapped', 'casualties', 'dead', 'severe']
        
        logger.info("✓ Lightweight ML Service initialized")
    
    def predict_text(self, text):
        """Predict disaster type from text using intelligent keyword matching"""
        text_lower = text.lower().strip()
        
        # Find matching disasters
        matches = {}
        for disaster_type, data in self.disaster_patterns.items():
            score = 0
            keyword_matches = 0
            urgent_matches = 0
            
            # Count keyword matches
            for keyword in data['keywords']:
                if keyword in text_lower:
                    keyword_matches += 1
                    score += 10
            
            # Count urgent keyword matches
            for urgent_kw in data.get('urgent_keywords', []):
                if urgent_kw in text_lower:
                    urgent_matches += 1
                    score += 20
            
            if keyword_matches > 0:
                matches[disaster_type] = {
                    'score': score,
                    'keyword_matches': keyword_matches,
                    'urgent_matches': urgent_matches,
                    'base_score': data['base_score']
                }
        
        # Determine best match
        if not matches:
            # No specific disaster detected - general emergency
            urgency_count = sum(1 for kw in self.urgency_keywords if kw in text_lower)
            danger_score = min(95, 60 + (urgency_count * 10))
            
            return {
                'disaster_type': 'Emergency',
                'danger_score': danger_score,
                'confidence': 0.65,
                'tags': ['general', 'unclassified']
            }
        
        # Get disaster with highest score
        best_disaster = max(matches.items(), key=lambda x: x[1]['score'])
        disaster_type = best_disaster[0]
        match_data = best_disaster[1]
        
        # Calculate final danger score
        danger_score = match_data['base_score']
        
        # Boost for multiple keyword matches
        if match_data['keyword_matches'] >= 3:
            danger_score = min(95, danger_score + 5)
        
        # Boost for urgent keywords
        if match_data['urgent_matches'] > 0:
            danger_score = min(98, danger_score + (match_data['urgent_matches'] * 5))
        
        # Check for general urgency keywords
        urgency_count = sum(1 for kw in self.urgency_keywords if kw in text_lower)
        if urgency_count >= 2:
            danger_score = min(98, danger_score + 5)
        
        # Calculate confidence based on match quality
        confidence = min(0.95, 0.70 + (match_data['keyword_matches'] * 0.05) + (match_data['urgent_matches'] * 0.10))
        
        tags = [disaster_type, 'keyword_match']
        if match_data['urgent_matches'] > 0:
            tags.append('urgent')
        
        return {
            'disaster_type': disaster_type.replace('_', ' ').title(),
            'danger_score': int(danger_score),
            'confidence': round(confidence, 2),
            'tags': tags
        }
    
    def predict_image(self):
        """Fallback for image prediction"""
        return {
            'disaster_type': 'Visual Emergency',
            'danger_score': 75,
            'confidence': 0.60,
            'tags': ['image', 'visual_inspection_needed']
        }
    
    def predict_audio(self):
        """Fallback for audio prediction"""
        return {
            'disaster_type': 'Audio Emergency',
            'danger_score': 75,
            'confidence': 0.60,
            'tags': ['audio', 'sound_analysis_needed']
        }

# Initialize service
ml_service = LightweightMLService()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'lightweight_ml',
        'models_loaded': True,
        'text_classification': 'keyword_based',
        'image_classification': 'fallback',
        'audio_classification': 'fallback'
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Unified prediction endpoint"""
    try:
        # Handle both form data and JSON
        if request.is_json:
            data = request.get_json()
            content_type = data.get('type', 'text')
            text = data.get('text', '')
        else:
            content_type = request.form.get('type', 'text')
            text = request.form.get('text', '')
        
        logger.info(f"Prediction request - Type: {content_type}")
        
        if content_type == 'text':
            if not text:
                return jsonify({'error': 'No text provided'}), 400
            
            result = ml_service.predict_text(text)
            logger.info(f"Text prediction: {result['disaster_type']} (score: {result['danger_score']})")
            return jsonify(result)
        
        elif content_type == 'image':
            result = ml_service.predict_image()
            logger.info(f"Image prediction (fallback): {result['disaster_type']}")
            return jsonify(result)
        
        elif content_type == 'audio':
            result = ml_service.predict_audio()
            logger.info(f"Audio prediction (fallback): {result['disaster_type']}")
            return jsonify(result)
        
        else:
            return jsonify({'error': 'Invalid content type'}), 400
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({
            'disaster_type': 'Emergency',
            'danger_score': 70,
            'confidence': 0.50,
            'tags': ['error', 'fallback'],
            'error': str(e)
        }), 200  # Return 200 with fallback data

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint"""
    test_cases = [
        "There is a massive flood in the city, people are trapped",
        "Building collapsed after earthquake",
        "Fire emergency - smoke everywhere",
        "Car accident on highway"
    ]
    
    results = []
    for text in test_cases:
        result = ml_service.predict_text(text)
        results.append({'text': text, 'prediction': result})
    
    return jsonify({'test_results': results})

if __name__ == '__main__':
    logger.info("🚀 Starting Lightweight ML Service on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=True)
