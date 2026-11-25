
const db = require('../config/db');

// 1. Create a new land listing
exports.createLand = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      area,
      area_unit,
      address,
      city,
      state,
      latitude,
      longitude
    } = req.body;

    if (!title || !price || !address) {
      return res.status(400).json({
        message: 'Title, price and address are required'
      });
    }

    if (Number(price) <= 0 || !Number.isFinite(Number(price))) {
      return res.status(400).json({
        message: 'Price must be greater than zero'
      });
    }

    const [result] = await db.query(
      `INSERT INTO lands
      (owner_id, title, description, price, area, area_unit,
       address, city, state, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        description || null,
        price,
        area || null,
        area_unit || 'sq yards',
        address,
        city || null,
        state || null,
        latitude || null,
        longitude || null
      ]
    );

    res.status(201).json({
      message: 'Land listing created successfully',
      landId: result.insertId
    });
  } catch (error) {
    console.error('Create land error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Get all land listings
exports.getAllLands = async (req, res) => {
  try {
    const [lands] = await db.query(
      `SELECT lands.*, users.name AS owner_name, users.role AS owner_role
       FROM lands
       JOIN users ON lands.owner_id = users.id
       ORDER BY lands.created_at DESC`
    );

    res.status(200).json({
      count: lands.length,
      lands
    });
  } catch (error) {
    console.error('Get lands error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Get one land listing
exports.getLandById = async (req, res) => {
  try {
    const [lands] = await db.query(
      `SELECT lands.*, users.name AS owner_name, users.role AS owner_role
       FROM lands
       JOIN users ON lands.owner_id = users.id
       WHERE lands.id = ?`,
      [req.params.id]
    );

    if (lands.length === 0) {
      return res.status(404).json({
        message: 'Land listing not found'
      });
    }

    res.status(200).json({ land: lands[0] });
  } catch (error) {
    console.error('Get land error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. Update own land listing
exports.updateLand = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      area,
      area_unit,
      address,
      city,
      state,
      latitude,
      longitude,
      status
    } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM lands WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Land listing not found'
      });
    }

    if (existing[0].owner_id !== req.user.id) {
      return res.status(403).json({
        message: 'You can only update your own listings'
      });
    }

    const allowedStatuses = ['Available', 'Sold', 'Inactive'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid listing status'
      });
    }

    if (price !== undefined &&
        (!Number.isFinite(Number(price)) || Number(price) <= 0)) {
      return res.status(400).json({
        message: 'Price must be greater than zero'
      });
    }

    await db.query(
      `UPDATE lands SET
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       price = COALESCE(?, price),
       area = COALESCE(?, area),
       area_unit = COALESCE(?, area_unit),
       address = COALESCE(?, address),
       city = COALESCE(?, city),
       state = COALESCE(?, state),
       latitude = COALESCE(?, latitude),
       longitude = COALESCE(?, longitude),
       status = COALESCE(?, status)
       WHERE id = ?`,
      [
        title ?? null,
        description ?? null,
        price ?? null,
        area ?? null,
        area_unit ?? null,
        address ?? null,
        city ?? null,
        state ?? null,
        latitude ?? null,
        longitude ?? null,
        status ?? null,
        req.params.id
      ]
    );

    res.status(200).json({
      message: 'Land listing updated successfully'
    });
  } catch (error) {
    console.error('Update land error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 5. Delete own land listing
exports.deleteLand = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT * FROM lands WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Land listing not found'
      });
    }

    if (existing[0].owner_id !== req.user.id) {
      return res.status(403).json({
        message: 'You can only delete your own listings'
      });
    }

    await db.query(
      'DELETE FROM lands WHERE id = ?',
      [req.params.id]
    );

    res.status(200).json({
      message: 'Land listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete land error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
