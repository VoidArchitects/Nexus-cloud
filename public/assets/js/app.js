document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentFiles = [];
    let currentFilter = 'all';
    
    // DOM Elements
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    const ctaExplore = document.getElementById('cta-explore');
    const ctaUpload = document.getElementById('cta-upload');
    const fileGrid = document.getElementById('file-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('global-search');
    
    // Modal Elements
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalClose = document.querySelector('.modal-close');
    const modalDownload = document.getElementById('modal-download');
    
    // Password Modal
    const passwordModal = document.getElementById('password-modal');
    const adminPasswordInput = document.getElementById('admin-password');
    const passSubmit = document.getElementById('pass-submit');
    const passModalClose = document.getElementById('pass-modal-close');
    
    // Upload Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const toastContainer = document.getElementById('toast-container');

    // Storage Elements
    const storageChart = document.getElementById('storage-chart');
    const storagePercent = document.getElementById('storage-percent');
    const statImages = document.getElementById('stat-images');
    const statVideos = document.getElementById('stat-videos');
    const statDocuments = document.getElementById('stat-documents');
    const statFree = document.getElementById('stat-free');

    function updateStorageStats() {
        const TOTAL_STORAGE_MB = 10240; // 10 GB
        
        let imagesMb = 0;
        let videosMb = 0;
        let documentsMb = 0;
        
        currentFiles.forEach(f => {
            const size = parseFloat(f.size) || 0;
            if (f.type === 'image') imagesMb += size;
            else if (f.type === 'video') videosMb += size;
            else documentsMb += size;
        });
        
        const usedMb = imagesMb + videosMb + documentsMb;
        const freeMb = Math.max(0, TOTAL_STORAGE_MB - usedMb);
        const percentUsed = Math.min(100, Math.round((usedMb / TOTAL_STORAGE_MB) * 100));
        
        statImages.textContent = imagesMb.toFixed(1) + ' MB';
        statVideos.textContent = videosMb.toFixed(1) + ' MB';
        statDocuments.textContent = documentsMb.toFixed(1) + ' MB';
        statFree.textContent = freeMb > 1024 ? (freeMb / 1024).toFixed(1) + ' GB' : freeMb.toFixed(1) + ' MB';
        
        storagePercent.textContent = percentUsed + '%';
        
        const imgP = (imagesMb / TOTAL_STORAGE_MB) * 100;
        const vidP = (videosMb / TOTAL_STORAGE_MB) * 100;
        const docP = (documentsMb / TOTAL_STORAGE_MB) * 100;
        
        let gradient = `conic-gradient(`;
        
        if (usedMb === 0) {
            gradient += `#4A4A68 0% 100%)`;
        } else {
            let currentP = 0;
            if (imgP > 0) {
                gradient += `var(--neon-cyan) ${currentP}% ${currentP + imgP}%, `;
                currentP += imgP;
            }
            if (vidP > 0) {
                gradient += `var(--neon-purple) ${currentP}% ${currentP + vidP}%, `;
                currentP += vidP;
            }
            if (docP > 0) {
                gradient += `var(--neon-red) ${currentP}% ${currentP + docP}%, `;
                currentP += docP;
            }
            gradient += `#4A4A68 ${currentP}% 100%)`;
        }
        
        storageChart.style.background = gradient;
    }

    // --- Init API ---
    async function loadFiles() {
        try {
            const res = await fetch('/api/files');
            if (res.ok) {
                currentFiles = await res.json();
                applyFilters();
                updateStorageStats();
            }
        } catch (err) {
            showToast('Failed to load files from server', 'ph-warning');
        }
    }
    
    // Initial Load
    loadFiles();

    // --- SPA Navigation ---
    function switchView(targetId) {
        navBtns.forEach(btn => {
            if (btn.dataset.target === targetId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        views.forEach(view => {
            if (view.id === targetId) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.target));
    });

    ctaExplore.addEventListener('click', () => switchView('library-view'));
    ctaUpload.addEventListener('click', () => {
        switchView('library-view');
        dropZone.classList.add('dragover');
        setTimeout(() => dropZone.classList.remove('dragover'), 1000);
    });

    // --- File Rendering ---
    function renderFiles(files) {
        fileGrid.innerHTML = '';
        
        if (files.length === 0) {
            fileGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="ph ph-folder-open" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    <p>No files found.</p>
                </div>
            `;
            return;
        }

        files.forEach(file => {
            const card = document.createElement('div');
            card.className = 'file-card';
            card.innerHTML = `
                <i class="ph-fill ${file.icon} card-icon" style="color: ${file.color}"></i>
                <div class="card-info">
                    <h4>${file.name}</h4>
                    <div class="card-meta">
                        <span>${file.size}</span>
                        <span>${file.date}</span>
                    </div>
                </div>
                <div class="card-actions">
                    ${file.type === 'image' ? `<button class="btn btn-secondary btn-sm preview-btn" data-id="${file.id}">Preview</button>` : ''}
                    <button class="btn btn-primary btn-sm download-btn" data-id="${file.id}" data-url="${file.url}">Download</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${file.id}"><i class="ph ph-trash"></i></button>
                </div>
            `;
            fileGrid.appendChild(card);
        });

        attachCardEvents();
    }

    // --- Filtering & Searching ---
    function applyFilters() {
        let filtered = currentFiles;
        
        if (currentFilter !== 'all') {
            filtered = filtered.filter(f => f.type === currentFilter);
        }
        
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(f => f.name.toLowerCase().includes(searchTerm));
        }
        
        renderFiles(filtered);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    searchInput.addEventListener('input', applyFilters);

    // --- Toast Notifications ---
    function showToast(message, icon = 'ph-check-circle') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="ph-fill ${icon}"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    }

    // --- Password Prompt Logic ---
    let passwordResolve = null;

    function promptPassword() {
        return new Promise(resolve => {
            passwordResolve = resolve;
            passwordModal.classList.add('active');
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        });
    }

    passSubmit.addEventListener('click', () => {
        const pwd = adminPasswordInput.value;
        passwordModal.classList.remove('active');
        if (passwordResolve) passwordResolve(pwd);
    });

    passModalClose.addEventListener('click', () => {
        passwordModal.classList.remove('active');
        if (passwordResolve) passwordResolve(null);
    });

    // --- Card Interactions ---
    function attachCardEvents() {
        const previewBtns = document.querySelectorAll('.preview-btn');
        const downloadBtns = document.querySelectorAll('.download-btn');
        const deleteBtns = document.querySelectorAll('.delete-btn');

        previewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const file = currentFiles.find(f => f.id === btn.dataset.id);
                if (file) {
                    openModal(file);
                }
            });
        });

        downloadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = btn.dataset.url;
                showToast(`Starting download...`, 'ph-download-simple');
                window.location.href = url;
            });
        });

        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                
                const pwd = await promptPassword();
                if (!pwd) return; // Cancelled

                showToast(`Deleting file...`, 'ph-spinner-gap');
                try {
                    const res = await fetch(`/api/files/${id}`, {
                        method: 'DELETE',
                        headers: { 'x-password': pwd }
                    });
                    
                    if (res.ok) {
                        currentFiles = currentFiles.filter(f => f.id !== id);
                        applyFilters();
                        updateStorageStats();
                        showToast(`File deleted`, 'ph-check-circle');
                    } else {
                        const data = await res.json();
                        showToast(data.error || 'Failed to delete file', 'ph-warning');
                    }
                } catch (err) {
                    showToast('Server error', 'ph-warning');
                }
            });
        });
    }

    // --- Modal Logic ---
    function openModal(file) {
        modalImage.src = file.url;
        modalTitle.textContent = file.name;
        imageModal.classList.add('active');
    }

    function closeModal() {
        imageModal.classList.remove('active');
        setTimeout(() => {
            modalImage.src = '';
        }, 300);
    }

    modalClose.addEventListener('click', closeModal);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal || e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });
    modalDownload.addEventListener('click', () => {
        showToast(`Downloading ${modalTitle.textContent}...`, 'ph-download-simple');
        window.location.href = modalImage.src;
        closeModal();
    });

    // --- Actual Upload Logic ---
    async function handleFiles(files) {
        if (!files.length) return;
        
        const pwd = await promptPassword();
        if (!pwd) return; // Cancelled

        Array.from(files).forEach(async (file) => {
            showToast(`Uploading ${file.name}...`, 'ph-spinner-gap');
            
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'x-password': pwd },
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    currentFiles.unshift(data.file);
                    applyFilters();
                    updateStorageStats();
                    showToast(`${file.name} uploaded successfully!`, 'ph-check-circle');
                } else {
                    const data = await res.json();
                    showToast(data.error || `Failed to upload ${file.name}`, 'ph-warning');
                }
            } catch (err) {
                showToast(`Server error uploading ${file.name}`, 'ph-warning');
            }
        });
    }

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
});
