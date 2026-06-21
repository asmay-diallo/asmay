// store/slices/streamSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StreamState {
  localStreamId: string | null;
  remoteStreamId: string | null;
  localTracks: string[]; // track ids
  remoteTracks: string[];
  isLocalReady: boolean;
  isRemoteReady: boolean;
  lastUpdated: number;
}

const initialState: StreamState = {
  localStreamId: null,
  remoteStreamId: null,
  localTracks: [],
  remoteTracks: [],
  isLocalReady: false,
  isRemoteReady: false,
  lastUpdated: 0,
};

const streamSlice = createSlice({
  name: 'stream',
  initialState,
  reducers: {
    setLocalStream: (state, action: PayloadAction<{
      streamId: string;
      tracks: string[];
    }>) => {
      state.localStreamId = action.payload.streamId;
      state.localTracks = action.payload.tracks;
      state.isLocalReady = true;
      state.lastUpdated = Date.now();
    },

    setRemoteStream: (state, action: PayloadAction<{
      streamId: string;
      tracks: string[];
    }>) => {
      state.remoteStreamId = action.payload.streamId;
      state.remoteTracks = action.payload.tracks;
      state.isRemoteReady = true;
      state.lastUpdated = Date.now();
    },

    clearLocalStream: (state) => {
      state.localStreamId = null;
      state.localTracks = [];
      state.isLocalReady = false;
    },

    clearRemoteStream: (state) => {
      state.remoteStreamId = null;
      state.remoteTracks = [];
      state.isRemoteReady = false;
    },

    resetStreams: () => initialState,
  },
});

export const {
  setLocalStream,
  setRemoteStream,
  clearLocalStream,
  clearRemoteStream,
  resetStreams,
} = streamSlice.actions;

export default streamSlice.reducer;