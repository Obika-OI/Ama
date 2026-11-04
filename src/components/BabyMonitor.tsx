import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  ChevronLeft, 
  Camera, 
  Monitor as MonitorIcon, 
  Settings, 
  Circle, 
  Square, 
  Download, 
  ShieldCheck, 
  Info,
  Loader2,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  query, 
  getDocs,
  deleteDoc,
  handleFirestoreError,
  OperationType
} from '../firebase';

interface BabyMonitorProps {
  onBack: () => void;
  villageToken?: string;
  babyName?: string;
}

export const BabyMonitor: React.FC<BabyMonitorProps> = ({ 
  onBack, 
  villageToken = localStorage.getItem('ama_village_sync_token') || 'DEMO_VILLAGE',
  babyName = 'Baby'
}) => {
  const [mode, setMode] = useState<'selection' | 'camera' | 'monitor'>('selection');
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const sessionDocRef = doc(db, 'monitors', villageToken);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const stopSession = async () => {
    setIsActive(false);
    setStatus('idle');
    
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Cleanup signaling
    try {
      await deleteDoc(sessionDocRef);
      const candidatesCol = collection(db, `monitors/${villageToken}/candidates`);
      const candidates = await getDocs(query(candidatesCol));
      candidates.forEach(async (d) => {
        try {
          await deleteDoc(d.ref);
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `monitors/${villageToken}/candidates/${d.id}`);
        }
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `monitors/${villageToken}`);
    }
  };

  const setupPeerConnection = (isOfferer: boolean) => {
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    // Track state
    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current?.connectionState;
      if (state === 'connected') setStatus('connected');
      if (state === 'failed' || state === 'disconnected') setStatus('disconnected');
    };

    // Send candidates to Firestore
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        const candidatesCol = collection(db, `monitors/${villageToken}/candidates`);
        addDoc(candidatesCol, {
          ...event.candidate.toJSON(),
          from: isOfferer ? 'viewer' : 'camera',
          timestamp: Date.now()
        }).catch(e => {
          handleFirestoreError(e, OperationType.CREATE, `monitors/${villageToken}/candidates`);
        });
      }
    };

    // Receive tracks
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Add local tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, localStream.current!);
      });
    }
  };

  const startCameraMode = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setMode('camera');
      setIsActive(true);
      setStatus('connecting');

      setupPeerConnection(false);

      // Listen for offer from viewer
      onSnapshot(sessionDocRef, async (snapshot) => {
        const data = snapshot.data();
        if (!peerConnection.current || peerConnection.current.signalingState !== 'stable') {
          if (data?.offer && !peerConnection.current?.remoteDescription) {
            try {
              await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await peerConnection.current?.createAnswer();
              await peerConnection.current?.setLocalDescription(answer!);
              await updateDoc(sessionDocRef, { answer: { type: answer!.type, sdp: answer!.sdp } });
            } catch (e) {
              handleFirestoreError(e, OperationType.UPDATE, `monitors/${villageToken}`);
            }
          }
        }
      }, (e) => {
        handleFirestoreError(e, OperationType.GET, `monitors/${villageToken}`);
      });

      // Listen for ICE candidates from viewer
      const candidatesCol = collection(db, `monitors/${villageToken}/candidates`);
      onSnapshot(query(candidatesCol), (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.from === 'viewer' && peerConnection.current?.remoteDescription) {
              await peerConnection.current.addIceCandidate(new RTCIceCandidate(data));
            }
          }
        });
      }, (e) => {
        handleFirestoreError(e, OperationType.LIST, `monitors/${villageToken}/candidates`);
      });

    } catch (err) {
      console.error(err);
      setErrorMsg('Could not access camera or microphone. Please check permissions.');
    }
  };

  const startMonitorMode = async () => {
    setErrorMsg('');
    setMode('monitor');
    setIsActive(true);
    setStatus('connecting');

    setupPeerConnection(true);

    const offer = await peerConnection.current?.createOffer();
    await peerConnection.current?.setLocalDescription(offer!);
    
    try {
      await setDoc(sessionDocRef, { 
        offer: { type: offer!.type, sdp: offer!.sdp },
        updatedAt: Date.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `monitors/${villageToken}`);
    }

    // Listen for answer from camera
    onSnapshot(sessionDocRef, async (snapshot) => {
      const data = snapshot.data();
      if (data?.answer && !peerConnection.current?.remoteDescription) {
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    }, (e) => {
      handleFirestoreError(e, OperationType.GET, `monitors/${villageToken}`);
    });

    // Listen for ICE candidates from camera
    const candidatesCol = collection(db, `monitors/${villageToken}/candidates`);
    onSnapshot(query(candidatesCol), (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.from === 'camera' && peerConnection.current?.remoteDescription) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data));
          }
        }
      });
    }, (e) => {
      handleFirestoreError(e, OperationType.LIST, `monitors/${villageToken}/candidates`);
    });
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      const stream = mode === 'camera' ? localStream.current : remoteVideoRef.current?.srcObject as MediaStream;
      if (!stream) return;

      recordedChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `baby_monitor_${Date.now()}.webm`;
        a.click();
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen text-left">
      <header className="flex items-center justify-between pt-3 sm:pt-4 pb-2 px-1">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-800 hover:scale-105 transition-transform cursor-pointer border-none"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-black text-gray-800">Village Baby Monitor</h1>
            <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-0.5">Secure P2P Video & Audio</p>
          </div>
        </div>
        
        {isActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-sky-400'}`} />
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-900">
              {connectionStatus === 'connected' ? 'Live' : 'Connecting...'}
            </span>
          </div>
        )}
      </header>

      {errorMsg && (
        <div className="p-4 bg-sky-50 border border-sky-100 rounded-3xl flex items-center gap-3 text-sky-900 text-xs font-bold shadow-sm">
          <AlertCircle className="w-5 h-5 text-sky-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {mode === 'selection' && (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <button
              onClick={startCameraMode}
              className="p-8 rounded-[40px] bg-card border-2 border-white shadow-xl shadow-card/20 text-left space-y-6 group hover:border-sky-300 transition-all active:scale-98 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-black text-gray-900">Set Up as Camera</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Use this device as the nursery camera. Place it near {babyName}'s crib and ensure it's connected to power.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-600 pt-2">
                <span>Start Streaming →</span>
              </div>
            </button>

            <button
              onClick={startMonitorMode}
              className="p-8 rounded-[40px] bg-card border-2 border-white shadow-xl shadow-card/20 text-left space-y-6 group hover:border-sky-300 transition-all active:scale-98 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                <MonitorIcon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-black text-gray-900">Watch as Monitor</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Receive live audio and video from the nursery camera. Supports background audio and local recording.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-600 pt-2">
                <span>Connect to Village →</span>
              </div>
            </button>
          </motion.div>
        )}

        {(mode === 'camera' || mode === 'monitor') && (
          <motion.div 
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="relative aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
              {mode === 'camera' ? (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              )}

              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>{mode === 'camera' ? 'Camera Mode' : 'Viewing Monitor'}</span>
                </div>
                {isRecording && (
                  <div className="px-3 py-1.5 rounded-full bg-[#FFD6E8] backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                    <Circle className="w-1.5 h-1.5 fill-current animate-pulse" />
                    <span>Recording</span>
                  </div>
                )}
              </div>

              {connectionStatus === 'connecting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm space-y-4">
                  <Loader2 className="w-12 h-12 text-sky-400 animate-spin" />
                  <p className="text-white text-xs font-black uppercase tracking-widest">Establishing Peer Connection...</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-[32px] border border-white shadow-sm flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary">Village Network</p>
                  <h4 className="text-sm font-bold text-gray-900 truncate">{villageToken}</h4>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  <span>E2E Local Stream Only</span>
                </div>
              </div>

              <div className="bg-card p-4 rounded-[32px] border border-white shadow-sm flex items-center justify-around gap-2">
                <button
                  onClick={toggleRecording}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer border-none shadow-md ${
                    isRecording ? 'bg-[#FFD6E8] text-slate-800 animate-pulse' : 'bg-white text-gray-600 hover:bg-sky-50'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Record & Save Locally'}
                >
                  {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Circle className="w-6 h-6" />}
                </button>
                <button
                  onClick={() => stopSession().then(() => setMode('selection'))}
                  className="w-14 h-14 rounded-2xl bg-white text-gray-600 hover:bg-sky-50 flex items-center justify-center transition-all cursor-pointer border-none shadow-md"
                  title="Stop Session"
                >
                  <VideoOff className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-card p-6 rounded-[32px] border border-white shadow-sm space-y-2 col-span-1 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Privacy Notice</p>
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Ama Baby Monitor establishes a direct peer-to-peer connection between devices. No video or audio data is ever transmitted to our servers or saved in the cloud. Recordings are saved exclusively to your device storage.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="bg-sky-50/50 border border-sky-100 rounded-[40px] p-8 space-y-6 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-200 text-sky-700 flex items-center justify-center">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-black text-gray-900">How to use Village Monitor</h3>
            <p className="text-[9px] text-sky-800 font-bold uppercase tracking-widest">Step-by-Step Setup</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-lg bg-sky-200 text-sky-800 flex items-center justify-center text-xs font-black">1</div>
            <p className="text-xs font-bold text-gray-800">Set Up Camera</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">Open Ama on the device you want to use as a camera and select "Set Up as Camera". Keep the screen on.</p>
          </div>
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-lg bg-sky-200 text-sky-800 flex items-center justify-center text-xs font-black">2</div>
            <p className="text-xs font-bold text-gray-800">Connect Monitor</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">On your second device (phone/tablet), open this screen and select "Watch as Monitor".</p>
          </div>
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-lg bg-sky-200 text-sky-800 flex items-center justify-center text-xs font-black">3</div>
            <p className="text-xs font-bold text-gray-800">Stay Synced</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">Both devices must use the same village token. Connection works over local network and mobile data.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
