const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const baseUploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads', 'resumes')
  : path.join(__dirname, '../uploads/resumes');

if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, baseUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `resume-${req.user._id}-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF documents are allowed.'), false);
  }
};

const uploadResume = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = { uploadResume };