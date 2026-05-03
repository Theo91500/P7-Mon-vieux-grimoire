const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont acceptées !'), false);
  }
};

const storage = multer.memoryStorage();

const uploadMulter = multer({ storage, fileFilter }).single('image');


const upload = (req, res, next) => {
  uploadMulter(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return next();

    try {
      const outputDir = 'images';
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

      const filename = Date.now() + '.webp';
      const outputPath = path.join(outputDir, filename);

      await sharp(req.file.buffer)
        .resize({ width: 800 }) 
        .webp({ quality: 80 })  
        .toFile(outputPath);

      req.file.filename = filename;

      next();
    } catch (error) {
      console.error('Erreur Sharp :', error);
      res.status(500).json({ error: "Erreur lors du traitement de l'image." });
    }
  });
};

module.exports = upload;
