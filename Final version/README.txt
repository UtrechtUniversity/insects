# Insect Recognition — Object Detection (COCO / optional YOLO→COCO)

This repository provides a guided workflow to train an **object detection** model using
**Torchvision Faster R-CNN (ResNet50-FPN)**.

Training is designed to be run from **one notebook (step-by-step guide)**:
- If your dataset is already **COCO**, you can train directly.
- If your dataset is **YOLO**, you can optionally convert it to COCO inside the notebook.

The notebook supports both:
- **Default**: one class (common “insect” setup)
- **Optional**: multiple classes (species / categories)

---

## 1) What you need

- Python 3.9+
- (Recommended) NVIDIA GPU + CUDA
- A dataset in **COCO** or **YOLO** format

---

## 2) Install dependencies

### Step 1 — Create and activate an environment
Use venv or conda (your choice).

### Step 2 — Install Python packages

pip install -r requirements.txt


### Step 3 — Install PyTorch (IMPORTANT)
PyTorch wheels depend on your system (CUDA vs CPU). Install from the official PyTorch selector.

Example (CUDA 12.1):

pip install -U torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121


CPU-only example:

pip install -U torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu


---

## 3) Dataset formats

You can use **either COCO** (recommended) or **YOLO** (optional conversion).

### Option A (Recommended): COCO input

Expected structure:

COCO_ROOT/
  train/
    images/
      *.jpg|*.jpeg|*.png
    annotations.json
  val/                    (optional)
    images/
    annotations.json
  test/                   (optional)
    images/
    annotations.json


COCO JSON must include:
- `images`
- `annotations` (can be empty for negative images)
- `categories`

Category IDs should start from `1` and be consistent across all splits.

### Option B: YOLO input (optional conversion in the notebook)

Expected structure:

YOLO_DATASET_ROOT/
  train/
    images/
      *.jpg|*.jpeg|*.png
    labels/
      *.txt
  val/                    (optional)
    images/
    labels/
  test/                   (optional)
    images/
    labels/


Each label file line format:

class xc yc w h

Where `xc, yc, w, h` are normalized to `[0..1]`.

The notebook converts YOLO bboxes to COCO bboxes:
- COCO bbox: `[x, y, width, height]` in pixel coordinates.

---

## 4) Run the notebook

Open the provided training notebook and follow the sections top-to-bottom.

### Step A — Edit only the Config cell
In the config cell you set:
- `RUN_YOLO_TO_COCO = False` if you already have COCO
- `RUN_YOLO_TO_COCO = True` if you want YOLO → COCO conversion
- dataset paths
- training hyperparameters (batch size, epochs, lr)
- output directory

### Step B — Run all cells in order
The notebook is designed so the new user can:
1) validate inputs
2) (optionally) convert YOLO → COCO
3) train
4) evaluate (optional)
5) test inference on sample images

---

## 5) Outputs

After training:
- `outputs/best_model.pt` (if a validation split exists)
- otherwise: `outputs/last_model.pt`

These are `state_dict` checkpoints.

---

## 6) Optional evaluation

If `val/` or `test/` exists, the notebook can compute detection metrics using TorchMetrics:
- mAP@[.50:.95]
- mAP@50
- mAP@75
- mar@100

---

## 7) Multi-class notes (only if you use multiple classes)

If your dataset has multiple categories:
- Ensure COCO `categories` includes all classes with unique IDs starting at `1`
- Ensure annotations use the correct `category_id`
- Set `num_classes = 1 + number_of_categories` (background + classes)
- If using YOLO→COCO conversion, ensure the class-id mapping matches your intended category names

---

## 8) Troubleshooting

### COCO path errors
- Ensure `train/images/` exists and `train/annotations.json` exists.
- `val/` and `test/` are optional.

### GPU not used
- Check `torch.cuda.is_available()` in the notebook.
- Ensure you installed the correct CUDA wheel.

## 9) NEW — Ready-to-Use Model Inference & Evaluation Notebook (model_inference/)

Besides the training notebook(s) inside `notebooks/`, this repository includes a separate **ready-to-use**
notebook dedicated to **evaluation + visual inference**.

This notebook is intentionally written as a **plug-and-play** workflow:
you only edit paths in the **Configuration** cell, then run everything top-to-bottom.

### Where it lives

- Training notebooks: `notebooks/`
- Ready-to-use inference/evaluation notebook: `model_inference/`

Recommended folder layout:

model_inference/
  evaluate_fasterrcnn_insect_single_class.ipynb
  best_model.pt

> The notebook is designed to work directly with `best_model.pt` (a `state_dict` checkpoint).

### What this notebook does

This notebook provides a clean evaluation workflow:

- Loads your trained checkpoint (`best_model.pt`)
- Rebuilds the same Faster R-CNN architecture used in training
- Loads the COCO-format test split (`test/images` + `test/annotations.json`)
- Computes detection metrics using TorchMetrics:
  - mAP@[.50:.95], mAP@50, mAP@75, mar@100
- Visualizes predictions vs. ground-truth boxes (GT in green, predictions in red)
- (Optional) Saves metrics into a timestamped JSON file

### How to run it

1) Ensure you have a COCO test split:

COCO_ROOT/
  test/
    images/
    annotations.json

2) Put your checkpoint next to the notebook (recommended):

model_inference/
  best_model.pt

3) Open the notebook:

model_inference/evaluate_fasterrcnn_insect_single_class.ipynb

4) Edit only the Configuration cell:
- `COCO_ROOT` (dataset root path)
- `CHECKPOINT_PATH` (default: `best_model.pt`)

5) Run all cells top-to-bottom.

### Notes

- If you don’t have `test/`, you can still use the notebook by pointing it to `val/` instead
  (just update the paths in the config cell).
- CPU works, but GPU is recommended for faster evaluation/inference.
