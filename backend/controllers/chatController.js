const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

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

    // Populate user details and settings
    const conversations = await Promise.all(
      messages.map(async (conv) => {
        const otherUser = await User.findById(conv._id).select('-password');
        if (!otherUser) return null;

        const conversation = await Conversation.findOne({
          participants: { $all: [userId, conv._id] }
        });

        const myUser = await User.findById(userId);
        const isBlocked = (myUser?.blockedUsers || []).some(id => id && id.toString() === conv._id.toString());
        const hasBlockedMe = (otherUser?.blockedUsers || []).some(id => id && id.toString() === userId.toString());

        const mySettings = conversation?.settings?.find(s => s.userId.toString() === userId.toString()) || {};

        return {
          user: otherUser,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          settings: {
            isMuted: mySettings.isMuted || false,
            isFavourite: mySettings.isFavourite || false,
            disappearingTimer: mySettings.disappearingTimer || 0
          },
          isBlocked,
          hasBlockedMe
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
    const { receiverId, text, fileUrl, fileType, fileName, fileMimetype } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 API: Send message request');
    console.log('   Sender:', req.user._id.toString(), '(' + req.user.name + ')');
    console.log('   Receiver:', receiverId);
    console.log('   Text:', text);
    console.log('   FileURL:', fileUrl);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    // Allow messages with fileUrl but no text
    if (!text && !fileUrl) {
      return res.status(400).json({ message: 'Message text or file is required' });
    }

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // CHECK IF BLOCKED
    const sender = await User.findById(req.user._id);
    const isSenderBlocking = (sender.blockedUsers || []).some(id => id && id.toString() === receiverId.toString());
    const isReceiverBlocking = (receiver.blockedUsers || []).some(id => id && id.toString() === req.user._id.toString());

    if (isSenderBlocking) {
      return res.status(403).json({ message: 'You have blocked this user' });
    }
    if (isReceiverBlocking) {
      return res.status(403).json({ message: 'This user has blocked you' });
    }

    // CHECK DISAPPEARING MESSAGES
    let expiresAt = null;
    const conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] }
    });
    
    if (conversation) {
      // Find setting for this user (or just use common timer if we enforce symmetry)
      const setting = conversation.settings.find(s => s.userId.toString() === req.user._id.toString());
      if (setting && setting.disappearingTimer > 0) {
        expiresAt = new Date(Date.now() + setting.disappearingTimer * 1000);
      }
    }

    // ✅ Check if receiver is online
    const connectedUsers = req.app.get('connectedUsers');
    const isReceiverOnline = connectedUsers && connectedUsers.has(receiverId.toString());

    // Create message
    const messageData = {
      sender: req.user._id,
      receiver: receiverId,
      delivered: isReceiverOnline,
      fileType: fileType || 'text'
    };

    if (isReceiverOnline) messageData.deliveredAt = new Date();
    if (text) messageData.text = text.trim();
    if (fileUrl) messageData.fileUrl = fileUrl;
    if (fileName) messageData.fileName = fileName;           // ✅ store original filename
    if (fileMimetype) messageData.fileMimetype = fileMimetype; // ✅ store real MIME type
    if (expiresAt) messageData.expiresAt = expiresAt;

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

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    console.log('✅ File received in buffer:', file.originalname, file.mimetype, file.size, 'bytes');

    const { uploadFileToSupabase } = require('../config/supabase');

    const result = await uploadFileToSupabase(file);
    console.log('✅ File uploaded to Supabase:', result.url);

    // Derive UI fileType from mimetype
    const uiType = file.mimetype.startsWith('image/') ? 'image'
                 : file.mimetype.startsWith('video/') ? 'video'
                 : file.mimetype.startsWith('audio/') ? 'audio'
                 : 'file';

    const fileData = {
      filename: file.originalname,   // ✅ original name with extension
      mimetype: file.mimetype,       // ✅ real MIME type
      url: result.url,               // ✅ Supabase public URL
      type: uiType,
      size: file.size
    };

    res.status(200).json({ files: [fileData] });
  } catch (error) {
    console.error('UPLOAD ERROR:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

// @desc    Mute conversation
// @route   PUT /api/chat/conversations/:id/mute
const muteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, otherUserId],
        settings: [
          { userId: userId, isMuted: true },
          { userId: otherUserId, isMuted: false }
        ]
      });
    } else {
      // PERMISSION CHECK
      if (!conversation.participants.some(p => p.toString() === userId.toString())) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      let userSetting = conversation.settings.find(s => s.userId.toString() === userId.toString());
      if (userSetting) {
        userSetting.isMuted = !userSetting.isMuted;
      } else {
        conversation.settings.push({ userId: userId, isMuted: true });
      }
      await conversation.save();
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error('Mute error:', error);
    res.status(500).json({ message: 'Error updating mute status', error: error.message });
  }
};

// @desc    Favourite conversation
// @route   PUT /api/chat/conversations/:id/favourite
const favouriteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, otherUserId],
        settings: [
          { userId: userId, isFavourite: true },
          { userId: otherUserId, isFavourite: false }
        ]
      });
    } else {
      // PERMISSION CHECK
      if (!conversation.participants.some(p => p.toString() === userId.toString())) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      let userSetting = conversation.settings.find(s => s.userId.toString() === userId.toString());
      if (userSetting) {
        userSetting.isFavourite = !userSetting.isFavourite;
      } else {
        conversation.settings.push({ userId: userId, isFavourite: true });
      }
      await conversation.save();
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error('Favourite error:', error);
    res.status(500).json({ message: 'Error updating favourite status', error: error.message });
  }
};

// @desc    Set disappearing timer
// @route   PUT /api/chat/conversations/:id/disappearing
const setDisappearingTimer = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.id;
    const { timer } = req.body; // in seconds

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, otherUserId],
        settings: [
          { userId: userId, disappearingTimer: timer },
          { userId: otherUserId, disappearingTimer: timer }
        ]
      });
    } else {
      // PERMISSION CHECK
      if (!conversation.participants.some(p => p.toString() === userId.toString())) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      conversation.settings.forEach(s => {
        s.disappearingTimer = timer;
      });
      if (!conversation.settings.find(s => s.userId.toString() === userId.toString())) {
        conversation.settings.push({ userId, disappearingTimer: timer });
      }
      await conversation.save();
    }

    res.json({ success: true, conversation, timer });
  } catch (error) {
    console.error('Disappearing error:', error);
    res.status(500).json({ message: 'Error updating disappearing timer', error: error.message });
  }
};

// @desc    Clear chat messages
// @route   DELETE /api/chat/messages/conversation/:id
const clearChat = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.id;

    // Delete all messages between the two users
    await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    });

    res.json({ success: true, message: 'Chat cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete entire chat
// @route   DELETE /api/chat/conversations/:id
const deleteChat = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.id;

    // Delete all messages
    await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    });

    // Delete the conversation document
    await Conversation.findOneAndDelete({
      participants: { $all: [currentUserId, otherUserId] }
    });

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  uploadFiles,
  muteConversation,
  favouriteConversation,
  setDisappearingTimer,
  clearChat,
  deleteChat
};