# ML Service Integration Guide

## Overview
The ResQ Connect ML Service provides real-time disaster classification for text, images, and audio using trained deep learning models.

## Architecture
- **ML Service**: Flask API running on port 5002
- **Backend**: Node.js/Express calling ML service via HTTP
- **Models**: Text (NLP), Image (MobileNet), Audio (CNN)

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd ai
pip install -r requirements_ml_service.txt
```

### 2. Verify Model Files
Ensure the following model files exist:
- `Text_Disaster_Prediction/disaster_model_FINAL.pkl`
- `Text_Disaster_Prediction/vectorizer_FINAL.pkl`
- `nischal major project/disaster_mobilenet.h5`
- `nischal major project/class_names.json`
- `saved_models/cnn_model.h5`
- `saved_models/label_encoder.pkl`
- `saved_models/scaler.pkl`

**Note**: If models are missing, you'll need to train them first using the training scripts in each subdirectory.

### 3. Start ML Service
```bash
cd ai
python ml_service.py
```

The service will start on `http://localhost:5002`

### 4. Test ML Service
```bash
# Health check
curl http://localhost:5002/health

# Test text prediction
curl -X POST http://localhost:5002/predict \
  -d "type=text&text=There is a massive flood in the city"

# Test image prediction
curl -X POST http://localhost:5002/predict \
  -F "type=image" \
  -F "file=@path/to/image.jpg"
```

### 5. Configure Backend
Update `backend/.env`:
```
ML_SERVICE_URL=http://localhost:5002/predict
```

## API Endpoints

### POST /predict
Unified prediction endpoint for all content types.

**Text Request:**
```
POST /predict
Content-Type: application/x-www-form-urlencoded

type=text&text=Emergency situation description
```

**Image/Audio Request:**
```
POST /predict
Content-Type: multipart/form-data

type=image (or audio)
file=<binary file data>
```

**Response:**
```json
{
  "disaster_type": "Flood",
  "danger_score": 85,
  "confidence": 0.92,
  "tags": ["flood", "urgent"]
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "text_model": true,
  "image_model": true,
  "audio_model": false
}
```

## Fallback Behavior

The ML service includes intelligent fallback mechanisms:

1. **Model Not Loaded**: Uses keyword-based classification
2. **Prediction Error**: Returns safe default scores
3. **Network Timeout**: Backend uses keyword fallback

This ensures the system remains operational even if ML models aren't available.

## Production Deployment

For production:

1. **Use Gunicorn** instead of Flask dev server:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5002 ml_service:app
   ```

2. **Set Environment Variables**:
   ```bash
   export FLASK_ENV=production
   export ML_MODEL_PATH=/path/to/models
   ```

3. **Enable HTTPS** for secure communication

4. **Monitor Performance**: Add logging and metrics

## Troubleshooting

### Models Not Loading
- Check file paths in `ml_service.py`
- Verify Python dependencies are installed
- Check TensorFlow/scikit-learn versions

### High Latency
- Reduce image resolution before sending
- Use GPU acceleration for TensorFlow
- Implement request queuing

### Memory Issues
- Limit concurrent requests
- Use model quantization
- Deploy on machine with adequate RAM (8GB+ recommended)

## Training New Models

To retrain models with new data:

1. **Text Model**: Run `ai/Text_Disaster_Prediction/train_model.py`
2. **Image Model**: Run `ai/nischal major project/train_mobilenet_disaster.py`
3. **Audio Model**: Run `ai/train_model.py`

Refer to individual README files in each directory for detailed training instructions.
