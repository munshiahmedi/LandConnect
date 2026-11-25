
const db = require('../config/db');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const senderId = Number(req.user.id);
    const { receiverId, message } = req.body;

    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({
        message: 'Receiver and message are required'
      });
    }

    if (senderId === Number(receiverId)) {
      return res.status(400).json({
        message: 'You cannot message yourself'
      });
    }

    const [users] = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [receiverId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: 'Receiver not found'
      });
    }

    const [result] = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, message)
       VALUES (?, ?, ?)`,
      [senderId, receiverId, message.trim()]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Unable to send message'
    });
  }
};

// Get conversation history between two users
const getConversation = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const otherUserId = Number(req.params.userId);

    const [messages] = await db.query(
      `SELECT id, sender_id, receiver_id, message, is_read, created_at
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [currentUserId, otherUserId, otherUserId, currentUserId]
    );

    await db.query(
      `UPDATE messages
       SET is_read = TRUE
       WHERE sender_id = ? AND receiver_id = ?`,
      [otherUserId, currentUserId]
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      message: 'Unable to load conversation'
    });
  }
};

// Get conversation list
const getConversations = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const [conversations] = await db.query(
      `SELECT
         u.id AS user_id,
         u.name,
         u.role,
         m.message AS last_message,
         m.created_at AS last_message_time,
         (SELECT COUNT(*)
          FROM messages unread
          WHERE unread.sender_id = u.id
            AND unread.receiver_id = ?
            AND unread.is_read = FALSE) AS unread_count
       FROM users u
       INNER JOIN (
         SELECT
           CASE
             WHEN sender_id = ? THEN receiver_id
             ELSE sender_id
           END AS other_user_id,
           MAX(id) AS last_message_id
         FROM messages
         WHERE sender_id = ? OR receiver_id = ?
         GROUP BY other_user_id
       ) latest ON latest.other_user_id = u.id
       INNER JOIN messages m ON m.id = latest.last_message_id
       ORDER BY m.created_at DESC`,
      [userId, userId, userId, userId]
    );

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      message: 'Unable to load conversations'
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations
};
