
'use client';

import { useEffect, useState, useRef } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  useToken,
  useRoomContext
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useSearchParams } from 'next/navigation';
import { Loader2, Video, Mic, VideoOff, MicOff, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const USER_SETTINGS_STORAGE_KEY = 'userSettings';

function Lobby({ onJoin, videoEnabled, setVideoEnabled, audioEnabled, setAudioEnabled }: { 
    onJoin: () => void;
    videoEnabled: boolean;
    setVideoEnabled: (enabled: boolean) => void;
    audioEnabled: boolean;
    setAudioEnabled: (enabled: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;
    let localStream: MediaStream;

    const getMedia = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (isMounted) {
            if (videoRef.current) {
                videoRef.current.srcObject = localStream;
            }
            streamRef.current = localStream;
            // Initially set tracks enabled/disabled based on state
            localStream.getVideoTracks()[0].enabled = videoEnabled;
            localStream.getAudioTracks()[0].enabled = audioEnabled;
        } else {
             localStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error('Error accessing media for lobby:', err);
        setVideoEnabled(false);
        setAudioEnabled(false);
      }
    };

    getMedia();

    return () => {
      isMounted = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  useEffect(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = videoEnabled;
      }
    }
  }, [videoEnabled]);

  useEffect(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = audioEnabled;
      }
    }
  }, [audioEnabled]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="flex flex-col lg:flex-row items-center gap-8 max-w-5xl w-full">
        <div className="relative w-full max-w-lg">
          <Card className="aspect-video w-full overflow-hidden shadow-lg">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
             {!videoEnabled && (
              <div className="absolute inset-0 w-full h-full bg-slate-800 flex items-center justify-center">
                <VideoOff className="w-16 h-16 text-slate-500" />
              </div>
            )}
          </Card>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
            <Button
              variant={audioEnabled ? 'secondary' : 'destructive'}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? <Mic /> : <MicOff />}
            </Button>
            <Button
              variant={videoEnabled ? 'secondary' : 'destructive'}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => setVideoEnabled(!videoEnabled)}
            >
              {videoEnabled ? <Video /> : <VideoOff />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
          <h1 className="text-3xl md:text-4xl font-bold">Pronto para entrar?</h1>
          <p className="text-muted-foreground">Verifique seu áudio e vídeo antes de participar da reunião.</p>
          <Button size="lg" onClick={onJoin} className="w-full sm:w-auto">
            Participar agora
          </Button>
        </div>
      </div>
    </div>
  );
}

function CustomVideoConference() {
  const room = useRoomContext();
  const [isDisconnected, setIsDisconnected] = useState(false);

  useEffect(() => {
    const handleDisconnected = () => {
      setIsDisconnected(true);
    };
    room.on('disconnected', handleDisconnected);
    return () => {
      room.off('disconnected', handleDisconnected);
    };
  }, [room]);

  if (isDisconnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4 p-8 bg-gray-800/50 rounded-lg">
          <h1 className="text-2xl font-bold">Você foi desconectado.</h1>
          <p className="text-muted-foreground">A reunião terminou ou sua conexão foi perdida.</p>
          <Button onClick={() => window.location.href = '/'} variant="secondary" size="lg">
            <LogOut className="mr-2" />
            Voltar para o Início
          </Button>
        </div>
      </div>
    );
  }

  return <VideoConference />;
}

export default function ArpolMeetPage() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get('room') || 'arpol-meet-dds';

  const [userInfo, setUserInfo] = useState({ name: 'Participante' });
  const [hasJoined, setHasJoined] = useState(false);
  
  // States for lobby media controls that will be passed to LiveKitRoom
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    const savedSettings = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setUserInfo({ name: settings.name || 'Participante' });
      } catch (e) {
        console.error("Failed to parse user settings", e);
      }
    }
  }, []);

  const token = useToken('/api/livekit', roomName, {
    userInfo: {
      name: userInfo.name,
    },
    skip: !hasJoined,
  });

  if (!hasJoined) {
    return <Lobby 
      onJoin={() => setHasJoined(true)} 
      videoEnabled={videoEnabled}
      setVideoEnabled={setVideoEnabled}
      audioEnabled={audioEnabled}
      setAudioEnabled={setAudioEnabled}
    />;
  }
  
  if (token === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h1 className="text-2xl font-bold">Entrando na sala...</h1>
        <p className="text-muted-foreground">Estamos preparando tudo para você.</p>
      </div>
    );
  }


  return (
    <div className="h-full w-full" data-lk-theme="default">
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        video={videoEnabled}
        audio={audioEnabled}
        className="h-full"
      >
        <CustomVideoConference />
      </LiveKitRoom>
    </div>
  );
}
