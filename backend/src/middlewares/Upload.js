const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadRoot = process.env.UPLOAD_DIR || 'uploads';
const profileDir = path.join(process.cwd(), uploadRoot, 'profile-pics');

fs.mkdirSync(profileDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const safeBase = file.originalname.replace(extension, '').replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${safeBase}${extension}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
