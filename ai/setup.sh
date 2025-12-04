#!/bin/bash

# Quick Setup Script for ResQ AI Models
# This script helps you set up the AI models step by step

echo "🚀 ResQ AI Setup Assistant"
echo "=========================="
echo ""

# Check current directory
if [ ! -f "ml_service_lite.py" ]; then
    echo "❌ Please run this script from the /ai directory"
    echo "   cd /Users/ishananand/Desktop/resqq/ai"
    exit 1
fi

echo "📊 Current Status Check..."
echo ""

# Check if lightweight service is running
if lsof -Pi :5002 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ ML Service is RUNNING on port 5002"
    echo ""
    echo "Testing ML service..."
    curl -s http://localhost:5002/health | python3 -m json.tool
    echo ""
else
    echo "⚠️  ML Service is NOT running"
    echo ""
    echo "Would you like to start it? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Starting ML service..."
        python3 ml_service_lite.py &
        sleep 3
        echo "✅ ML Service started"
    fi
fi

echo ""
echo "📋 What would you like to do?"
echo ""
echo "1) Keep using lightweight service (RECOMMENDED - already working)"
echo "2) Train text classification model"
echo "3) Train image classification model (requires dataset)"
echo "4) Train audio classification model (requires dataset)"
echo "5) Test current ML service"
echo "6) Exit"
echo ""
echo -n "Enter your choice (1-6): "
read -r choice

case $choice in
    1)
        echo ""
        echo "✅ Great! Your lightweight ML service is already working."
        echo "   No additional setup needed."
        echo ""
        echo "Test it with:"
        echo "   curl -X POST http://localhost:5002/predict -d 'type=text&text=flood emergency'"
        ;;
    2)
        echo ""
        echo "📚 Training text classification model..."
        cd Text_Disaster_Prediction
        if [ -f "train_model.py" ]; then
            python3 train_model.py
            echo "✅ Text model training complete!"
        else
            echo "❌ train_model.py not found"
        fi
        ;;
    3)
        echo ""
        echo "🖼️  Training image classification model..."
        cd "nischal major project"
        if [ -f "train_mobilenet_disaster.py" ]; then
            python3 train_mobilenet_disaster.py
            echo "✅ Image model training complete!"
        else
            echo "❌ train_mobilenet_disaster.py not found"
        fi
        ;;
    4)
        echo ""
        echo "🎵 Training audio classification model..."
        if [ -f "train_model.py" ]; then
            python3 train_model.py
            echo "✅ Audio model training complete!"
        else
            echo "❌ train_model.py not found"
        fi
        ;;
    5)
        echo ""
        echo "🧪 Testing ML Service..."
        echo ""
        echo "Health Check:"
        curl -s http://localhost:5002/health | python3 -m json.tool
        echo ""
        echo ""
        echo "Prediction Test:"
        curl -s -X POST http://localhost:5002/predict \
          -d "type=text&text=There is a massive earthquake, building collapsed" \
          | python3 -m json.tool
        ;;
    6)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
