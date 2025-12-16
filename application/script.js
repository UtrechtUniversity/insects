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

// Classification Results Elements (Crop Mode)
const classificationResult = document.getElementById('classificationResult');
const resClassUserImg = document.getElementById('resClassUserImg');
const resClassAiImg = document.getElementById('resClassAiImg');
const insectName = document.getElementById('insectName');
const insectSciName = document.getElementById('insectSciName');
const matchDesc = document.querySelector('.desc'); // <--- Selected the percentage text

// Detection Results Elements
const detectionResult = document.getElementById('detectionResult');
const resDetectUserImg = document.getElementById('resDetectUserImg');
const annotatedContainer = document.getElementById('annotatedContainer');
const resetBtn = document.getElementById('resetBtn');

// --- State Variables ---
let currentMode = 'classification'; 
let currentFile = null;
let downloadBlob = null;

// --- Create Download Button Dynamically ---
const downloadBtn = document.createElement('button');
downloadBtn.className = 'btn-primary';
downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download Results';
downloadBtn.style.marginTop = '15px';
downloadBtn.style.display = 'none'; 
document.querySelector('.ai-card').appendChild(downloadBtn);

// --- Event Listeners ---
modeClassify.addEventListener('change', () => { if(modeClassify.checked) updateMode('classification'); });
modeDetect.addEventListener('change', () => { if(modeDetect.checked) updateMode('detection'); });

downloadBtn.addEventListener('click', () => {
    if (downloadBlob) {
        const url = window.URL.createObjectURL(downloadBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "insects_cropped.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
});

function updateMode(mode) {
    currentMode = mode;
    if (mode === 'classification') {
        sectionTitle.textContent = "Crop Specimen";
        sectionDesc.textContent = "Extract all insects from the image into individual files.";
        btnText.textContent = "Extract Insects";
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
processBtn.addEventListener('click', () => { if (currentFile) startProcessing(); });

resetBtn.addEventListener('click', () => {
    resultSection.style.display = 'none';
    uploadSection.style.display = 'block';
    
    // Reset UI elements
    downloadBtn.style.display = 'none';
    downloadBlob = null;
    resClassAiImg.style.display = 'block'; // Reset image visibility
    if(matchDesc) matchDesc.textContent = ""; // Clear text on reset
    
    const oldBoxes = annotatedContainer.querySelectorAll('.bounding-box');
    oldBoxes.forEach(box => box.remove());
    resetUpload();
});

// --- Functions ---
function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            currentFile = file;
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
    currentFile = null;
    userImage.src = '';
    previewContainer.style.display = 'none';
    dropContent.style.display = 'block';
    processBtn.disabled = true;
}

function startProcessing() {
    if (!currentFile) {
        alert("No file selected!");
        return;
    }

    uploadSection.style.display = 'none';
    loadingSection.style.display = 'block';
    
    const loadingText = document.getElementById('loadingText');
    loadingText.textContent = currentMode === 'classification' 
        ? "Extracting insects..." 
        : "Scanning image...";

    const formData = new FormData();
    formData.append('image', currentFile);

    const baseUrl = 'http://127.0.0.1:5000';
    const endpoint = currentMode === 'classification' 
        ? `${baseUrl}/crop_download`
        : `${baseUrl}/analyze`;

if (currentMode === 'classification') {
        // --- CROP MODE ---
        fetch(endpoint, { method: 'POST', body: formData })
            .then(response => {
                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                return response.blob();
            })
            .then(blob => {
                // FORCE the type to be a ZIP file
                const safeBlob = new Blob([blob], { type: 'application/zip' }); // <--- CHANGED THIS LINE
                downloadBlob = safeBlob; 
                
                loadingSection.style.display = 'none';
                resultSection.style.display = 'block';
                classificationResult.style.display = 'block';
                detectionResult.style.display = 'none';

                resClassAiImg.style.display = 'none'; 
                
                insectName.textContent = "Extraction Complete";
                insectSciName.textContent = "Insects successfully cropped.";
                insectSciName.style.color = '#00ffaa';
                
                if(matchDesc) {
                    matchDesc.textContent = "Archive ready for download.";
                    matchDesc.style.color = "#80cbc4";
                }

                downloadBtn.style.display = 'inline-block';
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Extraction Failed: " + error.message);
                location.reload();
            });

    } else {
        // --- DETECTION MODE ---
        fetch(endpoint, { method: 'POST', body: formData })
            .then(response => {
                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if(data.error) throw new Error(data.error);
                finishProcessingDetection(data);
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Detection Failed: " + error.message);
                location.reload();
            });
    }
}

function finishProcessingDetection(data) {
    loadingSection.style.display = 'none';
    resultSection.style.display = 'block';
    
    classificationResult.style.display = 'none';
    detectionResult.style.display = 'block';
    
    drawBoxes(data);
    
    const countSpan = document.querySelector('.detection-stats .highlight');
    if(countSpan) countSpan.textContent = data.length;
}

function drawBoxes(predictions) {
    const oldBoxes = annotatedContainer.querySelectorAll('.bounding-box');
    oldBoxes.forEach(box => box.remove());

    const naturalWidth = resDetectUserImg.naturalWidth;
    const naturalHeight = resDetectUserImg.naturalHeight;

    if (naturalWidth === 0 || naturalHeight === 0) {
        resDetectUserImg.onload = () => drawBoxes(predictions);
        return;
    }

    predictions.forEach(pred => {
        const box = document.createElement('div');
        box.classList.add('bounding-box');
        
        const [x1, y1, x2, y2] = pred.box;
        
        const left = (x1 / naturalWidth) * 100;
        const top = (y1 / naturalHeight) * 100;
        const width = ((x2 - x1) / naturalWidth) * 100;
        const height = ((y2 - y1) / naturalHeight) * 100;

        box.style.left = `${left}%`;
        box.style.top = `${top}%`;
        box.style.width = `${width}%`;
        box.style.height = `${height}%`;

        const label = document.createElement('span');
        label.classList.add('box-label');
        
        // Show percentage only if confidence is high, otherwise just show label
        const confPercent = Math.round(pred.confidence * 100);
        label.textContent = `${pred.label} (${confPercent}%)`;

        box.appendChild(label);
        annotatedContainer.appendChild(box);
    });
}