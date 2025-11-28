// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const userImage = document.getElementById('userImage');
const dropContent = document.querySelector('.drop-content');
const removeBtn = document.getElementById('removeBtn');
const processBtn = document.getElementById('processBtn');

// Section Elements
const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');

// Result Elements
const resultUserImg = document.getElementById('resultUserImg');
const aiResultImg = document.getElementById('aiResultImg');
const insectName = document.getElementById('insectName');
const insectSciName = document.getElementById('insectSciName');
const resetBtn = document.getElementById('resetBtn');

// Mock Database for testing (Simulating AI Dataset)
const insectDatabase = [
    {
        name: "Monarch Butterfly",
        scientific: "Danaus plexippus",
        image: "https://images.unsplash.com/photo-1535068488396-1d04112e3e60?q=80&w=400&auto=format&fit=crop"
    },
    {
        name: "European Honey Bee",
        scientific: "Apis mellifera",
        image: "https://images.unsplash.com/photo-1588720120170-0589606eb628?q=80&w=400&auto=format&fit=crop"
    },
    {
        name: "Seven-Spot Ladybird",
        scientific: "Coccinella septempunctata",
        image: "https://images.unsplash.com/photo-1542352654-202e2392d47b?q=80&w=400&auto=format&fit=crop"
    }
];

// --- Event Listeners --- //

// Drag & Drop effects
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
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// File Input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Remove Image
removeBtn.addEventListener('click', () => {
    resetUpload();
});

// Process Button (The "AI" trigger)
processBtn.addEventListener('click', () => {
    startProcessing();
});

// Reset / Scan Another
resetBtn.addEventListener('click', () => {
    resultSection.style.display = 'none';
    uploadSection.style.display = 'block';
    resetUpload();
});

// --- Functions --- //

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                userImage.src = e.target.result;
                resultUserImg.src = e.target.result; // Set result image now too
                
                dropContent.style.display = 'none';
                previewContainer.style.display = 'block';
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
    // 1. Hide Upload, Show Loading
    uploadSection.style.display = 'none';
    loadingSection.style.display = 'block';

    // 2. Simulate AI Processing Delay (3 seconds)
    // TODO: Connect this to your real backend API fetch call later
    setTimeout(() => {
        finishProcessing();
    }, 3000); 
}

function finishProcessing() {
    // 3. Select a random result from mock database (Simulating AI prediction)
    const randomResult = insectDatabase[Math.floor(Math.random() * insectDatabase.length)];

    // 4. Update DOM with results
    aiResultImg.src = randomResult.image;
    insectName.textContent = randomResult.name;
    insectSciName.textContent = randomResult.scientific;

    // 5. Hide Loading, Show Result
    loadingSection.style.display = 'none';
    resultSection.style.display = 'block';
}

/* 
   FUTURE BACKEND INTEGRATION NOTE:
   When connecting to your AI, replace the setTimeout in startProcessing() with:
   
   const formData = new FormData();
   formData.append('image', fileInput.files[0]);
   
   fetch('YOUR_API_ENDPOINT', { method: 'POST', body: formData })
     .then(response => response.json())
     .then(data => {
         // Update UI with data.insectName and data.imageUrl
         finishProcessing(data);
     });
*/