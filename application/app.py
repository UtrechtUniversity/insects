import os
import io
import json
import zipfile
import torch
import numpy as np
import torchvision
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from torchvision.transforms import functional as F
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from PIL import Image

app = Flask(__name__)
CORS(app)

# --- PATH CONFIGURATION ---
# This grabs the folder where app.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Look for files in the same folder as app.py
MODEL_PATH = os.path.join(BASE_DIR, "faster_rcnn_ami_traps.pth")
NOTES_JSON_PATH = os.path.join(BASE_DIR, "notes.json")

DEVICE = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')

# --- CLASS MAPPING ---
# Maps Model Output Index (1-40) -> Dataset Insect ID
IDX_TO_DATASET_ID = {
    1: 1099,
    2: 1138,
    3: 1808,
    4: 1912,
    5: 2351,
    6: 2357,
    7: 2358,
    8: 2392,
    9: 2501,
    10: 2790,
    11: 2991,
    12: 2997,
    13: 3031,
    14: 3652,
    15: 3694,
    16: 3852,
    17: 4774,
    18: 5112,
    19: 5121,
    20: 5800,
    21: 5920,
    22: 5953,
    23: 5981,
    24: 6315,
    25: 6714,
    26: 7069,
    27: 7243,
    28: 7504,
    29: 7541,
    30: 7575,
    31: 8083,
    32: 8133,
    33: 8134,
    34: 9409,
    35: 9826,
    36: 10175,
    37: 10896,
    38: 10901,
    39: 11077,
    40: 11304,
}

# --- LOAD HUMAN NAMES FROM JSON ---
DATASET_ID_TO_NAME = {}

def load_names():
    if os.path.exists(NOTES_JSON_PATH):
        try:
            with open(NOTES_JSON_PATH, 'r') as f:
                data = json.load(f)
                # Handle structure if it's a dict with 'categories' or just a list
                categories = data.get('categories', data) 
                for category in categories:
                    cat_id = category.get('id')
                    cat_name = category.get('name', 'Unknown')
                    DATASET_ID_TO_NAME[cat_id] = cat_name
            print(f"✅ Loaded {len(DATASET_ID_TO_NAME)} insect names from JSON.")
        except Exception as e:
            print(f"❌ Error parsing notes.json: {e}")
    else:
        print(f"⚠️ WARNING: notes.json not found at {NOTES_JSON_PATH}")

load_names()

# 0 (Background) + 40 Insects = 41 Classes
NUM_CLASSES = len(IDX_TO_DATASET_ID) + 1

# --- LOAD MODEL ---
def get_model():
    print(f"Loading model from {MODEL_PATH}...")
    model = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights=None)
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, NUM_CLASSES)
    
    if os.path.exists(MODEL_PATH):
        try:
            model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
            print("✅ Model loaded successfully!")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    else:
        print(f"❌ CRITICAL ERROR: Model file not found at {MODEL_PATH}")
    
    model.to(DEVICE)
    model.eval()
    return model

model = get_model()

@app.route('/analyze', methods=['POST'])
def analyze():
    print("\n--- Object Detection Request Received ---")
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    
    try:
        img_pil = Image.open(file.stream).convert("RGB")
        img_tensor = F.to_tensor(img_pil).unsqueeze(0).to(DEVICE)
        
        with torch.no_grad():
            prediction = model(img_tensor)[0]
        
        results = []
        HIGH_THRESHOLD = 0.5  # High confidence = Specific Name
        LOW_THRESHOLD = 0.3   # Medium confidence = Unknown Insect
        
        for i in range(len(prediction['boxes'])):
            score = prediction['scores'][i].item()
            
            if score > LOW_THRESHOLD:
                box = prediction['boxes'][i].cpu().numpy().tolist()
                label_idx = prediction['labels'][i].item()
                
                # 1. Internal Index -> Dataset ID
                dataset_id = IDX_TO_DATASET_ID.get(label_idx, -1)
                
                # 2. Dataset ID -> Human Name
                real_name = DATASET_ID_TO_NAME.get(dataset_id, f"ID: {dataset_id}")
                
                # 3. Apply Unknown Logic
                display_label = real_name
                if score < HIGH_THRESHOLD:
                    display_label = "Unknown Insect"

                results.append({
                    'label': display_label,
                    'confidence': round(score, 2),
                    'box': box 
                })
        
        print(f"✅ Found {len(results)} objects.")
        return jsonify(results)

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/crop_download', methods=['POST'])
def crop_download():
    print("\n--- Crop & Download Request Received ---")
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
        
    file = request.files['image']
    
    try:
        img_pil = Image.open(file.stream).convert("RGB")
        img_np = np.array(img_pil)
        img_tensor = F.to_tensor(img_pil).unsqueeze(0).to(DEVICE)
        
        with torch.no_grad():
            prediction = model(img_tensor)[0]
            
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
            count = 0
            THRESHOLD = 0.3
            
            for i in range(len(prediction['boxes'])):
                if prediction['scores'][i] > THRESHOLD:
                    x1, y1, x2, y2 = map(int, prediction['boxes'][i].cpu().tolist())
                    
                    h, w, _ = img_np.shape
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(w, x2), min(h, y2)

                    label_idx = prediction['labels'][i].item()
                    dataset_id = IDX_TO_DATASET_ID.get(label_idx, -1)
                    name = DATASET_ID_TO_NAME.get(dataset_id, "Unknown")
                    
                    safe_name = "".join([c for c in name if c.isalnum() or c in (' ', '_')]).strip().replace(" ", "_")

                    crop = img_np[y1:y2, x1:x2]
                    
                    if crop.size > 0:
                        crop_pil = Image.fromarray(crop)
                        img_byte_arr = io.BytesIO()
                        crop_pil.save(img_byte_arr, format='PNG')
                        zip_file.writestr(f"{safe_name}_{count}.png", img_byte_arr.getvalue())
                        count += 1
                        
        zip_buffer.seek(0)
        
        # Create the response object
        response = send_file(
            zip_buffer, 
            mimetype='application/zip', 
            as_attachment=True, 
            download_name='insects_cropped.zip'
        )
        
        # ADD THESE HEADERS to tell browsers/Windows this is safe
        response.headers["Content-Type"] = "application/zip"
        # Prevents the browser from trying to "sniff" the file type and guessing wrong
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Explicitly state the filename again in the header
        response.headers["Content-Disposition"] = 'attachment; filename="insects_cropped.zip"'
        
        return response

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)