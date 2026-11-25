
const multer = require('multer');
const express = require('express');
const router = express.Router();

const {
  uploadLandImage,
  getLandImages
} = require('../controllers/imageController');

const {
  createLand,
  getAllLands,
  getLandById,
  updateLand,
  deleteLand
} = require('../controllers/landController');

const authMiddleware = require('../middleware/authMiddleware');

// Store uploaded images temporarily in memory
const storage = multer.memoryStorage();

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

// Get images of a land listing
router.get('/:id/images', getLandImages);

// Upload land image
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

// Create listing
router.post('/', authMiddleware, (req, res, next) => {
  if (!['Seller', 'Broker'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Only Sellers and Brokers can create listings'
    });
  }
  next();
}, createLand);

// Update listing
router.put('/:id', authMiddleware, (req, res, next) => {
  if (!['Seller', 'Broker'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Only Sellers and Brokers can update listings'
    });
  }
  next();
}, updateLand);

// Delete listing
router.delete('/:id', authMiddleware, (req, res, next) => {
  if (!['Seller', 'Broker'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Only Sellers and Brokers can delete listings'
    });
  }
  next();
}, deleteLand);

module.exports = router;
