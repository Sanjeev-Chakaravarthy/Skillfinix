import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Mic,
  ArrowLeft,
  X,
  File,
  Download,
  Play,
  Pause,
  Volume2,
  CheckCheck,
  Check,
  Clock,
  AlertCircle,
  User, 
  CheckSquare, 
  BellOff, 
  Timer, 
  Star, 
  Flag, 
  Ban, 
  Trash2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/api/axios";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";
import EmojiPicker from 'emoji-picker-react';

const SkillChat = () => {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const { toast } = useToast();
  const location = useLocation();
  
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Image Preview Modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);
  
  // WhatsApp Header Menu & Modal States
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [clearChatModalOpen, setClearChatModalOpen] = useState(false);
  const [deleteChatModalOpen, setDeleteChatModalOpen] = useState(false);
  
  // Chat features states
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [disappearingTimer, setDisappearingTimer] = useState(0); // 0 = off, else hours
  const [hasBlockedMe, setHasBlockedMe] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState(new Set());
  const [dropdownActionLoading, setDropdownActionLoading] = useState(null); // 'mute', 'fav', etc.
  const headerMenuRef = useRef(null);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const selectedChatRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageClick = (clickedUrl) => {
    // Extract all image URLs from current chat for infinite gallery navigation
    const allImages = messages
      .filter(m => m.fileType === 'image' && m.fileUrl)
      .map(m => ({ url: m.fileUrl }));
    let idx = allImages.findIndex(img => img.url === clickedUrl);
    if (idx < 0) {
      idx = 0;
      setPreviewImages([{ url: clickedUrl }]);
    } else {
      setPreviewImages(allImages);
    }
    setPreviewIndex(idx);
    setPreviewOpen(true);
  };

  // Add Escape key listener for image preview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPreviewOpen(false);
      }
    };

    if (previewOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [previewOpen]);

  // Handle header menu outside click and Escape
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
        setHeaderMenuOpen(false);
      }
    };
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setHeaderMenuOpen(false);
    };

    if (headerMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [headerMenuOpen]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle navigation from Barters page
  useEffect(() => {
    if (location.state?.selectedUserId && location.state?.selectedUserData) {
      const { selectedUserId, selectedUserData } = location.state;
      
      setSelectedChat({
        user: selectedUserData,
        lastMessage: { text: '', createdAt: new Date() },
        unreadCount: 0
      });
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Update ref whenever selectedChat changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Load messages when chat changes
  useEffect(() => {
    if (!selectedChat?.user._id) {
      console.log('📭 No chat selected, clearing messages');
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    const userId = selectedChat.user._id;
    console.log('🔄 CHAT CHANGED - Loading messages for:', userId);
    
    // Reset individual chat feature states to prevent "ghosting" from previous chat
    setIsBlocked(selectedChat.isBlocked || false);
    setHasBlockedMe(selectedChat.hasBlockedMe || false);
    setIsMuted(false);
    setIsFavorite(false);
    setDisappearingTimer(0);
    
    setLoadingMessages(true);
    setMessages([]);
    
    let isCancelled = false;
    
    const loadMessages = async () => {
      try {
        console.log('📥 API Request: Fetching messages for user:', userId);
        const response = await api.get(`/messages/${userId}`);
        
        console.log('📥 API Response: Received', response.data.length, 'messages');
        
        if (!isCancelled && selectedChatRef.current?.user._id === userId) {
          console.log('✅ Setting', response.data.length, 'messages in state');
          setMessages(response.data);
          
          try {
            // Mark messages as read
            await api.put(`/messages/read/${userId}`);
            console.log('✅ Marked messages as read for user:', userId);
            
            // Update conversations
            setConversations(prev => {
              const updated = prev.map(conv => 
                conv.user._id === userId 
                  ? { ...conv, unreadCount: 0 }
                  : conv
              );
              return updated;
            });

            // Sync UI features from conversation data
            // We use the response from fetchConversations if needed, but since we just clicked it, 
            // we can find it in the current conversations list
            const currentConv = conversations.find(c => c.user._id === userId);
            if (currentConv) {
              setIsMuted(currentConv.settings?.isMuted || false);
              setIsFavorite(currentConv.settings?.isFavourite || false);
              setDisappearingTimer(currentConv.settings?.disappearingTimer || 0);
              setIsBlocked(currentConv.isBlocked || false);
              setHasBlockedMe(currentConv.hasBlockedMe || false);
            }
            
            // Emit socket event to notify sender
            if (socket?.connected) {
              console.log('📡 Emitting mark-as-read to socket');
              socket.emit('mark-as-read', { senderId: userId });
            }

            // ✅ NEW: Emit chat-opened event to trigger delivery acknowledgment
            if (socket?.connected) {
              console.log('📡 Emitting chat-opened event');
              socket.emit('chat-opened', { otherUserId: userId });
            }
          } catch (error) {
            console.error('Error marking as read:', error);
          }
          
          setTimeout(() => scrollToBottom(), 100);
        } else {
          console.log('⚠️ Chat changed or effect cancelled, discarding messages');
        }
      } catch (error) {
        console.error('❌ Error fetching messages:', error);
        if (!isCancelled) {
          toast({
            title: "Error",
            description: "Failed to load messages. Please try again.",
            variant: "destructive"
          });
        }
      } finally {
        if (!isCancelled) {
          setLoadingMessages(false);
          // Scroll to bottom after loading messages
          setTimeout(scrollToBottom, 100);
        }
      }
    };

    loadMessages();

    return () => {
      isCancelled = true;
    };
  }, [selectedChat?.user._id]);

  // CHAT ACTIONS HANDLERS
  const handleToggleMute = async () => {
    if (!selectedChat || dropdownActionLoading) return;
    const prevMuted = isMuted;
    try {
      setDropdownActionLoading('mute');
      setIsMuted(!prevMuted); // Optimistic
      const res = await api.put(`/conversations/${selectedChat.user._id}/mute`);
      
      // Sync from server response
      if (res.data.success && res.data.conversation) {
        const mySetting = res.data.conversation.settings.find(s => s.userId.toString() === user._id.toString());
        if (mySetting) setIsMuted(mySetting.isMuted);
      }
      
      toast({ title: !prevMuted ? "Notifications Muted" : "Notifications Unmuted" });
    } catch (error) {
      setIsMuted(prevMuted); // Rollback
      toast({ 
        title: "Error updating mute status", 
        description: error.response?.data?.message || error.message,
        variant: "destructive" 
      });
    } finally {
      setDropdownActionLoading(null);
      setHeaderMenuOpen(false);
    }
  };

  const handleToggleFavourite = async () => {
    if (!selectedChat || dropdownActionLoading) return;
    const prevFav = isFavorite;
    try {
      setDropdownActionLoading('fav');
      setIsFavorite(!prevFav); // Optimistic
      const res = await api.put(`/conversations/${selectedChat.user._id}/favourite`);
      
      // Sync from server response
      if (res.data.success && res.data.conversation) {
        const mySetting = res.data.conversation.settings.find(s => s.userId.toString() === user._id.toString());
        if (mySetting) setIsFavorite(mySetting.isFavourite);
      }

      toast({ title: !prevFav ? "Added to Favourites" : "Removed from Favourites" });
    } catch (error) {
      setIsFavorite(prevFav); // Rollback
      toast({ 
        title: "Error updating favourite status", 
        description: error.response?.data?.message || error.message,
        variant: "destructive" 
      });
    } finally {
      setDropdownActionLoading(null);
      setHeaderMenuOpen(false);
    }
  };

  const handleSetDisappearing = async (timerInHours) => {
    if (!selectedChat || dropdownActionLoading) return;
    const prevTimer = disappearingTimer;
    try {
      setDropdownActionLoading('disappearing');
      const timerInSeconds = timerInHours * 3600;
      setDisappearingTimer(timerInSeconds); // Optimistic
      const res = await api.put(`/conversations/${selectedChat.user._id}/disappearing`, { timer: timerInSeconds });
      
      if (res.data.success && res.data.conversation) {
        const mySetting = res.data.conversation.settings.find(s => s.userId.toString() === user._id.toString());
        if (mySetting) setDisappearingTimer(mySetting.disappearingTimer);
      }

      toast({ title: timerInHours > 0 ? `Disappearing messages set to ${timerInHours}h` : "Disappearing messages disabled" });
    } catch (error) {
      setDisappearingTimer(prevTimer); // Rollback
      toast({ 
        title: "Error updating disappearing messages", 
        description: error.response?.data?.message || error.message,
        variant: "destructive" 
      });
    } finally {
      setDropdownActionLoading(null);
      setHeaderMenuOpen(false);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedChat || dropdownActionLoading) return;
    const prevBlocked = isBlocked;
    const newBlockedState = !prevBlocked;
    const targetUserId = selectedChat.user._id;
    
    try {
      setDropdownActionLoading('block');
      setIsBlocked(newBlockedState); // Optimistic UI
      
      // Update conversations list immediately (Optimistic)
      setConversations(prev => prev.map(c => 
        c.user._id === targetUserId 
          ? { ...c, isBlocked: newBlockedState } 
          : c
      ));

      // Update selectedChat local state if it's the one we're blocking
      if (selectedChat.user._id === targetUserId) {
        setSelectedChat(prev => ({ ...prev, isBlocked: newBlockedState }));
      }

      const res = await api.put(`/users/block/${targetUserId}`);
      
      const confirmedState = res.data.success ? res.data.isBlocked : newBlockedState;
      setIsBlocked(confirmedState);
      
      // Sync confirmed state to everything
      setConversations(prev => prev.map(c => 
        c.user._id === targetUserId 
          ? { ...c, isBlocked: confirmedState } 
          : c
      ));

      if (res.data.success) {
        toast({ title: res.data.message });
      }
      setBlockModalOpen(false);
      setContactModalOpen(false); // WhatsApp closes info when blocking
    } catch (error) {
      console.error('Error blocking user:', error);
      setIsBlocked(prevBlocked); // Rollback
      setConversations(prev => prev.map(c => 
        c.user._id === targetUserId 
          ? { ...c, isBlocked: prevBlocked } 
          : c
      ));
      toast({ 
        title: "Error blocking user", 
        description: error.response?.data?.message || "Failed to update block status",
        variant: "destructive" 
      });
    } finally {
      setDropdownActionLoading(null);
      setHeaderMenuOpen(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedChat || dropdownActionLoading) return;
    try {
      setDropdownActionLoading('clear');
      // No easy way to rollback unless we deep clone messages, but clear is usually a one-way trip
      await api.delete(`/messages/conversation/${selectedChat.user._id}`);
      setMessages([]); 
      toast({ title: "Chat cleared successfully" });
      setClearChatModalOpen(false);
    } catch (error) {
      toast({ 
        title: "Error clearing chat", 
        description: error.response?.data?.message || error.message,
        variant: "destructive" 
      });
    } finally {
      setDropdownActionLoading(null);
      setHeaderMenuOpen(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedChat || dropdownActionLoading) return;
    try {
      setDropdownActionLoading('delete');
      const chatToDelete = selectedChat.user._id;
      await api.delete(`/conversations/${chatToDelete}`);
      setConversations(prev => prev.filter(c => c.user._id !== chatToDelete));
      setSelectedChat(null);
      toast({ title: "Chat deleted", variant: "destructive" });
      setDeleteChatModalOpen(false);
    } catch (error) {
      toast({ 
        title: "Error deleting chat", 
        description: error.response?.data?.message || error.message,
        variant: "destructive" 
      });
    } finally {
      setDropdownActionLoading(null);
      setHeaderMenuOpen(false);
    }
  };

  const handleReportUser = async (reason, blockAndClear) => {
    if (!selectedChat || dropdownActionLoading) return;
    try {
      setDropdownActionLoading('report');
      // 🔥 FIX: Filter out temp messages with tempId to avoid MongoDB ObjectId validation errors
      const validMessages = messages.filter(m => !m.tempId && !m._id.startsWith('temp_'));
      const messageIds = validMessages.slice(-5).map(m => m._id);
      
      await api.post('/reports', {
        reportedUserId: selectedChat.user._id,
        reason: reason || 'Report from SkillChat',
        messageIds
      });

      toast({ 
        title: "User reported", 
        description: blockAndClear ? "User reported, blocked, and chat cleared." : "The admin will review this report." 
      });
      
      setReportModalOpen(false);
      setContactModalOpen(false);

      // If "Block and Clear" was checked, do it now
      if (blockAndClear) {
        // WhatsApp behavior: Block First, Then Clear
        if (!isBlocked) {
          await handleBlockUser(); 
        }
        await handleClearChat();
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      toast({ 
        title: "Error reporting user", 
        description: error.response?.data?.message || "Something went wrong while reporting",
        variant: "destructive" 
      });
    } finally {
      setDropdownActionLoading(null);
      setHeaderMenuOpen(false);
    }
  };

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket?.connected || !user) {
      console.log('⚠️ Socket not ready:', {
        socketExists: !!socket,
        socketConnected: socket?.connected,
        userExists: !!user
      });
      return;
    }

    console.log('✅ Setting up socket listeners for user:', user._id);
    console.log('   Socket ID:', socket.id);

    const handleReceiveMessage = (message) => {
      console.log('📨 Socket: Received message', {
        id: message._id,
        from: message.sender._id,
        to: message.receiver._id,
        text: message.text,
        read: message.read
      });
      
      const currentChat = selectedChatRef.current;
      const isForThisChat = currentChat && (
        (message.sender._id?.toString() === user._id?.toString() &&
         message.receiver._id?.toString() === currentChat.user._id?.toString()) ||
        (message.receiver._id?.toString() === user._id?.toString() &&
         message.sender._id?.toString() === currentChat.user._id?.toString())
      );
      
      if (!isForThisChat) {
        fetchConversations();
      }
      
      if (!currentChat) {
        console.log('⚠️ No chat selected');
        return;
      }
      
      if (isForThisChat) {
        // Prevent adding my own echoed message
        if (message.sender._id?.toString() === user._id?.toString()) {
          return;
        }
        console.log('✅ Adding message to current chat');
        setMessages(prev => {
          const isDuplicate = prev.some(m => m._id === message._id);
          
          if (isDuplicate) {
            console.log('⚠️ Message already exists, skipping');
            return prev;
          }
          
          return [...prev, message];
        });
        
        setTimeout(scrollToBottom, 100);
        
        // Mark as read immediately if from other user
        if (message.sender._id === currentChat.user._id && message.receiver._id === user._id) {
          console.log('📖 Marking received message as read');
          api.put(`/messages/read/${currentChat.user._id}`)
            .then(() => {
              if (socket?.connected) {
                socket.emit('mark-as-read', {
                  senderId: currentChat.user._id
                });
              }
            })
            .catch(console.error);
        }
      } else {
        console.log('⚠️ Message not for current chat, skipping');
      }
    };

    // ✅ FIXED: Handle delivery acknowledgment from server
    const handleMessageDelivered = (data) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📦 message-delivered received');
      console.log('   messageId:', data.messageId);
      console.log('   receiverId:', data.receiverId);

      const messageIdStr = String(data.messageId);

      setMessages(prev => {
        console.log('🔍 Updating delivery status for message:', messageIdStr);

        const updated = prev.map(msg => {
          const msgIdStr = String(msg._id);
          const isSender = String(msg.sender?._id) === String(user?._id);

          if (msgIdStr === messageIdStr && isSender) {
            console.log('   ✅✅ MATCH FOUND - Updating to delivered');
            return {
              ...msg,
              delivered: true, // ✅ Update DB field
              deliveryStatus: 'delivered' // ✅ Update UI status
            };
          }
          return msg;
        });

        const wasUpdated = updated.some((msg, idx) => 
          msg.deliveryStatus !== prev[idx].deliveryStatus
        );

        if (wasUpdated) {
          console.log('✅ Delivery status updated successfully');
        } else {
          console.log('⚠️ Message not found in current chat');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return updated;
      });
    };

    const handleUserTyping = ({ userId, isTyping }) => {
      const currentChat = selectedChatRef.current;
      if (currentChat && userId === currentChat.user._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      }
    };

    const handleUserOnline = ({ userId }) => {
      console.log('🟢 User online:', userId);
      setConversations(prev => [...prev]);
    };

    const handleUserOffline = ({ userId }) => {
      console.log('🔴 User offline:', userId);
      setConversations(prev => [...prev]);
    };
    
    // ✅ Handle read receipts (blue double tick)
    const handleMessagesRead = (data) => {
      console.log('📖 Socket: Messages READ (blue double tick)', data);

      const { senderId, readerId } = data;

      const currentChat = selectedChatRef.current;
      if (!currentChat) return;

      // If the other user read MY messages
      if (senderId === user._id && readerId === currentChat.user._id) {
        console.log('✅ Marking my messages as read in UI');

        setMessages(prev =>
          prev.map(msg =>
            msg.sender._id === user._id && !msg.read
              ? { ...msg, read: true, deliveryStatus: 'read' }
              : msg
          )
        );
      }
    };

    console.log('🎧 Attaching socket event listeners');
    socket.on('receive-message', handleReceiveMessage);
    socket.on('message-delivered', handleMessageDelivered);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-online', handleUserOnline);
    socket.on('user-offline', handleUserOffline);
    socket.on('messages-read', handleMessagesRead);

    return () => {
      console.log('🔴 Removing socket event listeners');
      socket.off('receive-message', handleReceiveMessage);
      socket.off('message-delivered', handleMessageDelivered);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-online', handleUserOnline);
      socket.off('user-offline', handleUserOffline);
      socket.off('messages-read', handleMessagesRead);
    };
  }, [socket?.connected, user]);

  // Scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Handle typing
  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    if (socket?.connected && selectedChat) {
      socket.emit('typing', {
        receiverId: selectedChat.user._id,
        isTyping: true
      });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          receiverId: selectedChat.user._id,
          isTyping: false
        });
      }, 1000);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to server
  const uploadFiles = async (files) => {
    try {
      setUploading(true);
      const formData = new FormData();
      if (files.length > 0) {
        formData.append('file', files[0]);
      }

      const res = await api.post('/messages/upload', formData);

      return res.data.files;
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Handle emoji click
  const handleEmojiClick = (emojiData) => {
    setMessageInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Your browser does not support audio recording');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      streamRef.current = stream;
      
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }
      
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        toast({
          title: "Recording Error",
          description: event.error?.message || "Recording failed",
          variant: "destructive"
        });
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Recording voice message...",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      
      let errorMessage = "Could not access microphone. Please check permissions.";
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Microphone permission denied. Please allow microphone access.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "No microphone found. Please connect a microphone.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Recording Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve();
        return;
      }
      
      const mediaRecorder = mediaRecorderRef.current;
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          toast({
            title: "Recording Failed",
            description: "No audio data was recorded",
            variant: "destructive"
          });
          setIsRecording(false);
          setRecordingTime(0);
          resolve();
          return;
        }
        
        const mimeType = audioChunksRef.current[0].type || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        if (audioBlob.size === 0) {
          toast({
            title: "Recording Failed",
            description: "No audio data recorded",
            variant: "destructive"
          });
          setIsRecording(false);
          setRecordingTime(0);
          resolve();
          return;
        }
        
        setIsRecording(false);
        setRecordingTime(0);
        
        await sendVoiceMessage(audioBlob);
        resolve();
      };
      
      try {
        mediaRecorder.stop();
      } catch (error) {
        console.error('Error stopping recorder:', error);
        setIsRecording(false);
        setRecordingTime(0);
        resolve();
      }
    });
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {};
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
    
    toast({
      title: "Recording Cancelled",
      description: "Voice message discarded",
    });
  };

  const sendVoiceMessage = async (audioBlob) => {
    if (!selectedChat) return;

    // ✅ Declare tempId OUTSIDE try so catch block can reference it
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      setSending(true);
      
      const formData = new FormData();
      let extension = 'webm';
      if (audioBlob.type.includes('ogg')) extension = 'ogg';
      else if (audioBlob.type.includes('mp4')) extension = 'm4a';
      else if (audioBlob.type.includes('mpeg')) extension = 'mp3';
      
      const filename = `voice_${Date.now()}.${extension}`;
      formData.append('file', audioBlob, filename);
      
      const localPreviewUrl = URL.createObjectURL(audioBlob);
      
      const optimisticMessage = {
        _id: tempId,
        tempId,
        sender: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        },
        receiver: {
          _id: selectedChat.user._id,
          name: selectedChat.user.name,
          avatar: selectedChat.user.avatar
        },
        text: '',
        fileUrl: localPreviewUrl,
        fileType: 'audio',
        read: false,
        delivered: false,
        deliveryStatus: 'sending',
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setTimeout(scrollToBottom, 50);
      
      const uploadRes = await api.post('/messages/upload', formData);
      
      if (!uploadRes.data.files?.length) {
        throw new Error('No file URL received from upload');
      }
      
      const uploadedFile = uploadRes.data.files[0];
      
      const messageRes = await api.post('/messages', {
        receiverId: selectedChat.user._id,
        text: '',
        fileUrl: uploadedFile.url,
        fileType: uploadedFile.type
      });
      
      const serverMessage = {
        ...messageRes.data,
        _id: messageRes.data._id.toString(),
        tempId,
        deliveryStatus: messageRes.data.delivered ? 'delivered' : 'sent'
      };
      
      setMessages(prev => 
        prev.map(m => m.tempId === tempId ? serverMessage : m)
      );
      
      // ✅ Wait for state stabilization before socket emit
      setTimeout(() => {
        if (socket?.connected) {
          console.log('📡 Emitting voice message via socket with ID:', serverMessage._id);
          socket.emit('send-message', {
            receiverId: selectedChat.user._id,
            message: serverMessage
          });
        }
      }, 150);
      
      toast({
        title: "Voice Message Sent",
        description: "Your voice message has been sent",
      });
      
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({
        title: "Send Failed",
        description: error.response?.data?.message || "Failed to send voice message.",
        variant: "destructive"
      });
      setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, deliveryStatus: 'failed' } : m));
    } finally {
      setSending(false);
    }
  };

  // ✅ FIXED: Handle send message with DB-based delivery status
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!selectedChat) return;
    if (!messageInput.trim() && selectedFiles.length === 0) return;

    // ✅ Declare tempId OUTSIDE try so catch block can reference it
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      setSending(true);

      let localPreviewUrl = null;
      let uiFileType = 'text';
      let selectedFile = null;

      if (selectedFiles.length > 0) {
        selectedFile = selectedFiles[0];
        localPreviewUrl = URL.createObjectURL(selectedFile);
        if (selectedFile.type.startsWith('image/')) uiFileType = 'image';
        else if (selectedFile.type.startsWith('video/')) uiFileType = 'video';
        else if (selectedFile.type.startsWith('audio/')) uiFileType = 'audio';
        else uiFileType = 'document';
      }

      const messageText = messageInput.trim();

      // ✅ Optimistic message directly to UI
      const optimisticMessage = {
        _id: tempId,
        tempId,
        sender: user,
        receiver: selectedChat.user,
        text: messageText,
        fileUrl: localPreviewUrl,
        fileType: uiFileType,
        read: false,
        delivered: false,
        deliveryStatus: 'sending',
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setMessageInput('');
      setSelectedFiles([]); // clear local blob
      setTimeout(scrollToBottom, 50);

      let fileUrl = null;
      let finalFileType = uiFileType;
      let finalFileName = selectedFile?.name || null;
      let finalMimetype = selectedFile?.type || null;

      if (selectedFile) {
        const uploadedFiles = await uploadFiles([selectedFile]);
        if (uploadedFiles.length > 0) {
          fileUrl        = uploadedFiles[0].url;
          finalFileType  = uploadedFiles[0].type || uiFileType;
          finalFileName  = uploadedFiles[0].filename || finalFileName;  // ✅ from server
          finalMimetype  = uploadedFiles[0].mimetype || finalMimetype;  // ✅ from server
        }
      }

      // ✅ API call
      const res = await api.post('/messages', {
        receiverId: selectedChat.user._id,
        text: messageText,
        fileUrl,
        fileType:     finalFileType,
        fileName:     finalFileName,     // ✅ stored in DB
        fileMimetype: finalMimetype,     // ✅ stored in DB
      });

      const serverMessage = {
        ...res.data,
        _id: res.data._id.toString(),
        tempId,
        deliveryStatus: res.data.delivered ? 'delivered' : 'sent'
      };

      // ✅ Replace temp message
      setMessages(prev =>
        prev.map(m => (m.tempId === tempId ? serverMessage : m))
      );
      console.log('   Delivered status:', serverMessage.delivered);

      // ✅ CRITICAL: Wait for state update before emitting socket
      setTimeout(() => {
        if (socket?.connected) {
          console.log('📡 Emitting via socket with ID:', serverMessage._id);
          socket.emit('send-message', {
            receiverId: selectedChat.user._id,
            message: serverMessage
          });
        }
      }, 150);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, deliveryStatus: 'failed' } : m));
    } finally {
      setSending(false);
    }
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format recording time
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 rounded-full animate-spin border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 bg-background rounded-2xl border border-border overflow-hidden">
      {/* Conversations List */}
      <div className={cn(
        "w-full md:w-80 shrink-0 border-r border-border flex flex-col bg-card",
        selectedChat && "hidden md:flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="mb-3 text-xl font-bold text-foreground">Messages</h2>
          <div className="relative">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Start chatting with someone!</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.user._id}
                onClick={() => {
                  console.log('🖱️ Clicked on conversation:', conv.user._id);
                  setSelectedChat(conv);
                }}
                className={cn(
                  "p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50",
                  selectedChat?.user._id === conv.user._id && "bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={(conv.isBlocked || conv.hasBlockedMe) ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' : conv.user.avatar}
                      alt={conv.user.name}
                      className="object-cover w-12 h-12 rounded-full grayscale-[0.5]"
                    />
                    {isOnline(conv.user._id) && !conv.isBlocked && !conv.hasBlockedMe && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 rounded-full border-card"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate text-foreground">
                        {conv.user.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm truncate text-muted-foreground">
                        {conv.lastMessage.text || 
                         (conv.lastMessage.fileUrl ? 
                          conv.lastMessage.fileType === 'audio' ? '🎤 Voice message' :
                          conv.lastMessage.fileType === 'image' ? '📷 Image' :
                          conv.lastMessage.fileType === 'video' ? '🎥 Video' :
                          '📎 File' : 
                          'No messages yet')}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="p-2 transition-colors rounded-lg md:hidden hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <img
                  src={(isBlocked || hasBlockedMe) ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' : selectedChat.user.avatar}
                  alt={selectedChat.user.name}
                  className="object-cover w-10 h-10 rounded-full grayscale-[0.3]"
                />
                {isOnline(selectedChat.user._id) && !isBlocked && !hasBlockedMe && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 rounded-full border-card"></div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-foreground leading-tight cursor-pointer hover:text-primary transition-colors" onClick={() => setContactModalOpen(true)}>
                  {selectedChat.user.name}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {(isOnline(selectedChat.user._id) && !isBlocked && !hasBlockedMe) ? (
                    <span className="flex items-center gap-1 text-green-500 font-medium">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  ) : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 transition-colors rounded-lg hover:bg-muted">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 transition-colors rounded-lg hover:bg-muted">
                <Video className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="relative" ref={headerMenuRef}>
                <button 
                  className="p-2 transition-colors rounded-lg hover:bg-muted"
                  onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                >
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
                
                {/* WhatsApp Style Dropdown Menu */}
                {headerMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-card border border-border/50 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col items-stretch">
                    <button 
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-sm text-foreground text-left"
                      onClick={() => { setHeaderMenuOpen(false); setContactModalOpen(true); }}
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      Contact Info
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-sm text-foreground text-left"
                      onClick={() => { setHeaderMenuOpen(false); setSelectionMode(true); setSelectedMessageIds(new Set()); toast({ title: "Select messages mode enabled" }); }}
                    >
                      <CheckSquare className="w-4 h-4 text-muted-foreground" />
                      Select Messages
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted transition-colors text-sm text-foreground text-left disabled:opacity-50"
                      disabled={!!dropdownActionLoading}
                      onClick={handleToggleMute}
                    >
                      <div className="flex items-center gap-3">
                        <BellOff className="w-4 h-4 text-muted-foreground" />
                        {isMuted ? "Unmute Notifications" : "Mute Notifications"}
                      </div>
                      {dropdownActionLoading === 'mute' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted transition-colors text-sm text-foreground text-left disabled:opacity-50"
                      disabled={!!dropdownActionLoading}
                      onClick={() => handleSetDisappearing(disappearingTimer === 0 ? 24 : 0)}
                    >
                      <div className="flex items-center gap-3">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        Disappearing Messages
                      </div>
                      {dropdownActionLoading === 'disappearing' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted transition-colors text-sm text-foreground text-left disabled:opacity-50"
                      disabled={!!dropdownActionLoading}
                      onClick={handleToggleFavourite}
                    >
                      <div className="flex items-center gap-3">
                        <Star className={cn("w-4 h-4 shadow-sm", isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                        {isFavorite ? "Remove from Favourites" : "Add to Favourites"}
                      </div>
                      {dropdownActionLoading === 'fav' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-sm text-foreground text-left border-b border-border/50 pb-3 mb-1"
                      onClick={() => { setHeaderMenuOpen(false); setSelectedChat(null); }}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                      Close Chat
                    </button>
                    
                    <button 
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-sm text-foreground text-left mt-1"
                      onClick={() => { setHeaderMenuOpen(false); setReportModalOpen(true); }}
                    >
                      <Flag className="w-4 h-4 text-muted-foreground" />
                      Report
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted transition-colors text-sm text-foreground text-left disabled:opacity-50"
                      disabled={!!dropdownActionLoading}
                      onClick={() => setBlockModalOpen(true)}
                    >
                      <div className="flex items-center gap-3">
                        <Ban className="w-4 h-4 text-muted-foreground" />
                        {isBlocked ? "Unblock" : "Block"}
                      </div>
                      {dropdownActionLoading === 'block' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted transition-colors text-sm text-foreground text-left disabled:opacity-50"
                      disabled={!!dropdownActionLoading}
                      onClick={() => setClearChatModalOpen(true)}
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                        Clear Chat
                      </div>
                      {dropdownActionLoading === 'clear' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted transition-colors text-sm text-red-500 font-medium text-left group disabled:opacity-50"
                      disabled={!!dropdownActionLoading}
                      onClick={() => setDeleteChatModalOpen(true)}
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                        Delete Chat
                      </div>
                      {dropdownActionLoading === 'delete' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-w-0 p-4 pb-20 space-y-4 overflow-y-auto bg-muted/10">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 rounded-full animate-spin border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMe = message.sender._id?.toString() === user._id?.toString();
                const isRead = message.read;
                const deliveryStatus = message.deliveryStatus || (
                  isRead ? 'read' : (message.delivered ? 'delivered' : 'sent')
                );
                
                return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex gap-2 group transition-all",
                      isMe ? "justify-end" : "justify-start",
                      selectionMode && "cursor-pointer"
                    )}
                    onClick={() => {
                      if (selectionMode) {
                        const newSelection = new Set(selectedMessageIds);
                        if (newSelection.has(message._id)) {
                          newSelection.delete(message._id);
                        } else {
                          newSelection.add(message._id);
                        }
                        setSelectedMessageIds(newSelection);
                      }
                    }}
                  >
                    {selectionMode && (
                      <div className="flex items-center self-center px-2">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedMessageIds.has(message._id) 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground/30"
                        )}>
                          {selectedMessageIds.has(message._id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    )}
                    {!isMe && !selectionMode && (
                      <img
                        src={(isBlocked || hasBlockedMe) ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' : message.sender.avatar}
                        alt={message.sender.name}
                        className={cn(
                          "object-cover w-8 h-8 rounded-full",
                          (isBlocked || hasBlockedMe) && "grayscale-[0.5]"
                        )}
                      />
                    )}
                    <div className={cn(
                      "max-w-[70%] space-y-1",
                      isMe && "items-end"
                    )}>
                      {message.fileUrl && (
                        <div className="space-y-2">
                          <AttachmentPreview 
                            attachment={{
                              url: message.fileUrl,
                              type: message.fileType,
                              filename: message.fileName || message.fileUrl.split('/').pop(),
                              mimetype: message.fileMimetype || null,
                            }} 
                            isMe={isMe}
                            onImageClick={handleImageClick}
                          />
                        </div>
                      )}
                      {message.text && (
                        <div
                          className={cn(
                            "px-4 py-2 rounded-2xl",
                            isMe
                              ? "gradient-primary text-primary-foreground"
                              : "bg-card text-foreground border border-border"
                          )}
                        >
                          <p className="text-sm break-words whitespace-pre-wrap">
                            {message.text}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 px-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.createdAt)}
                        </span>
                        {/* ✅ WHATSAPP-STYLE DELIVERY STATUS */}
                        {isMe && (
                          <span>
                            {deliveryStatus === 'read' || isRead ? (
                              <CheckCheck className="w-3 h-3 text-blue-500" />
                            ) : deliveryStatus === 'delivered' ? (
                              <CheckCheck className="w-3 h-3 text-gray-400" />
                            ) : deliveryStatus === 'sending' ? (
                              <Clock className="w-3 h-3 text-gray-400" />
                            ) : deliveryStatus === 'failed' ? (
                              <AlertCircle className="w-3 h-3 text-red-500" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    {isMe && (
                      <img
                        src={message.sender.avatar}
                        alt={message.sender.name}
                        className="object-cover w-8 h-8 rounded-full"
                      />
                    )}
                  </div>
                );
              })
            )}
            
            {/* Typing Indicator */}
            {selectedChat && typingUsers.has(selectedChat.user._id) && (
              <div className="fixed bottom-[100px] left-4 right-4 md:left-[calc(320px+16px)] flex items-center gap-2 z-10">
                <img
                  src={selectedChat.user.avatar}
                  alt={selectedChat.user.name}
                  className="object-cover w-8 h-8 rounded-full"
                />
                <div className="px-4 py-2 border shadow-lg rounded-2xl bg-card border-border">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Selection Mode Bulk Actions */}
            {selectionMode && selectedMessageIds.size > 0 && (
              <div className="fixed bottom-[100px] right-20 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
                <button 
                  onClick={() => setSelectionMode(false)}
                  className="px-4 py-2 bg-muted text-foreground rounded-full shadow-lg hover:bg-muted/80 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const ids = Array.from(selectedMessageIds);
                      // In a real app, you'd have a bulk delete endpoint
                      // For now, let's just update local state and toast
                      setMessages(prev => prev.filter(m => !selectedMessageIds.has(m._id)));
                      setSelectionMode(false);
                      setSelectedMessageIds(new Set());
                      toast({ title: `${ids.length} messages deleted` });
                    } catch (e) {
                      toast({ title: "Error deleting messages", variant: "destructive" });
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete for me
                </button>
              </div>
            )}

            {/* WhatsApp Style Block/Unblock System Messages */}
            {isBlocked && (
              <div className="flex justify-center my-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="px-5 py-2 rounded-xl bg-orange-100/80 dark:bg-orange-950/40 text-[11px] font-medium text-orange-800 dark:text-orange-200 border border-orange-200/50 dark:border-orange-800/30 shadow-sm flex flex-col items-center gap-1 backdrop-blur-sm max-w-[80%] text-center">
                  <div className="flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" />
                    <span>You blocked this contact. Messages cannot be sent.</span>
                  </div>
                  <button 
                    onClick={() => setBlockModalOpen(true)}
                    className="text-primary font-bold hover:underline transition-colors mt-0.5"
                  >
                    Tap to unblock
                  </button>
                </div>
              </div>
            )}

            {hasBlockedMe && (
              <div className="flex justify-center my-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="px-5 py-2 rounded-xl bg-muted/60 text-[11px] font-medium text-muted-foreground border border-border/50 shadow-sm flex items-center gap-2 backdrop-blur-sm max-w-[80%] text-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>This contact has blocked you. You cannot see their status or send messages.</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="p-3 border-t border-border bg-muted/20">
              <div className="flex gap-2 overflow-x-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <div className="relative w-20 h-20">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="object-cover w-full h-full rounded-lg"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-0 right-0 p-1 text-white transition-colors bg-red-500 rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative flex items-center gap-2 px-3 py-2 border rounded-lg bg-card border-border">
                        <File className="w-4 h-4" />
                        <span className="text-sm truncate max-w-[100px]">
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 ml-2 transition-colors rounded-full hover:bg-muted"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div className="p-4 border-t border-border bg-destructive/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/20 animate-pulse">
                    <Mic className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Recording...</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRecordingTime(recordingTime)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={cancelRecording}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={stopRecording}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-border bg-card"
          >
            <div className="flex items-center gap-2">
              {/* File Upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 transition-colors rounded-lg hover:bg-muted"
                disabled={uploading || isRecording || isBlocked || hasBlockedMe}
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Image Upload */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 transition-colors rounded-lg hover:bg-muted"
                disabled={uploading || isRecording || isBlocked || hasBlockedMe}
              >
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Message Input Field */}
              <div className="relative flex-1">
                {isBlocked ? (
                  <div className="w-full h-11 bg-muted/30 border border-border rounded-xl flex items-center justify-center gap-2 text-sm text-muted-foreground transition-all animate-in fade-in slide-in-from-bottom-2">
                    <span>You blocked this contact.</span>
                    <button 
                      type="button" 
                      onClick={() => setBlockModalOpen(true)}
                      className="text-primary font-medium hover:underline px-2 py-1 rounded hover:bg-primary/5 transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                ) : hasBlockedMe ? (
                   <div className="w-full h-11 bg-muted/30 border border-border rounded-xl flex items-center justify-center text-sm text-muted-foreground italic transition-all animate-in fade-in slide-in-from-bottom-2">
                    This contact has blocked you
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      className="w-full pl-4 pr-12 border h-11 bg-muted/50 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      disabled={sending || uploading || isRecording}
                    />
                    
                    {/* Emoji Picker Button */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute -translate-y-1/2 right-3 top-1/2"
                      disabled={isRecording}
                    >
                      <Smile className="w-5 h-5 transition-colors text-muted-foreground hover:text-foreground" />
                    </button>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div 
                        ref={emojiPickerRef}
                        className="absolute right-0 z-50 mb-2 bottom-full"
                      >
                        <EmojiPicker 
                          onEmojiClick={handleEmojiClick}
                          theme="auto"
                          width={320}
                          height={400}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Voice Recording */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isRecording ? "bg-destructive text-white animate-pulse" : "hover:bg-muted"
                )}
                disabled={sending || uploading || isBlocked || hasBlockedMe}
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!messageInput.trim() && selectedFiles.length === 0) || sending || uploading || isRecording || isBlocked || hasBlockedMe}
                className={cn(
                  "p-2.5 rounded-xl gradient-primary text-primary-foreground shadow-md hover:shadow-lg transition-all",
                  ((!messageInput.trim() && selectedFiles.length === 0) || sending || uploading || isRecording || isBlocked || hasBlockedMe) && "opacity-50 cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 border-2 rounded-full animate-spin border-primary border-t-transparent"></div>
                Uploading files...
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="items-center justify-center flex-1 hidden md:flex">
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-muted">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Select a conversation
            </h3>
            <p className="text-muted-foreground">
              Choose a chat to start messaging
            </p>
          </div>
        </div>
      )}

      {/* Internal Modal Lightbox - Rendered via Portal for true fullscreen takeover */}
      {previewOpen && previewImages.length > 0 && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black cursor-pointer animate-in fade-in zoom-in-95 duration-200"
          onClick={() => setPreviewOpen(false)}
        >
          <button
            className="absolute p-2 text-3xl text-white transition-opacity top-4 right-6 hover:opacity-75 z-[10000]"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewOpen(false);
            }}
          >
            ✕
          </button>
          
          {previewImages.length > 1 && (
            <button
              className="absolute p-4 text-4xl text-white transition-opacity left-4 hover:opacity-75 z-[10000]"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex(i => i > 0 ? i - 1 : i);
              }}
            >
              ‹
            </button>
          )}

          <div className="relative max-h-screen max-w-full flex items-center justify-center p-4">
            <img
              src={previewImages[previewIndex].url}
              className="max-h-[95vh] max-w-[95vw] rounded-sm shadow-2xl object-contain cursor-default select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {previewImages.length > 1 && (
            <button
              className="absolute p-4 text-4xl text-white transition-opacity right-4 hover:opacity-75 z-[10000]"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex(i => i < previewImages.length - 1 ? i + 1 : i);
              }}
            >
              ›
            </button>
          )}
        </div>,
        document.getElementById("modal-root")
      )}

      {/* WhatsApp Menu Modals - Rendered via Portal */}
      {contactModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-in fade-in duration-200" onClick={() => setContactModalOpen(false)}>
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-muted p-8 flex flex-col items-center justify-center relative">
              <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onClick={() => setContactModalOpen(false)}><X className="w-5 h-5" /></button>
              <img src={(isBlocked || hasBlockedMe) ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png' : selectedChat?.user?.avatar} alt={selectedChat?.user?.name} className="w-24 h-24 rounded-full object-cover border-4 border-card shadow-lg grayscale-[0.2]" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">{selectedChat?.user?.name}</h2>
              <p className="text-sm text-muted-foreground">{(isOnline(selectedChat?.user?._id) && !isBlocked && !hasBlockedMe) ? 'Online' : 'Offline'}</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">About</p>
                <p className="text-sm text-foreground">
                  {(isBlocked || hasBlockedMe) ? 'Status unavailable' : 'Using Skillfinix for collaboration & learning.'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl overflow-hidden">
                <button 
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors flex justify-between items-center border-b border-border/50"
                  onClick={() => { setContactModalOpen(false); setBlockModalOpen(true); }}
                >
                  <span>{isBlocked ? "Unblock contact" : "Block contact"}</span>
                  <Ban className="w-4 h-4 text-red-500" />
                </button>
                <button 
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-muted transition-colors flex justify-between items-center"
                  onClick={() => { setContactModalOpen(false); setReportModalOpen(true); }}
                >
                  <span>Report contact</span>
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById("modal-root")
      )}

      {reportModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-in fade-in duration-200" onClick={() => setReportModalOpen(false)}>
          <div className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-foreground mb-4">Report {selectedChat?.user?.name}?</h3>
            <p className="text-sm text-muted-foreground mb-4">The last 5 messages from this contact will be forwarded to Skillfinix. This contact will not be notified.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Reason for report</label>
                <select 
                  id="report-reason"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Spam">Spam</option>
                  <option value="Abuse">Abuse or Harassment</option>
                  <option value="Inappropriate">Inappropriate Content</option>
                  <option value="Scam">Scam or Fraud</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                <input type="checkbox" id="block-and-report" className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer" />
                <label htmlFor="block-and-report" className="text-sm text-foreground cursor-pointer select-none">Block contact and clear chat</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 font-medium">
              <button className="px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors" onClick={() => setReportModalOpen(false)}>Cancel</button>
              <button 
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50"
                disabled={dropdownActionLoading === 'report'}
                onClick={() => {
                  const reason = document.getElementById('report-reason')?.value;
                  const block = document.getElementById('block-and-report')?.checked;
                  handleReportUser(reason, block);
                }}
              >
                Report
              </button>
            </div>
          </div>
        </div>,
        document.getElementById("modal-root")
      )}

      {blockModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-in fade-in duration-200" onClick={() => setBlockModalOpen(false)}>
          <div className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-foreground mb-2">Block {selectedChat?.user?.name}?</h3>
            <p className="text-sm text-muted-foreground mb-6">Blocked contacts will no longer be able to call you or send you messages.</p>
            <div className="flex justify-end gap-3 font-medium">
              <button className="px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors" onClick={() => setBlockModalOpen(false)}>Cancel</button>
              <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90 hover:shadow-md" onClick={handleBlockUser}>{isBlocked ? "Unblock" : "Block"}</button>
            </div>
          </div>
        </div>,
        document.getElementById("modal-root")
      )}

      {clearChatModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-in fade-in duration-200" onClick={() => setClearChatModalOpen(false)}>
          <div className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-foreground mb-2">Clear this chat?</h3>
            <p className="text-sm text-muted-foreground mb-6">Messages will be removed for you. The other participant will still see them.</p>
            <div className="flex items-center gap-2 mb-6">
              <input type="checkbox" id="delete-media" className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary" defaultChecked />
              <label htmlFor="delete-media" className="text-sm text-foreground">Also delete media received in this chat</label>
            </div>
            <div className="flex justify-end gap-3 font-medium">
              <button className="px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors" onClick={() => setClearChatModalOpen(false)}>Cancel</button>
              <button className="px-5 py-2 bg-red-500 text-white rounded-lg transition-all hover:bg-red-600 hover:shadow-md" onClick={handleClearChat}>Clear chat</button>
            </div>
          </div>
        </div>,
        document.getElementById("modal-root")
      )}

      {deleteChatModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-in fade-in duration-200" onClick={() => setDeleteChatModalOpen(false)}>
          <div className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-foreground mb-2">Delete chat with {selectedChat?.user?.name}?</h3>
            <p className="text-sm text-muted-foreground mb-6">This chat will be completely removed from your history.</p>
            <div className="flex justify-end gap-3 font-medium">
              <button className="px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors" onClick={() => setDeleteChatModalOpen(false)}>Cancel</button>
              <button className="px-5 py-2 bg-red-500 text-white rounded-lg transition-all hover:bg-red-600 hover:shadow-md" onClick={handleDeleteChat}>Delete chat</button>
            </div>
          </div>
        </div>,
        document.getElementById("modal-root")
      )}
    </div>
  );
};

// Attachment Preview Component
const AttachmentPreview = ({ attachment, isMe, onImageClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (attachment.type === 'image') {
    return (
      <div 
        onClick={() => onImageClick && onImageClick(attachment.url)} 
        className="block"
      >
        <img 
          src={attachment.url} 
          alt="Attachment" 
          className="max-w-full transition-opacity rounded-xl cursor-pointer hover:opacity-90 border border-border/50 shadow-sm"
          style={{ maxHeight: '300px' }}
        />
      </div>
    );
  }

  if (attachment.type === 'video') {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-black shadow-sm">
        <video 
          src={attachment.url} 
          controls 
          className="max-w-full max-h-[300px] object-contain"
        />
      </div>
    );
  }

  if (attachment.type === 'audio') {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl min-w-[240px] shadow-sm",
        isMe ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
      )}>
        <button
          onClick={handlePlayPause}
          className={cn(
            "p-3 rounded-full flex shrink-0 transition-transform active:scale-95",
            isMe ? "bg-white/20 hover:bg-white/30 text-white" : "bg-primary/10 hover:bg-primary/20 text-primary"
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
          )}
        </button>
        <audio 
          ref={audioRef} 
          src={attachment.url} 
          onEnded={() => setIsPlaying(false)} 
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          className="hidden"
        />
        <div className="flex items-center flex-1 gap-1">
          {/* Fake waveform for WhatsApp style */}
          {[2, 4, 3, 5, 2, 6, 3, 4, 2, 5].map((h, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1 rounded-full transition-all duration-200",
                isPlaying ? "animate-pulse" : "opacity-70",
                isMe ? "bg-primary-foreground" : "bg-primary"
              )} 
              style={{ height: `${h * 4}px`, opacity: isPlaying ? Math.random() * 0.5 + 0.5 : 0.4 }}
            />
          ))}
          <div className="flex-1" />
        </div>
        {attachment.size && (
          <span className="text-[10px] opacity-70 ml-2">
            {(attachment.size / 1024 / 1024).toFixed(1)}MB
          </span>
        )}
      </div>
    );
  }

  // Generic document or file
  const isPdf =
    attachment.filename?.toLowerCase().endsWith('.pdf') ||
    attachment.url?.toLowerCase().includes('.pdf');

  const handleOpen = (e) => {
    e.preventDefault();
    const filename = attachment.filename || attachment.url?.split('/').pop() || 'file';
    // For Supabase (and any direct public URL): open in new tab.
    // The browser will download it if Content-Disposition: attachment is set,
    // or display it inline (e.g. images). Either way no blank page.
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };


  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl shadow-sm border",
      isMe ? "bg-primary/10 border-primary/20 text-foreground" : "bg-card border-border text-foreground"
    )}>
      <div className={cn(
        "p-2.5 rounded-lg flex shrink-0",
        isMe ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <File className="w-5 h-5" />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium truncate max-w-[180px]">
          {attachment.filename || 'Document File'}
        </span>
        {attachment.size && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {(attachment.size / 1024).toFixed(0)} KB • {attachment.filename?.split('.').pop()?.toUpperCase()}
          </span>
        )}
      </div>
      {/* ✅ Click → always downloads via Cloudinary fl_attachment flag */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
          isMe ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted hover:bg-muted/80 text-foreground"
        )}
        title="Download File"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SkillChat;