const socket = new WebSocket(`ws://${window.location.host}/ws/socket-server/`);
let myUserId = null;
let selectedFiles = new Map();
let receivingFiles = new Map();
let totalFilesToReceive = 0;

socket.onopen = function(e) {
    console.log("WebSocket connection established");
};

socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.type === 'user_id') {
        myUserId = data.user_id;
        document.getElementById('myUserId').innerHTML = myUserId;
    }
    if (data.type === 'file_offer') {
        handleFileOffer(data);
    }
};

// File Selection and Preview
document.getElementById('fileInput').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const fileId = Date.now() + Math.random();
        selectedFiles.set(fileId, file);
        addFilePreview(file, fileId);
    });
    this.value = '';
    
    if (selectedFiles.size > 0) {
        document.getElementById('filesPreviewSection').classList.remove('d-none');
        document.getElementById('addMoreHint').classList.remove('d-none');
        document.getElementById('resetSection').classList.remove('d-none');
    }
});

function addFilePreview(file, fileId) {
    const container = document.getElementById('selectedFiles');
    const preview = document.createElement('div');
    preview.className = 'file-preview';
    preview.id = `file-${fileId}`;

    const iconClass = getFileIconClass(file.name);
    preview.innerHTML = `
        <div class="file-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="file-info">
            <p class="file-name" title="${file.name}">${file.name}</p>
            <p class="file-size">${formatFileSize(file.size)}</p>
        </div>
    `;
    container.appendChild(preview);
}

function handleFileOffer(data) {
    const fileId = Date.now() + Math.random();
    
    if (receivingFiles.size === 0) {
        totalFilesToReceive = data.total_files;
        showReceiveModal();
    }
    
    receivingFiles.set(fileId, data);
    updateReceiveModal();
}

function showReceiveModal() {
    document.getElementById('receiveFilesList').innerHTML = '';
    document.getElementById('receiveProgress').style.width = '0%';
    document.getElementById('fileCount').textContent = '0 files';
    
    const modal = new bootstrap.Modal(document.getElementById('fileTransferModal'));
    modal.show();
}

function updateReceiveModal() {
    const filesList = document.getElementById('receiveFilesList');
    const progress = (receivingFiles.size / totalFilesToReceive) * 100;
    const receiveStatus = document.getElementById('receiveStatus');
    
    document.getElementById('fileCount').textContent = `${receivingFiles.size} files`;
    document.getElementById('receiveProgress').style.width = `${progress}%`;

    // Update receive status
    receiveStatus.classList.remove('d-none');
    if (receivingFiles.size < totalFilesToReceive) {
        receiveStatus.innerHTML = `
            <div class="receiving-status">
                <div class="spinner-border text-success spinner-border-sm me-2" role="status"></div>
                <span>Receiving files...</span>
            </div>
        `;
    } else {
        receiveStatus.innerHTML = `
            <div class="receiving-status">
                <i class="fas fa-check-circle text-success me-2"></i>
                <span>Successfully received all files!</span>
            </div>
        `;
    }

    filesList.innerHTML = '';
    
    let totalSize = 0;
    receivingFiles.forEach(data => {
        totalSize += calculateFileSizeInBytes(data.file);
        
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        preview.innerHTML = `
            <div class="file-icon">
                <i class="fas ${getFileIconClass(data.file_name)}"></i>
            </div>
            <div class="file-info">
                <p class="file-name" title="${data.file_name}">${data.file_name}</p>
                <p class="file-size">${calculateFileSize(data.file)}</p>
            </div>
        `;
        filesList.appendChild(preview);
    });

    document.getElementById('totalSize').textContent = formatFileSize(totalSize);
}

function resetFiles() {
    selectedFiles.clear();
    document.getElementById('selectedFiles').innerHTML = '';
    document.getElementById('filesPreviewSection').classList.add('d-none');
    document.getElementById('addMoreHint').classList.add('d-none');
    document.getElementById('resetSection').classList.add('d-none');
    document.getElementById('fileInput').value = '';
}

function updateSendingStatus(current, total) {
    const sendingStatus = document.getElementById('sendingStatus');
    
    if (current < total) {
        sendingStatus.classList.remove('d-none');
        sendingStatus.innerHTML = `
            <div class="spinner-border text-light spinner-border-sm me-2" role="status"></div>
            <span>Sending files... (${current}/${total})</span>
        `;
    } else {
        sendingStatus.innerHTML = `
            <i class="fas fa-check-circle text-success me-2"></i>
            <span>All files sent successfully!</span>
        `;
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('sendConfirmModal'));
            modal.hide();
            resetFiles();
        }, 2000);
    }
}

// Form Submission
document.getElementById('form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (selectedFiles.size === 0) {
        alert('Please select at least one file');
        return;
    }

    const targetUserId = document.getElementById('userInput').value;
    showSendConfirmation(targetUserId);
});

function showSendConfirmation(targetUserId) {
    const modal = new bootstrap.Modal(document.getElementById('sendConfirmModal'));
    const filesList = document.getElementById('confirmFilesList');
    filesList.innerHTML = '';
    
    let totalSize = 0;
    selectedFiles.forEach((file) => {
        totalSize += file.size;
        
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        preview.innerHTML = `
            <div class="file-icon">
                <i class="fas ${getFileIconClass(file.name)}"></i>
            </div>
            <div class="file-info">
                <p class="file-name">${file.name}</p>
                <p class="file-size">${formatFileSize(file.size)}</p>
            </div>
        `;
        filesList.appendChild(preview);
    });

    document.getElementById('confirmFileCount').textContent = selectedFiles.size;
    document.getElementById('confirmTotalSize').textContent = formatFileSize(totalSize);
    document.getElementById('sendingStatus').classList.add('d-none');

    document.getElementById('confirmSendBtn').onclick = () => {
        sendFiles(targetUserId);
    };

    modal.show();
}

async function sendFiles(targetUserId) {
    const totalFiles = selectedFiles.size;
    let currentFile = 0;

    for (const [_, file] of selectedFiles) {
        try {
            const reader = new FileReader();
            await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }).then(result => {
                const fileData = result.split(',')[1];
                currentFile++;
                updateSendingStatus(currentFile, totalFiles);
                
                socket.send(JSON.stringify({
                    'file_name': file.name,
                    'file': fileData,
                    'target_user_id': targetUserId,
                    'total_files': totalFiles,
                    'current_file': currentFile
                }));
            });
        } catch (error) {
            console.error('Error sending file:', error);
        }
    }
}

function acceptFile() {
    receivingFiles.forEach((data) => {
        downloadFile(data.file_name, data.file);
    });
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('fileTransferModal'));
    modal.hide();
    
    receivingFiles.clear();
    totalFilesToReceive = 0;
}

function rejectFile() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('fileTransferModal'));
    modal.hide();
    
    receivingFiles.clear();
    totalFilesToReceive = 0;
}

// Utility Functions
function getFileIconClass(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
        pdf: 'fa-file-pdf',
        doc: 'fa-file-word',
        docx: 'fa-file-word',
        xls: 'fa-file-excel',
        xlsx: 'fa-file-excel',
        jpg: 'fa-file-image',
        jpeg: 'fa-file-image',
        png: 'fa-file-image',
        gif: 'fa-file-image',
        txt: 'fa-file-text',
        zip: 'fa-file-archive',
        rar: 'fa-file-archive',
        '7z': 'fa-file-archive'
    };
    return iconMap[ext] || 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function calculateFileSizeInBytes(base64String) {
    const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
    return (base64String.length * 0.75) - padding;
}

function calculateFileSize(base64String) {
    return formatFileSize(calculateFileSizeInBytes(base64String));
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        const tooltip = document.getElementById('copyTooltip');
        tooltip.style.display = 'block';
        setTimeout(() => tooltip.style.display = 'none', 2000);
    });
}

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('userInput').value = text;
    } catch (err) {
        console.error('Failed to paste:', err);
    }
}

function downloadFile(fileName, fileData) {
    const link = document.createElement('a');
    link.href = 'data:application/octet-stream;base64,' + fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}