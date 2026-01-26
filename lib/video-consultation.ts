import AsyncStorage from "@react-native-async-storage/async-storage";

const CALLS_KEY = "video_calls";
const RECORDINGS_KEY = "call_recordings";
const CALL_NOTES_KEY = "call_notes";

export type CallStatus = "waiting" | "connecting" | "connected" | "ended" | "failed";
export type CallQuality = "excellent" | "good" | "fair" | "poor";
export type ConnectionType = "video" | "audio" | "screen";

export interface VideoCall {
  id: string;
  bookingId: string;
  expertId: string;
  userId: string;
  status: CallStatus;
  startTime?: string;
  endTime?: string;
  duration?: number; // seconds
  quality: CallQuality;
  recordingEnabled: boolean;
  recordingConsent: boolean;
  screenShareEnabled: boolean;
  chatEnabled: boolean;
  networkIssues: NetworkIssue[];
  participantFeedback?: ParticipantFeedback;
}

export interface NetworkIssue {
  timestamp: string;
  type: "packet_loss" | "low_bandwidth" | "high_latency" | "connection_drop";
  severity: "low" | "medium" | "high";
  resolved: boolean;
  action?: string; // e.g., "switched to audio-only"
}

export interface ParticipantFeedback {
  callId: string;
  userId: string;
  rating: number; // 1-5
  audioQuality: number; // 1-5
  videoQuality: number; // 1-5
  overallExperience: number; // 1-5
  comments?: string;
  timestamp: string;
}

export interface CallRecording {
  id: string;
  callId: string;
  bookingId: string;
  duration: number; // seconds
  fileSize: number; // bytes
  format: "mp4" | "webm";
  storageUrl: string;
  thumbnailUrl?: string;
  createdDate: string;
  expiryDate?: string;
  accessCount: number;
  lastAccessedDate?: string;
}

export interface CallNotes {
  id: string;
  callId: string;
  bookingId: string;
  authorId: string;
  authorType: "expert" | "user";
  content: string;
  tags: string[];
  createdDate: string;
  updatedDate?: string;
}

export interface ChatMessage {
  id: string;
  callId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  videoConstraints: MediaTrackConstraints;
  audioConstraints: MediaTrackConstraints;
}

export interface CallStatistics {
  callId: string;
  avgBitrate: number; // kbps
  avgLatency: number; // ms
  packetLoss: number; // percentage
  jitter: number; // ms
  resolution: string; // e.g., "1280x720"
  frameRate: number; // fps
  audioCodec: string;
  videoCodec: string;
}

/**
 * Get WebRTC configuration
 */
export function getWebRTCConfig(): WebRTCConfig {
  return {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      // In production, add TURN servers for NAT traversal
      // {
      //   urls: "turn:turn.example.com:3478",
      //   username: "user",
      //   credential: "pass"
      // }
    ],
    videoConstraints: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
      facingMode: "user",
    },
    audioConstraints: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  };
}

/**
 * Create video call
 */
export async function createVideoCall(
  bookingId: string,
  expertId: string,
  userId: string,
  options: {
    recordingEnabled?: boolean;
    recordingConsent?: boolean;
    screenShareEnabled?: boolean;
    chatEnabled?: boolean;
  } = {}
): Promise<VideoCall> {
  try {
    const data = await AsyncStorage.getItem(CALLS_KEY);
    const calls: VideoCall[] = data ? JSON.parse(data) : [];
    
    const newCall: VideoCall = {
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookingId,
      expertId,
      userId,
      status: "waiting",
      quality: "good",
      recordingEnabled: options.recordingEnabled || false,
      recordingConsent: options.recordingConsent || false,
      screenShareEnabled: options.screenShareEnabled || false,
      chatEnabled: options.chatEnabled !== false, // default true
      networkIssues: [],
    };
    
    calls.push(newCall);
    await AsyncStorage.setItem(CALLS_KEY, JSON.stringify(calls));
    
    return newCall;
  } catch (error) {
    console.error("Failed to create video call:", error);
    throw error;
  }
}

/**
 * Get video call
 */
export async function getVideoCall(callId: string): Promise<VideoCall | null> {
  try {
    const data = await AsyncStorage.getItem(CALLS_KEY);
    const calls: VideoCall[] = data ? JSON.parse(data) : [];
    return calls.find((c) => c.id === callId) || null;
  } catch (error) {
    console.error("Failed to get video call:", error);
    return null;
  }
}

/**
 * Update call status
 */
export async function updateCallStatus(
  callId: string,
  status: CallStatus
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(CALLS_KEY);
    const calls: VideoCall[] = data ? JSON.parse(data) : [];
    
    const call = calls.find((c) => c.id === callId);
    if (call) {
      call.status = status;
      
      if (status === "connected" && !call.startTime) {
        call.startTime = new Date().toISOString();
      } else if (status === "ended" && call.startTime && !call.endTime) {
        call.endTime = new Date().toISOString();
        call.duration = Math.floor(
          (new Date(call.endTime).getTime() - new Date(call.startTime).getTime()) / 1000
        );
      }
      
      await AsyncStorage.setItem(CALLS_KEY, JSON.stringify(calls));
    }
  } catch (error) {
    console.error("Failed to update call status:", error);
    throw error;
  }
}

/**
 * Update call quality
 */
export async function updateCallQuality(
  callId: string,
  quality: CallQuality
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(CALLS_KEY);
    const calls: VideoCall[] = data ? JSON.parse(data) : [];
    
    const call = calls.find((c) => c.id === callId);
    if (call) {
      call.quality = quality;
      await AsyncStorage.setItem(CALLS_KEY, JSON.stringify(calls));
    }
  } catch (error) {
    console.error("Failed to update call quality:", error);
    throw error;
  }
}

/**
 * Report network issue
 */
export async function reportNetworkIssue(
  callId: string,
  issue: Omit<NetworkIssue, "timestamp" | "resolved">
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(CALLS_KEY);
    const calls: VideoCall[] = data ? JSON.parse(data) : [];
    
    const call = calls.find((c) => c.id === callId);
    if (call) {
      call.networkIssues.push({
        ...issue,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
      await AsyncStorage.setItem(CALLS_KEY, JSON.stringify(calls));
    }
  } catch (error) {
    console.error("Failed to report network issue:", error);
    throw error;
  }
}

/**
 * Resolve network issue
 */
export async function resolveNetworkIssue(
  callId: string,
  issueIndex: number
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(CALLS_KEY);
    const calls: VideoCall[] = data ? JSON.parse(data) : [];
    
    const call = calls.find((c) => c.id === callId);
    if (call && call.networkIssues[issueIndex]) {
      call.networkIssues[issueIndex].resolved = true;
      await AsyncStorage.setItem(CALLS_KEY, JSON.stringify(calls));
    }
  } catch (error) {
    console.error("Failed to resolve network issue:", error);
    throw error;
  }
}

/**
 * Switch to audio-only mode
 */
export async function switchToAudioOnly(callId: string): Promise<void> {
  try {
    await reportNetworkIssue(callId, {
      type: "low_bandwidth",
      severity: "high",
      action: "switched to audio-only",
    });
    
    // In real implementation, would disable video track
    console.log(`Switched call ${callId} to audio-only mode`);
  } catch (error) {
    console.error("Failed to switch to audio-only:", error);
    throw error;
  }
}

/**
 * Enable screen sharing
 */
export async function enableScreenShare(callId: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(CALLS_KEY);
    const calls: VideoCall[] = data ? JSON.parse(data) : [];
    
    const call = calls.find((c) => c.id === callId);
    if (call) {
      call.screenShareEnabled = true;
      await AsyncStorage.setItem(CALLS_KEY, JSON.stringify(calls));
    }
  } catch (error) {
    console.error("Failed to enable screen share:", error);
    throw error;
  }
}

/**
 * Save call recording
 */
export async function saveCallRecording(
  callId: string,
  bookingId: string,
  recording: Omit<CallRecording, "id" | "createdDate" | "accessCount">
): Promise<CallRecording> {
  try {
    const data = await AsyncStorage.getItem(RECORDINGS_KEY);
    const recordings: CallRecording[] = data ? JSON.parse(data) : [];
    
    const newRecording: CallRecording = {
      ...recording,
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      callId,
      bookingId,
      createdDate: new Date().toISOString(),
      accessCount: 0,
    };
    
    recordings.push(newRecording);
    await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
    
    return newRecording;
  } catch (error) {
    console.error("Failed to save call recording:", error);
    throw error;
  }
}

/**
 * Get call recordings
 */
export async function getCallRecordings(filters?: {
  callId?: string;
  bookingId?: string;
}): Promise<CallRecording[]> {
  try {
    const data = await AsyncStorage.getItem(RECORDINGS_KEY);
    let recordings: CallRecording[] = data ? JSON.parse(data) : [];
    
    if (filters) {
      if (filters.callId) {
        recordings = recordings.filter((r) => r.callId === filters.callId);
      }
      if (filters.bookingId) {
        recordings = recordings.filter((r) => r.bookingId === filters.bookingId);
      }
    }
    
    // Sort by created date
    recordings.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    
    return recordings;
  } catch (error) {
    console.error("Failed to get call recordings:", error);
    return [];
  }
}

/**
 * Access recording
 */
export async function accessRecording(recordingId: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(RECORDINGS_KEY);
    const recordings: CallRecording[] = data ? JSON.parse(data) : [];
    
    const recording = recordings.find((r) => r.id === recordingId);
    if (recording) {
      recording.accessCount++;
      recording.lastAccessedDate = new Date().toISOString();
      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
    }
  } catch (error) {
    console.error("Failed to access recording:", error);
    throw error;
  }
}

/**
 * Save call notes
 */
export async function saveCallNotes(
  notes: Omit<CallNotes, "id" | "createdDate">
): Promise<CallNotes> {
  try {
    const data = await AsyncStorage.getItem(`${CALL_NOTES_KEY}_${notes.callId}`);
    const allNotes: CallNotes[] = data ? JSON.parse(data) : [];
    
    const newNotes: CallNotes = {
      ...notes,
      id: `notes_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString(),
    };
    
    allNotes.push(newNotes);
    await AsyncStorage.setItem(`${CALL_NOTES_KEY}_${notes.callId}`, JSON.stringify(allNotes));
    
    return newNotes;
  } catch (error) {
    console.error("Failed to save call notes:", error);
    throw error;
  }
}

/**
 * Get call notes
 */
export async function getCallNotes(callId: string): Promise<CallNotes[]> {
  try {
    const data = await AsyncStorage.getItem(`${CALL_NOTES_KEY}_${callId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get call notes:", error);
    return [];
  }
}

/**
 * Submit participant feedback
 */
export async function submitParticipantFeedback(
  feedback: Omit<ParticipantFeedback, "timestamp">
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(CALLS_KEY);
    const calls: VideoCall[] = data ? JSON.parse(data) : [];
    
    const call = calls.find((c) => c.id === feedback.callId);
    if (call) {
      call.participantFeedback = {
        ...feedback,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(CALLS_KEY, JSON.stringify(calls));
    }
  } catch (error) {
    console.error("Failed to submit participant feedback:", error);
    throw error;
  }
}

/**
 * Get call history
 */
export async function getCallHistory(filters?: {
  userId?: string;
  expertId?: string;
  status?: CallStatus;
}): Promise<VideoCall[]> {
  try {
    const data = await AsyncStorage.getItem(CALLS_KEY);
    let calls: VideoCall[] = data ? JSON.parse(data) : [];
    
    if (filters) {
      if (filters.userId) {
        calls = calls.filter((c) => c.userId === filters.userId);
      }
      if (filters.expertId) {
        calls = calls.filter((c) => c.expertId === filters.expertId);
      }
      if (filters.status) {
        calls = calls.filter((c) => c.status === filters.status);
      }
    }
    
    // Sort by start time
    calls.sort((a, b) => {
      const aTime = a.startTime || a.id;
      const bTime = b.startTime || b.id;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
    
    return calls;
  } catch (error) {
    console.error("Failed to get call history:", error);
    return [];
  }
}

/**
 * Get call statistics
 */
export async function getCallStatistics(callId: string): Promise<CallStatistics> {
  // In real implementation, would collect actual WebRTC stats
  // For now, return simulated statistics
  
  return {
    callId,
    avgBitrate: 1500, // kbps
    avgLatency: 45, // ms
    packetLoss: 0.5, // percentage
    jitter: 12, // ms
    resolution: "1280x720",
    frameRate: 30, // fps
    audioCodec: "opus",
    videoCodec: "VP8",
  };
}

/**
 * Send in-call chat message
 */
export async function sendChatMessage(
  callId: string,
  senderId: string,
  senderName: string,
  message: string
): Promise<ChatMessage> {
  try {
    const data = await AsyncStorage.getItem(`chat_${callId}`);
    const messages: ChatMessage[] = data ? JSON.parse(data) : [];
    
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      callId,
      senderId,
      senderName,
      message,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(newMessage);
    await AsyncStorage.setItem(`chat_${callId}`, JSON.stringify(messages));
    
    return newMessage;
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
}

/**
 * Get chat messages
 */
export async function getChatMessages(callId: string): Promise<ChatMessage[]> {
  try {
    const data = await AsyncStorage.getItem(`chat_${callId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get chat messages:", error);
    return [];
  }
}
