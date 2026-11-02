import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { API } from '../config';

const ROOM_ID = 'emergency-consult-room';

function VideoCall() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    
    const [socket, setSocket] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [callStatus, setCallStatus] = useState(t('video.awaiting'));
    const [streamActive, setStreamActive] = useState(false);

    useEffect(() => {
        // Initialize Socket
        const newSocket = io(`${API}`);
        setSocket(newSocket);

        // WebRTC Configuration
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
        const peerConn = new RTCPeerConnection(configuration);
        setPeerConnection(peerConn);

        // Handle incoming remote stream
        peerConn.addEventListener('track', async (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setCallStatus('Connected!');
            }
        });

        // Request Local Media
        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    setStreamActive(true);
                }
                
                stream.getTracks().forEach(track => {
                    peerConn.addTrack(track, stream);
                });

                newSocket.emit('join-room', ROOM_ID, user.id);
                setCallStatus('Waiting for peer...');
                
            } catch (err) {
                console.error("Error accessing media devices.", err);
                setCallStatus("Error accessing camera.");
            }
        };

        startMedia();

        return () => {
            newSocket.disconnect();
            peerConn.close();
            if (localVideoRef.current && localVideoRef.current.srcObject) {
                localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Handle Signaling
    useEffect(() => {
        if (!socket || !peerConnection) return;

        socket.on('user-connected', async (userId) => {
            console.log('User joined, creating offer');
            setCallStatus('Negotiating...');
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', offer, userId);
        });

        socket.on('offer', async (offer, senderId) => {
            console.log('Received offer, creating answer');
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('answer', answer, senderId);
        });

        socket.on('answer', async (answer, senderId) => {
            console.log('Received answer');
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                socket.emit('ice-candidate', event.candidate, 'broadcast');
            }
        });

        socket.on('ice-candidate', async (candidate) => {
            try {
                await peerConnection.addIceCandidate(candidate);
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        });
        
    }, [socket, peerConnection]);

    return (
        <div>
            <h1 className="page-title">{t('video.title')}</h1>
            
            <div className="alert-warning" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', borderLeftColor: '#3B82F6' }}>
                <strong>{t('video.status')}:</strong> {callStatus}
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div className="card" style={{ flex: '1 1 400px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ color: 'var(--primary-accent)', marginBottom: '16px' }}>{t('video.myCamera')}</h3>
                    <div style={{ width: '100%', height: '300px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>

                <div className="card" style={{ flex: '1 1 400px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ color: 'var(--success-green)', marginBottom: '16px' }}>{t('video.consultFeed')}</h3>
                    <div style={{ width: '100%', height: '300px', backgroundColor: '#111827', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {/* Fallback text if incoming stream is blank */}
                        <p style={{ color: '#fff', position: 'absolute', zIndex: 0, opacity: 0.5 }}>{t('video.awaiting')}</p>
                    </div>
                </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 24 }}>
                 <button onClick={() => window.history.back()} className="btn btn-primary" style={{ backgroundColor: '#EF4444' }}>{t('video.endCall')}</button>
            </div>
        </div>
    );
}

export default VideoCall;
