import os
import collections

# --- CONFIG ---
# Path to your dataset labels
LABELS_DIR = r"C:\Users\ruben\Downloads\Archive\ami_traps\ami_traps_dataset\labels"
MIN_SAMPLES = 50  # Must match what you used in training

def generate_map():
    print(f"Scanning {LABELS_DIR}...")
    
    # 1. Count classes
    class_counts = collections.defaultdict(int)
    files = [f for f in os.listdir(LABELS_DIR) if f.endswith('.txt')]
    
    for file in files:
        with open(os.path.join(LABELS_DIR, file), 'r') as f:
            for line in f:
                if line.strip():
                    try:
                        cls_id = int(line.split()[0])
                        class_counts[cls_id] += 1
                    except ValueError:
                        pass

    # 2. Filter by min_samples
    valid_classes = [c for c, count in class_counts.items() if count >= MIN_SAMPLES]
    valid_classes.sort()
    
    # 3. Generate Dictionary
    # Map 1 -> ID, 2 -> ID ...
    idx_to_class = {i+1: real_id for i, real_id in enumerate(valid_classes)}
    
    print("\nSUCCESS! Found", len(valid_classes), "classes.")
    print("Copy the dictionary below and paste it into app.py:\n")
    print("IDX_TO_CLASS = {")
    for k, v in idx_to_class.items():
        print(f"    {k}: {v},")
    print("}")

if __name__ == "__main__":
    generate_map()