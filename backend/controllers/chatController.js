const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all unique users this user has chatted with
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Populate user details
    const conversations = await Promise.all(
      messages.map(async (conv) => {
        const user = await User.findById(conv._id).select('-password');
        return {
          user,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        };
      })
    );

    // Filter out null users and sort by last message time
    const validConversations = conversations
      .filter(conv => conv.user)
      .sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );

    res.json(validConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages between two users
// @route   GET /api/chat/messages/:userId
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    console.log('📥 Getting messages between:', {
      current: currentUserId,
      other: otherUserId
    });

    // Validate other user exists
    const otherUser = await User.findById(otherUserId).select('-password');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all messages between these two users
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 });

    console.log('📊 Found', messages.length, 'messages');

    // ✅ Return messages with delivery status based on DB
    const messagesWithStatus = messages.map(msg => ({
      ...msg.toObject(),
      deliveryStatus: msg.read ? 'read' : (msg.delivered ? 'delivered' : 'sent')
    }));

    res.json(messagesWithStatus);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message with optional attachments
// @route   POST /api/chat/messages
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, attachments } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 API: Send message request');
    console.log('   Sender:', req.user._id.toString(), '(' + req.user.name + ')');
    console.log('   Receiver:', receiverId);
    console.log('   Text:', text);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    // Allow messages with attachments but no text
    if (!text && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Message text or attachments are required' });
    }

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // ✅ Check if receiver is online
    const connectedUsers = req.app.get('connectedUsers');
    const isReceiverOnline = connectedUsers && connectedUsers.has(receiverId.toString());

    // Create message
    const messageData = {
      sender: req.user._id,
      receiver: receiverId,
      // ✅ Set delivered: true ONLY if receiver is online
      delivered: isReceiverOnline
    };

    if (isReceiverOnline) {
      messageData.deliveredAt = new Date();
    }

    if (text) {
      messageData.text = text.trim();
    }

    if (attachments && attachments.length > 0) {
      messageData.attachments = attachments;
    }

    const message = await Message.create(messageData);

    // Populate sender and receiver details
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    console.log('✅ Message created in DB:', {
      id: populatedMessage._id,
      from: populatedMessage.sender.name,
      to: populatedMessage.receiver.name,
      delivered: populatedMessage.delivered,
      read: populatedMessage.read
    });

    console.log('✅ Returning message to frontend (delivery handled by socket)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read (✅ WITH SOCKET EMISSION)
// @route   PUT /api/chat/messages/read/:userId
const markAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    console.log('📖 Marking messages as read:', {
      reader: currentUserId.toString(),
      sender: otherUserId
    });

    // Update messages in database
    const result = await Message.updateMany(
      { 
        sender: otherUserId, 
        receiver: currentUserId, 
        read: false 
      },
      { 
        $set: { 
          read: true,
          readAt: new Date()
        } 
      }
    );

    console.log('✅ Updated', result.modifiedCount, 'messages to read status');

    // ✅ CRITICAL: Emit socket event to notify sender
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    if (io && connectedUsers) {
      const senderSocketId = connectedUsers.get(otherUserId.toString());
      
      const payload = {
        senderId: otherUserId.toString(),
        readerId: currentUserId.toString()
      };

      if (senderSocketId) {
        // Primary delivery: direct socket
        io.to(senderSocketId).emit('messages-read', payload);
        console.log('📡 Emitted read receipt to sender socket:', senderSocketId);
      }

      // Fallback delivery: user room (if frontend joined rooms)
      io.to(otherUserId.toString()).emit('messages-read', payload);
      console.log('📡 Emitted read receipt to sender room:', otherUserId.toString());
    } else {
      console.warn('⚠️ Socket.io or connectedUsers not available');
    }

    res.json({ 
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload files for chat
// @route   POST /api/chat/upload
const uploadFiles = async (req, res) => {
  try {
    console.log('📤 File upload request received');
    console.log('Files:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Process uploaded files
    const files = req.files.map(file => {
      console.log('Processing file:', file.originalname, file.mimetype);
      
      return {
        filename: file.originalname,
        url: file.path, // Cloudinary URL
        type: file.mimetype.startsWith('image/') ? 'image' 
            : file.mimetype.startsWith('video/') ? 'video'
            : file.mimetype.startsWith('audio/') ? 'audio'
            : 'file',
        size: file.size
      };
    });

    console.log('✅ Files processed:', files.length);
    res.json({ files });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  uploadFiles
};