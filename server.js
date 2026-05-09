require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || 'nexus2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Ensure data.json exists
const dataFile = path.join(__dirname, 'data.json');
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf8');
}

// Helper to read/write DB
const readDB = () => JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const writeDB = (data) => fs.writeFileSync(dataFile, JSON.stringify(data, null, 4), 'utf8');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 1000 * 1024 * 1024 } // 1GB max limit
});

// --- API Routes ---

// Authentication Middleware for secure routes
const authenticate = (req, res, next) => {
    const password = req.headers['x-password'];
    if (password !== UPLOAD_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized: Incorrect Password' });
    }
    next();
};

// 1. Get all files
app.get('/api/files', (req, res) => {
    try {
        const files = readDB();
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read database' });
    }
});

// 2. Upload file
app.post('/api/upload', authenticate, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        const isAudio = file.mimetype.startsWith('audio/');
        const isPdf = file.mimetype === 'application/pdf';
        const isArchive = file.mimetype.includes('zip') || file.mimetype.includes('rar') || file.mimetype.includes('tar');
        
        let type = 'document';
        let icon = 'ph-file';
        let color = '#20C997'; // default green

        if (isImage) { type = 'image'; icon = 'ph-image'; color = '#00F0FF'; }
        else if (isVideo) { type = 'video'; icon = 'ph-video-camera'; color = '#B534FF'; }
        else if (isAudio) { type = 'audio'; icon = 'ph-file-audio'; color = '#2B58FF'; }
        else if (isPdf) { type = 'document'; icon = 'ph-file-pdf'; color = '#FF4757'; }
        else if (isArchive) { type = 'archive'; icon = 'ph-file-archive'; color = '#9BA1A6'; }

        const newFile = {
            id: uuidv4(),
            name: file.originalname,
            filename: file.filename, // physical name on disk
            type,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            date: new Date().toISOString().split('T')[0],
            icon,
            color,
            url: isImage ? `/uploads/${file.filename}` : `/api/download/${file.filename}`
        };

        const files = readDB();
        files.unshift(newFile); // Add to top
        writeDB(files);

        res.status(201).json({ message: 'File uploaded successfully', file: newFile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

// 3. Download file
app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        // Find original name in DB
        const files = readDB();
        const fileRecord = files.find(f => f.filename === req.params.filename);
        const originalName = fileRecord ? fileRecord.name : req.params.filename;
        
        res.download(filePath, originalName);
    } else {
        // Fallback for mock data (prevent crash if trying to download dummy items)
        res.status(404).send('File not found on disk. This might be a mock file.');
    }
});

// 4. Delete file
app.delete('/api/files/:id', authenticate, (req, res) => {
    try {
        let files = readDB();
        const fileIndex = files.findIndex(f => f.id === req.params.id);
        
        if (fileIndex === -1) {
            return res.status(404).json({ error: 'File not found in database' });
        }

        const fileRecord = files[fileIndex];
        
        // Remove from DB
        files.splice(fileIndex, 1);
        writeDB(files);

        // Remove from Disk
        if (fileRecord.filename) {
            const filePath = path.join(uploadsDir, fileRecord.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during deletion' });
    }
});

// Catch-all route to serve the SPA
app.get('/(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`[Nexus] Server running on http://localhost:${PORT}`);
});
