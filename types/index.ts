
export interface User {
  _id: string;
  username: string;
  email: string;
  interests: string[];
  coins:number;
  privacySettings?: PrivacySettings;
   bio?: string;
  profilePicture?: string;
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
  chat: string;
  audioUrl?: string;
  duration?:number;
  type?:string;
  createdAt: string;
  isSending?: boolean;
  hasError?: boolean;
  read?: boolean;
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
