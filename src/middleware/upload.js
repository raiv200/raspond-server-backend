const multer = require('multer');
const path = require('path');
const { AVATAR_MAX_SIZE, DOCUMENT_MAX_SIZE, ALLOWED_AVATAR_TYPES, ALLOWED_DOCUMENT_TYPES } = require('../config/constants');

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/avatars')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: AVATAR_MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_AVATAR_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
  },
}).single('avatar');

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/documents')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `rfp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`);
  },
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: DOCUMENT_MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Supported: PDF, Word, PowerPoint, Excel, CSV.'));
  },
}).single('document');

function handleUpload(uploadFn) {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'File too large' });
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  };
}

module.exports = {
  uploadAvatar: handleUpload(uploadAvatar),
  uploadDocument: handleUpload(uploadDocument),
};
