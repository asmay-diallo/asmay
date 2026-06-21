// store/slices/incomingCallSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IncomingCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerProfilePicture?: string | null;
  calleeId:string,
  calleeName:string,
  calleeProfilePicture?:string,
  callType: 'audio' | 'video';
  offer?: any;
  timestamp: string;
}

interface IncomingCallState {
  isIncomingCall: boolean;
  callData: IncomingCallData | null;
  isCallAccepted: boolean;
  activeCallId: string | null;
  callState: 'idle' | 'incoming' | 'calling' | 'connecting' | 'connected' | 'ended';
}

const initialState: IncomingCallState = {
  isIncomingCall: false,
  callData: null,
  isCallAccepted: false,
  activeCallId: null,
  callState: 'idle',
};

const incomingCallSlice = createSlice({
  name: 'incomingCall',
  initialState,
  reducers: {
    setIncomingCall: (state, action: PayloadAction<IncomingCallData>) => {
      state.isIncomingCall = true;
      state.callData = action.payload;
      state.callState = 'incoming';
      state.isCallAccepted = false;
    },
    acceptCall: (state) => {
      state.isIncomingCall = false;
      state.isCallAccepted = true;
      state.activeCallId = state.callData?.callId || null;
      state.callState = 'connected';
    },
    rejectCall: (state) => {
      state.isIncomingCall = false;
      state.callData = null;
      state.isCallAccepted = false;
      state.callState = 'idle';
    },
    callCancelled: (state) => {
      state.isIncomingCall = false;
      state.callData = null;
      state.isCallAccepted = false;
      state.callState = 'idle';
    },
    callEnded: (state) => {
      state.isIncomingCall = false;
      state.callData = null;
      state.isCallAccepted = false;
      state.activeCallId = null;
      state.callState = 'ended';
    },
    setCallState: (state, action: PayloadAction<'idle' | 'incoming' | 'calling' | 'connecting' | 'connected' | 'ended'>) => {
      state.callState = action.payload;
    },
    resetIncomingCall: () => initialState,
  },
});

export const {
  setIncomingCall,
  acceptCall,
  rejectCall,
  callCancelled,
  callEnded,
  setCallState,
  resetIncomingCall,
} = incomingCallSlice.actions;

export default incomingCallSlice.reducer;