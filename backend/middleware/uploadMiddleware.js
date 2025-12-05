const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3');
const path = require('path');
const fs = require('fs');

const config = require('../config/production');

// Ensure uploads directory exists for local storage
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Check if S3 credentials are valid (not placeholders)
const isS3Configured = config.AWS_ACCESS_KEY_ID &&
    config.AWS_ACCESS_KEY_ID !== 'placeholder' &&
    config.AWS_SECRET_ACCESS_KEY &&
    config.AWS_SECRET_ACCESS_KEY !== 'placeholder';

let storage;

if (isS3Configured) {
    storage = multerS3({
        s3: s3,
        bucket: config.AWS_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + path.extname(file.originalname));
        }
    });
} else {
    // Fallback to local storage
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|mp3|wav|mp4|mov|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images, Audio, and Video Only!');
    }
}

module.exports = upload;
