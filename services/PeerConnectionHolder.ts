import { RTCPeerConnection } from 'react-native-webrtc';

class PeerConnectionHolder {
  private static instance: PeerConnectionHolder;
  private _pc: RTCPeerConnection | null = null;

  static getInstance(): PeerConnectionHolder {
    if (!PeerConnectionHolder.instance) {
      PeerConnectionHolder.instance = new PeerConnectionHolder();
    }
    return PeerConnectionHolder.instance;
  }

  get pc(): RTCPeerConnection | null { return this._pc; }
  set pc(pc: RTCPeerConnection | null) { this._pc = pc; }
}

export default PeerConnectionHolder