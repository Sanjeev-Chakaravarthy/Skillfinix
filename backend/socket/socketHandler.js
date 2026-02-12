const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const setupSocket = (io, connectedUsers) => {
  // Helper: Process offline deliveries
  const processOfflineDeliveries = async (userId, socket) => {
    try {
      console.log('🚀 PROCESSING OFFLINE DELIVERIES for User:', userId);
      
      const undeliveredMessages = await Message.find({
        receiver: userId,
        delivered: { $ne: true }
      }).populate('sender', '_id name avatar');
      
      if (undeliveredMessages.length === 0) return;
      
      // Update DB
      await Message.updateMany(
        { receiver: userId, delivered: { $ne: true } },
        { $set: { delivered: true, deliveredAt: new Date() } }
      );
      
      // Group by sender
      const messageBySender = {};
      undeliveredMessages.forEach(msg => {
        const senderId = msg.sender._id.toString();
        if (!messageBySender[senderId]) messageBySender[senderId] = [];
        messageBySender[senderId].push(msg);
      });
      
      // Emit receipts
      for (const [senderId, messages] of Object.entries(messageBySender)) {
        const senderSocketId = connectedUsers.get(senderId);
        
        messages.forEach(msg => {
          const deliveryPayload = {
            messageId: msg._id.toString(),
            receiverId: userId.toString()
          };
          
          if (senderSocketId) {
            io.to(senderSocketId).emit('message-delivered', deliveryPayload);
          }
          // Also emit to room
          io.to(senderId).emit('message-delivered', deliveryPayload);
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing offline deliveries:', error);
    }
  };

  io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);

    // Auto-authenticate from handshake
    const handshakeToken = socket.handshake.auth?.token;
    if (handshakeToken) {
      try {
        const decoded = jwt.verify(handshakeToken, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        connectedUsers.set(decoded.id, socket.id);
        
        socket.emit('authenticated', { userId: decoded.id });
        socket.join(String(decoded.id));
        socket.broadcast.emit('user-online', { userId: decoded.id });
        
        setTimeout(() => processOfflineDeliveries(decoded.id, socket), 500);
      } catch (err) {
        console.log('⚠️ Handshake auth failed:', err.message);
      }
    }

    // Manual authentication
    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        connectedUsers.set(decoded.id, socket.id);
        
        socket.emit('authenticated', { userId: decoded.id });
        socket.join(String(decoded.id));
        socket.broadcast.emit('user-online', { userId: decoded.id });
        
        setTimeout(() => processOfflineDeliveries(decoded.id, socket), 500);
      } catch (error) {
        socket.emit('authentication-error', { message: 'Invalid token' });
      }
    });

    socket.on('get-online-users', () => {
      if (socket.userId) {
        const onlineUserIds = Array.from(connectedUsers.keys());
        socket.emit('online-users', { userIds: onlineUserIds });
      }
    });

    socket.on('join-room', (userId) => {
        socket.join(userId);
    });

    socket.on('send-message', async (data) => {
      try {
        if (!data || !data.receiverId || !data.message) return;
        
        const { receiverId, message } = data;
        const receiverSocketId = connectedUsers.get(String(receiverId));
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive-message', message);
          
          // Mark delivered
          await Message.findByIdAndUpdate(message._id, { delivered: true, deliveredAt: new Date() });
          
          const deliveryPayload = {
            messageId: String(message._id),
            receiverId: String(receiverId)
          };
          
          socket.emit('message-delivered', deliveryPayload);
          io.to(String(socket.userId)).emit('message-delivered', deliveryPayload);
        }
      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    });

    socket.on('chat-opened', async (data) => {
        try {
            const { otherUserId } = data;
            const currentUserId = socket.userId;
            
            // Mark messages as delivered from other user
             const undeliveredMessages = await Message.find({
                sender: otherUserId,
                receiver: currentUserId,
                delivered: { $ne: true }
              });

              if (undeliveredMessages.length > 0) {
                 await Message.updateMany(
                    { _id: { $in: undeliveredMessages.map(m => m._id) } },
                    { $set: { delivered: true, deliveredAt: new Date() } }
                 );

                 const senderSocketId = connectedUsers.get(otherUserId);
                 undeliveredMessages.forEach(msg => {
                     const payload = { messageId: msg._id, receiverId: currentUserId };
                     if (senderSocketId) io.to(senderSocketId).emit('message-delivered', payload);
                     io.to(otherUserId).emit('message-delivered', payload);
                 });
              }
        } catch (e) {
            console.error('Error in chat-opened', e);
        }
    });

    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-typing', {
          userId: socket.userId,
          isTyping
        });
      }
    });

    socket.on('mark-as-read', async (data) => {
      try {
        const { senderId } = data;
        const currentUserId = socket.userId;
        
        await Message.updateMany(
          { sender: senderId, receiver: currentUserId, read: false },
          { $set: { read: true, readAt: new Date() } }
        );
        
        const senderSocketId = connectedUsers.get(senderId);
        const readPayload = { senderId, readerId: currentUserId };
        
        if (senderSocketId) io.to(senderSocketId).emit('messages-read', readPayload);
        io.to(senderId).emit('messages-read', readPayload);
        
      } catch (error) {
        console.error('❌ Error marking read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Disconnected:', socket.id);
      if (socket.userId) {
        connectedUsers.delete(String(socket.userId));
        socket.broadcast.emit('user-offline', { userId: socket.userId });
      }
    });
  });
};

module.exports = setupSocket;
