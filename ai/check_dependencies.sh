#!/bin/bash

# Dependency Check Script for ResQ AI

echo "🔍 Checking Python Dependencies for AI Folder"
echo "=============================================="
echo ""

# Function to check if a module is installed
check_module() {
    python3 -c "import $1" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ $1"
        return 0
    else
        echo "❌ $1 - NOT INSTALLED"
        return 1
    fi
}

echo "Core ML Libraries:"
check_module "numpy"
check_module "pandas"
check_module "sklearn"
check_module "tensorflow"
check_module "joblib"

echo ""
echo "Audio Processing:"
check_module "librosa"
check_module "soundfile"

echo ""
echo "Image Processing:"
check_module "PIL"

echo ""
echo "Visualization:"
check_module "matplotlib"
check_module "seaborn"

echo ""
echo "Web/API:"
check_module "flask"
check_module "flask_cors"
check_module "requests"
check_module "bs4"

echo ""
echo "=============================================="
echo ""

# Count missing modules
MISSING=0
python3 -c "import numpy" 2>/dev/null || ((MISSING++))
python3 -c "import pandas" 2>/dev/null || ((MISSING++))
python3 -c "import sklearn" 2>/dev/null || ((MISSING++))
python3 -c "import tensorflow" 2>/dev/null || ((MISSING++))
python3 -c "import matplotlib" 2>/dev/null || ((MISSING++))
python3 -c "import seaborn" 2>/dev/null || ((MISSING++))
python3 -c "import PIL" 2>/dev/null || ((MISSING++))
python3 -c "import librosa" 2>/dev/null || ((MISSING++))
python3 -c "import flask" 2>/dev/null || ((MISSING++))
python3 -c "import bs4" 2>/dev/null || ((MISSING++))

if [ $MISSING -eq 0 ]; then
    echo "🎉 All dependencies are installed!"
    echo ""
    echo "You can now:"
    echo "  1. Use the lightweight ML service (already running)"
    echo "  2. Train text classification model"
    echo "  3. Train image/audio models (if you have datasets)"
else
    echo "⚠️  $MISSING dependencies are missing"
    echo ""
    echo "Install missing dependencies with:"
    echo "  pip3 install --user numpy pandas scikit-learn tensorflow matplotlib seaborn pillow librosa soundfile joblib flask flask-cors requests beautifulsoup4"
fi

echo ""
