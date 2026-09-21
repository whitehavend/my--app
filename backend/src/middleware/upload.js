const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedExtensions = new Set(['.jpeg', '.jpg', '.png', '.pdf']);
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDirectory),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, '-');
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${uniquePrefix}-${safeBaseName || 'upload'}${extension}`);
  },
});

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension)) {
    callback(null, true);
    return;
  }

  callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 2,
    fileSize: 10 * 1024 * 1024,
  },
});

const withUploadErrors = (middleware) => (req, res, next) => {
  middleware(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload rejected: ${error.message}` });
    }
    if (error) return res.status(400).json({ error: error.message });
    return next();
  });
};

module.exports = upload;
module.exports.uploadDirectory = uploadDirectory;
module.exports.withUploadErrors = withUploadErrors;
