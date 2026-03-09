const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

router.post('/', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) return error(res, 'No file uploaded', 400);

    // Return the full URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    return success(res, 'File uploaded', { url: fileUrl });
}, (err, req, res, next) => {
    if (err) return error(res, err.message, 400);
    next();
});

module.exports = router;
