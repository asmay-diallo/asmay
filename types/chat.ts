// types/chat.types.ts

// ==================== USER ====================
export interface IUser {
  _id: string;
  username: string;
  email?: string;
  profilePicture?: string;
  precision?: {
    text?: string;
    coordinates?: [number, number];
  };
  distance?: number;
  lastActive?: Date | string;
  likers?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ==================== MESSAGE ====================
export interface IMessageSender {
  _id: string;
  username: string;
  profilePicture?: string;
}

export type MessageType = "text" | "audio" | "image" | "video";
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "error";

export interface IMessage {
  _id: string;
  chatId: string;
  chat?: string;
  content: string;
  sender: IMessageSender;
  receiver?: string;
  type: MessageType;
  audioUrl?: string;
  audioFullUrl?: string;
  duration?: number;
  status: MessageStatus;
  isRead: boolean;
  hasError?: boolean;
  tempId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ITempMessage extends Partial<IMessage> {
  _id: string;
  chatId: string;
  content: string;
  sender: IMessageSender;
  tempId: string;
  status: MessageStatus;
}

// ==================== CHAT ====================
export type ChatParticipant = string | IUser;

export interface IChat {
  _id: string;
  participant1: ChatParticipant;
  participant2: ChatParticipant;
  lastActivity: string;
  lastMessage?: string;
  lastMessageType?: MessageType;
  isActive: boolean;
  unreadCount?: number;
  createdAt: string;
  updatedAt?: string;
}

// ==================== PRÉSENCE ====================
export interface ITypingUser {
  userId: string;
  username: string;
  text: string;
  isTyping: boolean;
  timestamp: string;
}

export interface IChatPresence {
  usersInChat: string[];
  typingUsers: Record<string, ITypingUser>;
}

// ==================== SOCKET EVENTS ====================

// Présence
export interface IUserEnteredChatData {
  chatId: string;
  userId: string;
  username?: string;
  timestamp: string;
}

export interface IUserLeftChatData {
  chatId: string;
  userId: string;
  username?: string;
  timestamp: string;
  reason?: string;
}

export interface IChatPresenceListData {
  chatId: string;
  users: Array<{
    userId: string;
    isTyping: boolean;
  }>;
}

// Typing
export interface ITypingStartData {
  chatId: string;
  userId: string;
  username: string;
  timestamp: string;
}

export interface ITypingTextData {
  chatId: string;
  userId: string;
  text: string;
  timestamp: string;
}

export interface ITypingStopData {
  chatId: string;
  userId: string;
  timestamp: string;
}

// Messages
export interface ISendMessageData {
  chatId: string;
  content: string;
  tempId: string;
  timestamp: string;
}

export interface IMessageSentConfirmation {
  messageId: string;
  tempId: string;
}

export interface IMessageErrorData {
  tempId: string;
  error: string;
}

export interface INewMessageData extends IMessage {
  chat: string;
}

// Vocal
export interface ISendVoiceMessageData {
  chatId: string;
  tempId: string;
  duration: number;
  audioUrl: string;
  timestamp: string;
}

export interface IVoiceMessageStoredData {
  tempId: string;
  messageId: string;
  chatId: string;
}

// API Responses
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  page: number;
  totalPages: number;
  totalCount: number;
}