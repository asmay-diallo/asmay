
export interface User {
  _id: string;
  username: string;
  email: string;
  interests: string[];
  coins:number;
  privacySettings?: PrivacySettings;
   bio?: string;
  profilePicture?: string;
  lastActive:any
}

export interface Chat {
  _id: string;
  participant1: User;
  participant2: User;
  lastActivity: string;
  lastMessage:string;
  expiresAt: string;
  messages?: Message[];
  unreadCount?: number;
}

export interface Signal {
  _id:string;
  fromUserId:string;
  toUserId:string;
  fromUserSessionId:string;
  toUserSessionId:string;
  message:string;
  commonInterests:[string],
  viewed?:boolean,
  status:string;
  chatId:string;
  respondedAt:string;
  expiresAt:string
}

export interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  chatId: string;
  audioUrl?: string;
  duration?:number;
  type?:string;
  createdAt?: string;
  isSending?: boolean;
  hasError?: boolean;
  read?: boolean;
   temp?: boolean;       
  tempId?: string;    
}
export interface PrivacySettings {
  isVisible: boolean;
  showCommonInterestsOnly: boolean;
  showOnRadar:boolean
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export interface AuthContextType {
  userToken: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  [key: string]: any;
}

export interface NearbyUser {
  _id: string;
  username: string;
  interests:{ 
   common: [string],
   count:number
  };
  privacySettings: {
      isVisible: boolean;
      showCommonInterestsOnly:  boolean;
      showOnRadar:boolean;
    };
  distance: number;
  bearing: number;
  profilePicture?: string;
  toSessionId: string;
}

export interface ARMarkerProps {
  user: User;
  onPress: (user: User) => void;
}
// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  password: string;
  latitude?: number;  // Optionnel pour la géolocalisation
  longitude?: number; // Optionnel pour la géolocalisation
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  interests?: string[];      // Optionnel
  latitude?: number;         // Optionnel
  longitude?: number;        // Optionnel
}

export interface ARUser {
  _id: string;
  username: string;
  distance: number;
  bearing: number;
  interests:{ 
   common: string[],
   count:number
  };
  profilePicture?: string;
   privacySettings: {
      isVisible: boolean;
      showCommonInterestsOnly:  boolean;
      showOnRadar:boolean;
    };
  toSessionId?: string;
  isCallable?: boolean;
}

export interface AdvancedARMarkerProps {
  users: NearbyUser[];
  onUserPress: (userId: string) => void;
}
// ============ MESSAGE VOCAL ============
export interface VoiceMessage extends Message {
  audioUrl: string;
  duration: number;
  type: 'audio';
}

// ============ ÉTATS REDUX ============
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SignalState {
  incomingSignals: Signal[];
  outgoingSignals: Signal[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

export interface MessageState {
  messagesByChat: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  sendingStatus: Record<string, 'sending' | 'sent' | 'error'>;
}

export interface VoiceMessageState {
  voiceMessagesByChat: Record<string, VoiceMessage[]>;
  currentlyPlaying: string | null;
  playbackStatus: Record<string, { isPlaying: boolean; position: number; duration: number }>;
  uploadProgress: Record<string, number | 'error'>;
  loading: boolean;
  error: string | null;
}
 //============== Appel ==============
 export type CallType = 'audio' | 'video';
export type CallState = 'idle' | 'calling' | 'incoming' | 'connecting' | 'connected' | 'ended';
export type CallErrorCode = 'USER_NOT_FOUND' | 'USER_OFFLINE' | 'USER_BUSY' | 'SERVER_ERROR' | 'PERMISSION_DENIED';

export interface CallerInfo {
  username: string;
  profilePicture?: string;
}

export interface IncomingCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerProfilePicture?: string;
  calleeId:string,
  calleeName:string,
  calleeProfilePicture?:string,
  callType: CallType;
   offer: any;
  timestamp: Date;
}

export interface CallError {
  code: CallErrorCode;
  message: string;
}

export interface CallInitiateData {
  targetUserId: string;
  callType: CallType;
  callerInfo?: CallerInfo;
}

export interface CallAcceptData {
  callId: string;
  callerId: string;
}

export interface CallRejectData {
  callId: string;
  callerId: string;
  reason?: string;
}

export interface CallEndData {
  callId: string;
  targetUserId: string;
}

export interface WebRTCSignalData {
  callId: string;
  targetUserId: string;
}

export interface WebRTCOfferData extends WebRTCSignalData {
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswerData extends WebRTCSignalData {
  answer: RTCSessionDescriptionInit;
}

export interface WebRTCIceCandidateData extends WebRTCSignalData {
  candidate: RTCIceCandidateInit;
}

export interface CallToggleData {
  targetUserId: string;
  enabled: boolean;
}

export interface CurrentUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

export interface VideoCallRouteParams {
  targetUserId: string;
  currentUser: CurrentUser;
  callType: CallType;
}