
const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadLandImage = async (req, res) => {
  try {
    const landId = Number(req.params.id);
    const userId = Number(req.user.id);

    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image' });
    }

    // Verify land listing
    const [lands] = await db.query(
      'SELECT id, owner_id FROM lands WHERE id = ?',
      [landId]
    );

    if (lands.length === 0) {
      return res.status(404).json({ message: 'Land listing not found' });
    }

    if (Number(lands[0].owner_id) !== userId) {
      return res.status(403).json({
        message: 'You can only upload images to your own listing',
      });
    }

    // Upload image to Cloudinary
    const imageUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'landconnect/lands',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    // Save Cloudinary URL in database
    await db.query(
      'INSERT INTO land_images (land_id, image_url) VALUES (?, ?)',
      [landId, imageUrl]
    );

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        land_id: landId,
        image_url: imageUrl,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Unable to upload image' });
  }
};

const getLandImages = async (req, res) => {
  try {
    const landId = Number(req.params.id);

    const [images] = await db.query(
      'SELECT id, image_url FROM land_images WHERE land_id = ? ORDER BY id DESC',
      [landId]
    );

    res.json({ images });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Unable to fetch images' });
  }
};

module.exports = { uploadLandImage, getLandImages };
