const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  uploadLandImage,
  getLandImages
} = require('../controllers/imageController');
const express = require('express');
const router = express.Router();

const {
  createLand,
  getAllLands,
  getLandById,
  updateLand,
  deleteLand
} = require('../controllers/landController');

const authMiddleware = require('../middleware/authMiddleware');
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and WEBP images are allowed'));
    }
  },
});
router.get('/:id/images', getLandImages);

router.post(
  '/:id/images',
  authMiddleware,
  (req, res, next) => {
    if (!['Seller', 'Broker'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'Only Sellers and Brokers can upload images'
      });
    }
    next();
  },
  upload.single('image'),
  uploadLandImage
);
// Public routes
router.get('/', getAllLands);
router.get('/:id', getLandById);

// Only Seller and Broker can create listings
router.post('/', authMiddleware, (req, res, next) => {
  if (!['Seller', 'Broker'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Only Sellers and Brokers can create listings'
    });
  }
  next();
}, createLand);

// Only Seller and Broker can update listings
router.put('/:id', authMiddleware, (req, res, next) => {
  if (!['Seller', 'Broker'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Only Sellers and Brokers can update listings'
    });
  }
  next();
}, updateLand);

// Only Seller and Broker can delete listings
router.delete('/:id', authMiddleware, (req, res, next) => {
  if (!['Seller', 'Broker'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Only Sellers and Brokers can delete listings'
    });
  }
  next();
}, deleteLand);

module.exports = router;
