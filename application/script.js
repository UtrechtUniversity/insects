// --- DOM Elements ---
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const userImage = document.getElementById('userImage');
const dropContent = document.querySelector('.drop-content');
const removeBtn = document.getElementById('removeBtn');
const processBtn = document.getElementById('processBtn');

// Mode Switch Elements
const modeClassify = document.getElementById('modeClassify');
const modeDetect = document.getElementById('modeDetect');
const sectionTitle = document.getElementById('sectionTitle');
const sectionDesc = document.getElementById('sectionDesc');
const btnText = document.getElementById('btnText');

// Sections
const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');

// Classification Results Elements
const classificationResult = document.getElementById('classificationResult');
const resClassUserImg = document.getElementById('resClassUserImg');
const resClassAiImg = document.getElementById('resClassAiImg');
const insectName = document.getElementById('insectName');
const insectSciName = document.getElementById('insectSciName');

// Detection Results Elements
const detectionResult = document.getElementById('detectionResult');
const resDetectUserImg = document.getElementById('resDetectUserImg');
const annotatedContainer = document.getElementById('annotatedContainer');
const resetBtn = document.getElementById('resetBtn');

// --- State Variables ---
let currentMode = 'classification'; 

// --- Event Listeners ---
modeClassify.addEventListener('change', () => { if(modeClassify.checked) updateMode('classification'); });
modeDetect.addEventListener('change', () => { if(modeDetect.checked) updateMode('detection'); });

function updateMode(mode) {
    currentMode = mode;
    if (mode === 'classification') {
        sectionTitle.textContent = "Crop & Download";
        sectionDesc.textContent = "Extract all insects from the image into individual files.";
        btnText.textContent = "Download Crops";
    } else {
        sectionTitle.textContent = "Insect Detection";
        sectionDesc.textContent = "Detect and identify all insects in the image.";
        btnText.textContent = "Detect Insects";
    }
}

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('drag-over'); });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
removeBtn.addEventListener('click', resetUpload);
processBtn.addEventListener('click', () => { if (userImage.src) startProcessing(); });

resetBtn.addEventListener('click', () => {
    resultSection.style.display = 'none';
    uploadSection.style.display = 'block';
    const oldBoxes = annotatedContainer.querySelectorAll('.bounding-box');
    oldBoxes.forEach(box => box.remove());
    resetUpload();
});

// --- Functions ---
function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgData = e.target.result;
                userImage.src = imgData;
                resClassUserImg.src = imgData;
                resDetectUserImg.src = imgData;
                dropContent.style.display = 'none';
                previewContainer.style.display = 'flex';
                processBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid image file.");
        }
    }
}

function resetUpload() {
    fileInput.value = '';
    userImage.src = '';
    previewContainer.style.display = 'none';
    dropContent.style.display = 'block';
    processBtn.disabled = true;
}

function startProcessing() {
    uploadSection.style.display = 'none';
    loadingSection.style.display = 'block';
    
    // Update loading text
    const loadingText = document.getElementById('loadingText');
    loadingText.textContent = currentMode === 'classification' 
        ? "Extracting insects..." 
        : "Scanning image...";

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);

    // Define API Endpoints
    const baseUrl = 'http://127.0.0.1:5000';
    const endpoint = currentMode === 'classification' 
        ? `${baseUrl}/crop_download`
        : `${baseUrl}/analyze`;

    if (currentMode === 'classification') {
        // --- CROP MODE ---
        fetch(endpoint, { method: 'POST', body: formData })
            .then(response => {
                if (!response.ok) throw new Error("Server error");
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "insects_cropped.zip";
                document.body.appendChild(a);
                a.click();
                a.remove();
                
                // Show simple success screen
                loadingSection.style.display = 'none';
                resultSection.style.display = 'block';
                classificationResult.style.display = 'block';
                detectionResult.style.display = 'none';
                insectName.textContent = "Success";
                insectSciName.textContent = "Crops downloaded to your computer.";
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred during processing. Check the CMD console for details.");
                location.reload();
            });

    } else {
        // --- DETECTION MODE ---
        fetch(endpoint, { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                if(data.error) throw new Error(data.error);
                finishProcessingDetection(data);
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred. Check if the Python backend is running.");
                location.reload();
            });
    }
}

function finishProcessingDetection(data) {
    loadingSection.style.display = 'none';
    resultSection.style.display = 'block';
    
    classificationResult.style.display = 'none';
    detectionResult.style.display = 'block';
    
    // Draw real boxes
    drawBoxes(data);
    
    // Update stats
    const countSpan = document.querySelector('.detection-stats .highlight');
    if(countSpan) countSpan.textContent = data.length;
}

function drawBoxes(predictions) {
    // Clear old boxes
    const oldBoxes = annotatedContainer.querySelectorAll('.bounding-box');
    oldBoxes.forEach(box => box.remove());

    // Get natural dimensions of the image (real pixels)
    const naturalWidth = resDetectUserImg.naturalWidth;
    const naturalHeight = resDetectUserImg.naturalHeight;

    predictions.forEach(pred => {
        const box = document.createElement('div');
        box.classList.add('bounding-box');
        
        // Backend returns [x1, y1, x2, y2] in pixels
        const [x1, y1, x2, y2] = pred.box;
        
        // Convert to percentages for CSS positioning
        const left = (x1 / naturalWidth) * 100;
        const top = (y1 / naturalHeight) * 100;
        const width = ((x2 - x1) / naturalWidth) * 100;
        const height = ((y2 - y1) / naturalHeight) * 100;

        box.style.left = `${left}%`;
        box.style.top = `${top}%`;
        box.style.width = `${width}%`;
        box.style.height = `${height}%`;

        // Add Label
        const label = document.createElement('span');
        label.classList.add('box-label');
        label.textContent = `${pred.label} (${Math.round(pred.confidence * 100)}%)`;

        box.appendChild(label);
        annotatedContainer.appendChild(box);
    });
}