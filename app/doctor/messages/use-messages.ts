// use-messages.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Message,
  DoctorCentricConversation,
  PatientCentricConversation,
  Doctor,
  PatientInfo,
  AttachmentDto,
  TypingIndicatorPayload,
} from './types';
import * as messageService from './message-service'; // Use the new service
import { Socket } from 'socket.io-client';

interface UseMessagesReturn {
  doctorCentricConversations: DoctorCentricConversation[];
  patientCentricConversations: PatientCentricConversation[];
  selectedConversation: DoctorCentricConversation | null; // Focus on DoctorCentric for active chat
  messages: Message[];
  loadingMessages: boolean;
  loadingConversations: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';

  onlineDoctors: string[]; // IDs of online doctors
  typingUsers: TypingIndicatorPayload[]; // Users currently typing in focused contexts

  setSelectedConversation: (conversation: DoctorCentricConversation | null) => void;
  loadInitialConversations: () => Promise<void>; // To fetch both types
  sendMessage: (data: {
    content: string;
    receiverId: string; // Partner doctor ID
    patientId: string;
    attachments?: File[];
  }) => Promise<void>;
  deleteMessageHandler: (messageId: string, receiverId: string, patientId: string) => Promise<void>; // Renamed to avoid conflict
  markAsReadHandler: (messageId: string, senderId: string) => Promise<void>; // Renamed

  // Typing indicators for the selected conversation
  handleStartTyping: () => void;
  handleStopTyping: () => void;

  refreshConversations: () => Promise<void>;
  // Add other necessary functions: search, getStats etc. if managed here
}

export function useMessages(loggedInDoctorId: string | null, authToken: string | null): UseMessagesReturn {
  const [doctorCentricConversations, setDoctorCentricConversations] = useState<DoctorCentricConversation[]>([]);
  const [patientCentricConversations, setPatientCentricConversations] = useState<PatientCentricConversation[]>([]);
  const [selectedConversation, setSelectedConversationState] = useState<DoctorCentricConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const [onlineDoctors, setOnlineDoctors] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorPayload[]>([]);

  const socketRef = useRef<Socket | null>(null);

  // Debounce for typing
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = () => setError(null);

  const connect = useCallback(() => {
    if (!authToken || !loggedInDoctorId) {
      setError("Authentication token or doctor ID is missing.");
      setConnectionStatus("error");
      return;
    }
    if (socketRef.current && socketRef.current.connected) return;

    setConnectionStatus('connecting');
    const socket = messageService.connectWebSocket(authToken);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      clearError();
      // Request initial online doctors list
      socket.emit('getOnlineDoctors');
    });
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('connect_error', (err) => {
      setError(`Connection failed: ${err.message}`);
      setConnectionStatus('error');
    });

    // --- WebSocket Event Listeners ---
    socket.on('newMessage', (newMessage: Message) => {
      // Add to messages if it belongs to the selected conversation
      if (selectedConversation && newMessage.patientId === selectedConversation.patient.id &&
          ((newMessage.senderId === selectedConversation.partnerDoctor.id && newMessage.receiverId === loggedInDoctorId) ||
              (newMessage.senderId === loggedInDoctorId && newMessage.receiverId === selectedConversation.partnerDoctor.id) )) {
        setMessages(prev => [newMessage, ...prev]); // Add to top
        // If current user is receiver and window is active, mark as read
        if (newMessage.receiverId === loggedInDoctorId && document.hasFocus()) {
          messageService.emitMarkMessageAsRead({ messageId: newMessage.id }); // senderId not needed for own action
        }
      }
      // Update last message in conversation lists
      setDoctorCentricConversations(prev => prev.map(conv =>
          (conv.patient.id === newMessage.patientId && (conv.partnerDoctor.id === newMessage.senderId || conv.partnerDoctor.id === newMessage.receiverId))
              ? { ...conv, lastMessage: newMessage, unreadCount: newMessage.receiverId === loggedInDoctorId ? (conv.unreadCount + 1) : conv.unreadCount }
              : conv
      ));
      // Similar update for patientCentricConversations
    });

    socket.on('messageSent', (sentMessage: Message) => { // Confirmation for sender
      setMessages(prev => prev.map(m => m.id === sentMessage.id ? sentMessage : (m.id === `temp-${sentMessage.id}` ? sentMessage : m) )); // Replace temp message
    });

    socket.on('messageRead', (data: { messageId: string, readerId: string }) => {
      setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, isRead: true } : m));
      // Update unread counts in conversations if necessary
      setDoctorCentricConversations(prev => prev.map(conv => {
        if (conv.lastMessage?.id === data.messageId && data.readerId === conv.partnerDoctor.id) { // If partner read your message
          return { ...conv, lastMessage: { ...conv.lastMessage, isRead: true } };
        }
        // If you read partner's message, unreadCount should decrease
        if (conv.lastMessage?.id === data.messageId && data.readerId === loggedInDoctorId && conv.unreadCount > 0) {
          //This logic needs to be tied to when you *actually* read it, not just when partner marks it.
          // Unread count decrease is better handled when setSelectedConversation changes or messages are loaded.
        }
        return conv;
      }));
    });

    socket.on('messageDeleted', (data: { messageId: string, patientId: string, doctorIds: string[] }) => {
      setMessages(prev => prev.filter(m => m.id !== data.messageId));
      // Potentially update lastMessage in conversation lists if the deleted one was the last.
    });

    socket.on('typing', (payload: TypingIndicatorPayload) => {
      if (payload.senderId === loggedInDoctorId) return; // Ignore self
      setTypingUsers(prev => {
        const existing = prev.find(u => u.senderId === payload.senderId && u.patientId === payload.patientId);
        if (payload.isTyping) {
          return existing ? prev.map(u => u === existing ? payload : u) : [...prev, payload];
        } else {
          return prev.filter(u => !(u.senderId === payload.senderId && u.patientId === payload.patientId));
        }
      });
    });

    socket.on('doctorOnline', (doctor: { id: string }) => {
      setOnlineDoctors(prev => Array.from(new Set([...prev, doctor.id])));
    });
    socket.on('doctorOffline', (doctor: { id: string }) => {
      setOnlineDoctors(prev => prev.filter(id => id !== doctor.id));
    });
    socket.on('onlineDoctors', (doctors: Array<{id: string}>) => { // Initial list
      setOnlineDoctors(doctors.map(d => d.id));
    });

    // Room specific events (joinedRoom, leftRoom) can be logged or used for UI feedback
    socket.on('joinedRoom', (data: { roomName: string, patientId: string }) => {
      console.log(`Joined room: ${data.roomName} for patient ${data.patientId}`);
    });


    return () => { // Cleanup on unmount or re-connect
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('newMessage');
      socket.off('messageSent');
      socket.off('messageRead');
      socket.off('messageDeleted');
      socket.off('typing');
      socket.off('doctorOnline');
      socket.off('doctorOffline');
      socket.off('onlineDoctors');
      socket.off('joinedRoom');
      // No need to call messageService.disconnectWebSocket() here if the component using the hook unmounts
      // but the app remains. Disconnect should be tied to logout or app closure.
    };
  }, [authToken, loggedInDoctorId, selectedConversation]); // Add other dependencies as needed

  useEffect(() => {
    if (authToken && loggedInDoctorId) {
      connect();
    } else {
      if(socketRef.current) messageService.disconnectWebSocket(); // Disconnect if auth fails
      setConnectionStatus("disconnected");
    }
    // Cleanup function for when the hook itself is unmounted from a component (e.g., user logs out)
    return () => {
      if (socketRef.current) {
        // messageService.disconnectWebSocket(); // Consider if this is the right place.
        // If hook is global, disconnect on logout. If per-page, maybe not.
      }
    };
  }, [authToken, loggedInDoctorId, connect]);


  const loadInitialConversations = useCallback(async () => {
    if (!loggedInDoctorId) return;
    setLoadingConversations(true);
    clearError();
    try {
      const [docCentric, patCentric] = await Promise.all([
        messageService.getDoctorCentricConversations(),
        messageService.getPatientCentricConversations(),
      ]);
      setDoctorCentricConversations(docCentric.map(conv => ({...conv, currentDoctorId: loggedInDoctorId})));
      setPatientCentricConversations(patCentric);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setLoadingConversations(false);
    }
  }, [loggedInDoctorId]);


  const setSelectedConversation = useCallback(async (conversation: DoctorCentricConversation | null) => {
    if (selectedConversation && socketRef.current) { // Leave previous room
      messageService.emitLeavePatientRoom({
        patientId: selectedConversation.patient.id,
        otherDoctorId: selectedConversation.partnerDoctor.id
      });
    }

    setSelectedConversationState(conversation);
    setMessages([]); // Clear previous messages
    setTypingUsers([]); // Clear typing indicators for old convo

    if (conversation && loggedInDoctorId) {
      setLoadingMessages(true);
      clearError();
      try {
        const { messages: fetchedMessages, nextCursor } = await messageService.getMessages(
            conversation.partnerDoctor.id,
            conversation.patient.id
        );
        setMessages(fetchedMessages.reverse()); // Assuming you want newest at bottom

        // Join new room
        if(socketRef.current) {
          messageService.emitJoinPatientRoom({
            patientId: conversation.patient.id,
            otherDoctorId: conversation.partnerDoctor.id
          });
        }

        // Mark messages as read for this conversation
        const unreadMessages = fetchedMessages.filter(m => m.receiverId === loggedInDoctorId && !m.isRead);
        unreadMessages.forEach(m => messageService.emitMarkMessageAsRead({ messageId: m.id }));
        // Update unread count in conversation list
        setDoctorCentricConversations(prev => prev.map(c =>
            c.id === conversation.id ? {...c, unreadCount: 0} : c
        ));

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    }
  }, [loggedInDoctorId, selectedConversation]);

  const sendMessage = useCallback(async (data: {
    content: string;
    receiverId: string; // Partner doctor ID
    patientId: string;
    attachments?: File[];
  }) => {
    if (!socketRef.current || !socketRef.current.connected || !loggedInDoctorId) {
      setError("Not connected. Cannot send message.");
      return;
    }
    clearError();

    let uploadedAttachments: AttachmentDto[] = [];
    if (data.attachments && data.attachments.length > 0) {
      try {
        uploadedAttachments = await messageService.uploadFiles(data.attachments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "File upload failed");
        return;
      }
    }

    const messagePayload = {
      senderId: loggedInDoctorId, // Added by gateway from socket/token
      receiverId: data.receiverId,
      patientId: data.patientId,
      content: data.content,
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
    };

    // Optimistic update (optional, with a temporary ID)
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: data.content,
      senderId: loggedInDoctorId,
      receiverId: data.receiverId,
      patientId: data.patientId,
      timestamp: new Date().toISOString(),
      isRead: false,
      attachments: uploadedAttachments.map(att => ({ // map to MessageAttachment for display
        id: `temp-att-${att.filename}`,
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.size,
        url: URL.createObjectURL(data.attachments!.find(f => f.name === att.filename)!) // Temporary local URL
      }))
    };
    setMessages(prev => [optimisticMessage, ...prev]);


    socketRef.current.emit('sendMessage', messagePayload); // Backend ChatGateway 'sendMessage'
    handleStopTyping(); // Ensure typing indicator is cleared after sending
  }, [loggedInDoctorId]);

  const markAsReadHandler = useCallback(async (messageId: string, originalSenderId: string) => {
    if (!socketRef.current || !socketRef.current.connected) return;
    messageService.emitMarkMessageAsRead({ messageId }); // `senderId` here is the one who sent the message you are reading
    // Optimistic UI update handled by 'messageRead' event listener
  }, []);

  const deleteMessageHandler = useCallback(async (messageId: string, receiverId: string, patientId: string) => {
    if (!socketRef.current || !socketRef.current.connected) return;
    // Backend needs context to notify other client.
    // Let's assume the `deleteMessage` event in gateway handles this, or modify its payload
    messageService.emitDeleteMessage(messageId);
    // Optimistic UI update in 'messageDeleted' listener
  }, []);

  const handleStartTyping = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected || !selectedConversation) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    messageService.emitStartTyping({
      receiverId: selectedConversation.partnerDoctor.id,
      patientId: selectedConversation.patient.id,
    });
  }, [selectedConversation]);

  const handleStopTyping = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected || !selectedConversation) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      messageService.emitStopTyping({
        receiverId: selectedConversation.partnerDoctor.id,
        patientId: selectedConversation.patient.id,
      });
    }, 500); // Send stop typing if no typing for 500ms
  }, [selectedConversation]);


  const refreshConversations = useCallback(async () => {
    await loadInitialConversations();
  }, [loadInitialConversations]);


  return {
    doctorCentricConversations,
    patientCentricConversations,
    selectedConversation,
    messages,
    loadingMessages,
    loadingConversations,
    error,
    connectionStatus,
    onlineDoctors,
    typingUsers,
    setSelectedConversation,
    loadInitialConversations,
    sendMessage,
    deleteMessageHandler,
    markAsReadHandler,
    handleStartTyping,
    handleStopTyping,
    refreshConversations,
  };
}