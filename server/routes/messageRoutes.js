
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
  sendMessage,
  getConversation,
  getConversations
} = require('../controllers/messageController');

// Get all conversations
router.get('/', authMiddleware, getConversations);

// Get chat history with a user
router.get('/:userId', authMiddleware, getConversation);

// Send a message
router.post('/', authMiddleware, sendMessage);

module.exports = router;
