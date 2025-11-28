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
let currentMode = 'classification'; // 'classification' or 'detection'

// --- Mock Data ---
const insectDatabase = [
    { name: "Monarch Butterfly", scientific: "Danaus plexippus", image: "https://images.unsplash.com/photo-1535068488396-1d04112e3e60?q=80&w=400" },
    { name: "European Honey Bee", scientific: "Apis mellifera", image: "https://images.unsplash.com/photo-1588720120170-0589606eb628?q=80&w=400" },
    { name: "Stag Beetle", scientific: "Lucanus cervus", image: "https://images.unsplash.com/photo-1596570773663-875c742c3479?q=80&w=400" }
];

const mockDetectionLabels = ["Beetle", "Larva", "Ant", "Unknown Insect"];

// --- Event Listeners ---

// 1. Mode Switching Logic
modeClassify.addEventListener('change', () => {
    if(modeClassify.checked) updateMode('classification');
});

modeDetect.addEventListener('change', () => {
    if(modeDetect.checked) updateMode('detection');
});

function updateMode(mode) {
    currentMode = mode;
    if (mode === 'classification') {
        sectionTitle.textContent = "Scan Specimen";
        sectionDesc.textContent = "Upload an image of a single insect to identify the species.";
        btnText.textContent = "Identify Species";
    } else {
        sectionTitle.textContent = "Swarm Detection";
        sectionDesc.textContent = "Upload an image with multiple insects to detect and count them.";
        btnText.textContent = "Detect Objects";
    }
}

// 2. Drag & Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

// 3. Button Actions
removeBtn.addEventListener('click', resetUpload);

processBtn.addEventListener('click', () => {
    if (!userImage.src) return;
    startProcessing();
});

resetBtn.addEventListener('click', () => {
    resultSection.style.display = 'none';
    uploadSection.style.display = 'block';
    
    // Clear old boxes
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
                
                // Pre-set result images depending on mode
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
    
    // Update loading text based on mode
    const loadingText = document.getElementById('loadingText');
    loadingText.textContent = currentMode === 'classification' 
        ? "Analyzing biological markers..." 
        : "Scanning for multiple entities...";

    // Simulate AI Delay (2.5 seconds)
    setTimeout(() => {
        finishProcessing();
    }, 2500);
}

function finishProcessing() {
    loadingSection.style.display = 'none';
    resultSection.style.display = 'block';

    if (currentMode === 'classification') {
        // Show Classification View
        classificationResult.style.display = 'block';
        detectionResult.style.display = 'none';
        
        // Random Mock Result
        const randomResult = insectDatabase[Math.floor(Math.random() * insectDatabase.length)];
        resClassAiImg.src = randomResult.image;
        insectName.textContent = randomResult.name;
        insectSciName.textContent = randomResult.scientific;

    } else {
        // Show Detection View
        classificationResult.style.display = 'none';
        detectionResult.style.display = 'block';
        
        // Generate Dummy Bounding Boxes
        generateDummyBoxes();
    }
}

// SIMULATION: Create fake bounding boxes for visual effect
function generateDummyBoxes() {
    // Clear previous boxes just in case
    const oldBoxes = annotatedContainer.querySelectorAll('.bounding-box');
    oldBoxes.forEach(box => box.remove());

    // Generate 2 to 4 random boxes
    const numBoxes = Math.floor(Math.random() * 3) + 2; 

    for (let i = 0; i < numBoxes; i++) {
        const box = document.createElement('div');
        box.classList.add('bounding-box');
        
        // Random positions (percentages to stay relative to image)
        // Note: In a real app, backend returns [x, y, width, height]
        const top = Math.floor(Math.random() * 60) + 10; // 10% to 70%
        const left = Math.floor(Math.random() * 60) + 10;
        const width = Math.floor(Math.random() * 20) + 10; // 10% to 30% width
        const height = Math.floor(Math.random() * 20) + 10;

        box.style.top = `${top}%`;
        box.style.left = `${left}%`;
        box.style.width = `${width}%`;
        box.style.height = `${height}%`;

        // Add Label
        const label = document.createElement('span');
        label.classList.add('box-label');
        const randomLabel = mockDetectionLabels[Math.floor(Math.random() * mockDetectionLabels.length)];
        const confidence = (Math.random() * (0.99 - 0.85) + 0.85).toFixed(2); // Random float between 0.85 and 0.99
        label.textContent = `${randomLabel} ${confidence}`;

        box.appendChild(label);
        annotatedContainer.appendChild(box);
    }
}