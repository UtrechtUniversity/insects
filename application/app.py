import os
import io
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
CORS(app)  # <--- CRITICAL FIX: Allows browser to fetch data

# --- CONFIGURATION ---
MODEL_PATH = r"R:\Files Ruben\GitRepos\InsectRecognizerAI\notebook\Faster R-CNN\faster_rcnn_ami_traps.pth"
DEVICE = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')

# --- CLASS MAPPING ---
# REPLACE THIS with your specific dictionary from the notebook output if different
IDX_TO_CLASS = {
    1: 2351, 2: 2392, 3: 2991, 4: 3031, 5: 5121,
    6: 5953, 7: 6315, 8: 6714, 9: 7243, 10: 10896
}

NUM_CLASSES = len(IDX_TO_CLASS) + 1

# --- LOAD MODEL ---
def get_model():
    print(f"Loading model from {MODEL_PATH}...")
    model = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights=None)
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, NUM_CLASSES)
    
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        print("✅ Model loaded successfully!")
    else:
        print(f"❌ ERROR: Model file not found at {MODEL_PATH}")
    
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
        print("Processing image...")
        img_pil = Image.open(file.stream).convert("RGB")
        img_tensor = F.to_tensor(img_pil).unsqueeze(0).to(DEVICE)
        
        with torch.no_grad():
            prediction = model(img_tensor)[0]
        
        results = []
        THRESHOLD = 0.5
        
        for i in range(len(prediction['boxes'])):
            score = prediction['scores'][i].item()
            if score > THRESHOLD:
                box = prediction['boxes'][i].cpu().numpy().tolist()
                label_idx = prediction['labels'][i].item()
                label_name = str(IDX_TO_CLASS.get(label_idx, "Unknown"))
                
                results.append({
                    'label': label_name,
                    'confidence': round(score, 2),
                    'box': box 
                })
        
        print(f"✅ Found {len(results)} objects. Sending response.")
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
        print("Processing image for cropping...")
        img_pil = Image.open(file.stream).convert("RGB")
        img_np = np.array(img_pil)
        img_tensor = F.to_tensor(img_pil).unsqueeze(0).to(DEVICE)
        
        with torch.no_grad():
            prediction = model(img_tensor)[0]
            
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
            count = 0
            THRESHOLD = 0.5
            
            for i in range(len(prediction['boxes'])):
                if prediction['scores'][i] > THRESHOLD:
                    x1, y1, x2, y2 = map(int, prediction['boxes'][i].cpu().tolist())
                    h, w, _ = img_np.shape
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(w, x2), min(h, y2)
                    
                    label_idx = prediction['labels'][i].item()
                    name = str(IDX_TO_CLASS.get(label_idx, "Insect"))
                    
                    crop = img_np[y1:y2, x1:x2]
                    
                    if crop.size > 0:
                        crop_pil = Image.fromarray(crop)
                        img_byte_arr = io.BytesIO()
                        crop_pil.save(img_byte_arr, format='PNG')
                        zip_file.writestr(f"{name}_{count}.png", img_byte_arr.getvalue())
                        count += 1
                        
        print(f"✅ Created zip with {count} insects. Downloading...")
        zip_buffer.seek(0)
        return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name='insects_cropped.zip')

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)