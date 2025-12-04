#!/bin/bash

# ResQ Connect ML Service Startup Script

echo "🚀 Starting ResQ Connect ML Service..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if we're in the ai directory
if [ ! -f "ml_service.py" ]; then
    echo "📂 Changing to ai directory..."
    cd "$(dirname "$0")" || exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements_ml_service.txt

# Check for model files
echo "🔍 Checking for model files..."
MODELS_MISSING=0

if [ ! -f "Text_Disaster_Prediction/disaster_model_FINAL.pkl" ]; then
    echo "⚠️  Text model not found: Text_Disaster_Prediction/disaster_model_FINAL.pkl"
    MODELS_MISSING=1
fi

if [ ! -f "nischal major project/disaster_mobilenet.h5" ]; then
    echo "⚠️  Image model not found: nischal major project/disaster_mobilenet.h5"
    MODELS_MISSING=1
fi

if [ ! -f "saved_models/cnn_model.h5" ]; then
    echo "⚠️  Audio model not found: saved_models/cnn_model.h5"
    MODELS_MISSING=1
fi

if [ $MODELS_MISSING -eq 1 ]; then
    echo ""
    echo "⚠️  Some models are missing. The service will use fallback predictions."
    echo "   To train models, refer to ML_SERVICE_GUIDE.md"
    echo ""
fi

# Start the ML service
echo "✅ Starting ML Service on port 5002..."
echo ""
python ml_service.py
