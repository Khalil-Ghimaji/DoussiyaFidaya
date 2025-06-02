// message-service.ts
import { io, Socket } from 'socket.io-client';
import {
  Message,
  DoctorCentricConversation,
  PatientCentricConversation,
  Doctor,
  PatientInfo,
  AttachmentDto, // For sending to backend
  ChatStatistics,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/chat';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'http://localhost:3001'; // Changed from ws:// to http://

let socket: Socket | null = null;
let authToken: string | null = null;

// Helper to construct Headers object for fetch requests
function getRequestHeaders(optionsHeaders?: HeadersInit): Headers {
  const requestHeaders = new Headers(optionsHeaders);
  if (authToken) {
    requestHeaders.set('Authorization', `Bearer ${authToken}`);
  }
  return requestHeaders;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const requestHeaders = getRequestHeaders(options.headers);

  if (!(options.body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: requestHeaders,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    throw new Error(errorData?.message || `API Error: ${response.status}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

// --- WebSocket Management ---
export const connectWebSocket = (tokenToUse: string): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    authToken = tokenToUse;

    if (socket && socket.connected) {
      console.log('WebSocket already connected.');
      resolve(socket);
      return;
    }

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    console.log(`Connecting WebSocket to ${WS_BASE_URL} with provided token.`);

    socket = io(WS_BASE_URL, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'], // Added polling as fallback
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000, // Added timeout
      forceNew: true, // Force new connection
    });

    // Connection success
    socket.on('connect', () => {
      console.log('WebSocket connected:', socket?.id);
      resolve(socket!);
    });

    // Connection error
    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message, err.name);
      reject(new Error(`WebSocket connection failed: ${err.message}`));
    });

    // Disconnection handling
    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        setTimeout(() => {
          if (socket) {
            socket.connect();
          }
        }, 1000);
      }
    });

    // User info received from server
    socket.on('connected_user_info', (userInfo) => {
      console.log('Connected user info received:', userInfo);
    });

    // Handle authentication errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      reject(new Error(`Socket error: ${error}`));
    });

    // Timeout handling
    setTimeout(() => {
      if (socket && !socket.connected) {
        reject(new Error('WebSocket connection timeout'));
      }
    }, 15000); // 15 second timeout
  });
};

export const getSocket = (): Socket | null => socket;

export const disconnectWebSocket = () => {
  if (socket) {
    console.log('Disconnecting WebSocket.');
    socket.removeAllListeners(); // Clean up listeners
    socket.disconnect();
    socket = null;
  }
  authToken = null;
};

// --- WebSocket Emitters ---
export const emitStartTyping = (payload: { receiverId: string; patientId: string }) => {
  if (socket?.connected) {
    socket.emit('startTyping', payload);
  } else {
    console.warn('Cannot emit startTyping: Socket not connected');
  }
};

export const emitStopTyping = (payload: { receiverId: string; patientId: string }) => {
  if (socket?.connected) {
    socket.emit('stopTyping', payload);
  } else {
    console.warn('Cannot emit stopTyping: Socket not connected');
  }
};

export const emitJoinPatientRoom = (payload: { patientId: string; otherDoctorId: string }) => {
  if (socket?.connected) {
    socket.emit('joinPatientRoom', payload);
  } else {
    console.warn('Cannot emit joinPatientRoom: Socket not connected');
  }
};

export const emitLeavePatientRoom = (payload: { patientId: string; otherDoctorId: string }) => {
  if (socket?.connected) {
    socket.emit('leavePatientRoom', payload);
  } else {
    console.warn('Cannot emit leavePatientRoom: Socket not connected');
  }
};

export const emitMarkMessageAsRead = (payload: { messageId: string }) => {
  if (socket?.connected) {
    socket.emit('markAsRead', { messageId: payload.messageId });
  } else {
    console.warn('Cannot emit markAsRead: Socket not connected');
  }
};

export const emitDeleteMessage = (payload: { messageId: string }) => {
  if (socket?.connected) {
    socket.emit('deleteMessage', { messageId: payload.messageId });
  } else {
    console.warn('Cannot emit deleteMessage: Socket not connected');
  }
};

export const emitRequestOnlineDoctors = () => {
  if (socket?.connected) {
    socket.emit('getOnlineDoctors');
  } else {
    console.warn('Cannot emit getOnlineDoctors: Socket not connected');
  }
};

// --- HTTP API Calls ---
export const getDoctorCentricConversations = (): Promise<DoctorCentricConversation[]> => {
  return fetchApi<DoctorCentricConversation[]>('/conversations/doctor-centric');
};

export const getPatientCentricConversations = (): Promise<PatientCentricConversation[]> => {
  return fetchApi<PatientCentricConversation[]>('/conversations/patient-centric');
};

export const getMessages = (
    partnerDoctorId: string,
    patientId: string,
    cursor?: string,
    limit: number = 20
): Promise<{ messages: Message[]; nextCursor?: string }> => {
  let url = `/messages?otherDoctorId=${partnerDoctorId}&patientId=${patientId}&limit=${limit}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }
  return fetchApi<{ messages: Message[]; nextCursor?: string }>(url);
};

export const createMessageHttp = (data: {
  receiverId: string;
  patientId: string;
  content: string;
  attachments?: AttachmentDto[];
}): Promise<Message> => {
  return fetchApi<Message>('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const markMessageAsReadHttp = (messageId: string): Promise<void> => {
  return fetchApi<void>(`/messages/${messageId}/read`, { method: 'POST' });
};

export const deleteMessageHttp = (messageId: string): Promise<void> => {
  return fetchApi<void>(`/messages/${messageId}`, { method: 'DELETE' });
};

export const uploadFiles = async (files: File[]): Promise<AttachmentDto[]> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const requestHeaders = getRequestHeaders();

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: requestHeaders,
    body: formData,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch(e) {
      errorData = { message: response.statusText };
    }
    throw new Error(errorData?.message || `File Upload Error: ${response.status}`);
  }
  const jsonData = await response.json();
  return jsonData as AttachmentDto[];
};

export const searchDoctors = (query: string): Promise<Doctor[]> => {
  return fetchApi<Doctor[]>(`/doctors/search?q=${encodeURIComponent(query)}`);
};

export const searchPatients = (query: string): Promise<PatientInfo[]> => {
  return fetchApi<PatientInfo[]>(`/patients/search?q=${encodeURIComponent(query)}`);
};

export const getDoctorDetails = (doctorId: string): Promise<Doctor> => {
  return fetchApi<Doctor>(`/doctors/${doctorId}`);
};

export const getPatientDetails = (patientId: string): Promise<PatientInfo> => {
  return fetchApi<PatientInfo>(`/patients/${patientId}`);
};

export const getChatStats = (): Promise<ChatStatistics> => {
  return fetchApi<ChatStatistics>('/stats');
};