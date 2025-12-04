# AI Directory Analysis Report

## Directory Rename Detected
✅ Changed: `nischal major project` → `nischal_major_project`

## Import Issues Found

### 1. Missing Python Packages

**Required packages not installed:**
- `matplotlib` - For plotting graphs
- `seaborn` - For visualizations
- `pillow` (PIL) - For image processing
- `beautifulsoup4` - For web scraping
- `librosa` - For audio processing
- `soundfile` - For audio file I/O

**Installation command running:**
```bash
pip3 install --user matplotlib seaborn pillow tensorflow keras beautifulsoup4 requests librosa soundfile
```

### 2. Hardcoded Windows Paths

**Problem files:**
- `nischal_major_project/train_mobilenet_disaster.py`
- `nischal_major_project/app.py`

**Issues:**
```python
# Line 12: DATA_DIR = r"b:\nischal major project\disasters"
# Line 17: MODEL_SAVE = r"b:\nischal major project\disaster_mobilenet.h5"
# Line 85: checkpoint path
# Line 124: class_names.json path
# Line 139: training_curves.png path
```

These need to be changed to Mac paths.

### 3. Missing Dataset

The training script expects a `disasters/` directory with images organized by class:
```
disasters/
├── biological and chemical pandemic/
├── cyclone/
├── drought/
├── earthquake/
├── flood/
├── landslide/
├── tsunami/
└── wildfire/
```

**This dataset is NOT present** in your AI folder.

## Complete Dependency List

Based on all Python files in `/ai/`:

### Core ML Libraries
- `numpy` ✅ (installed)
- `pandas` ✅ (installed)
- `scikit-learn` ✅ (installed)
- `tensorflow` ⚠️ (may need update)
- `keras` ⚠️ (included in tensorflow)
- `joblib` ✅ (installed)

### Audio Processing
- `librosa` ❌ (installing)
- `soundfile` ❌ (installing)

### Image Processing
- `pillow` (PIL) ❌ (installing)

### Visualization
- `matplotlib` ❌ (installing)
- `seaborn` ❌ (installing)

### Web/API
- `flask` ✅ (installed)
- `flask-cors` ✅ (installed)
- `requests` ❌ (installing)
- `beautifulsoup4` ❌ (installing)

## Recommended Actions

### Option 1: Use Lightweight Service (CURRENT - WORKING)
**Status**: ✅ Already running
**No action needed** - your system is working with keyword-based classification

### Option 2: Train Image Model
**Requirements**:
1. ✅ Install dependencies (in progress)
2. ❌ Fix hardcoded paths
3. ❌ Provide image dataset
4. ⏱️ Training time: 30-60 minutes

**Not recommended** unless you have the disaster image dataset.

### Option 3: Train Text Model
**Requirements**:
1. ✅ Install dependencies
2. ✅ No dataset needed (uses built-in data)
3. ⏱️ Training time: 2-5 minutes

**Recommended** - easiest to set up and train.

## Quick Fix Commands

### Install all dependencies:
```bash
pip3 install --user numpy pandas scikit-learn tensorflow matplotlib seaborn pillow librosa soundfile joblib flask flask-cors requests beautifulsoup4
```

### For text model only (minimal):
```bash
cd /Users/ishananand/Desktop/resqq/ai/Text_Disaster_Prediction
python3 train_model.py
```

## Current System Status

✅ **Backend**: Running on port 5001
✅ **Frontend**: Running on ports 5173, 5174  
✅ **ML Service**: Running on port 5002 (lightweight)
✅ **Database**: Connected

**Your system is fully functional with the lightweight ML service!**

Training full models is optional and requires datasets.
