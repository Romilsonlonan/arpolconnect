
'use client';

import { useEffect, useState, useRef } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  useToken,
  LocalVideoTrack,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useSearchParams } from 'next/navigation';
import { Loader2, Video, Mic, VideoOff, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const USER_SETTINGS_STORAGE_KEY = 'userSettings';

function Lobby({ onJoin }: { onJoin: () => void }) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | undefined;

    const getMedia = async () => {
      // Clean up previous stream
      if (videoRef.current?.srcObject) {
          const currentStream = videoRef.current.srcObject as MediaStream;
          currentStream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      
      try {
        if (videoEnabled) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: audioEnabled });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.error('Error accessing media for lobby:', err);
        setVideoEnabled(false); // Disable video if permission is denied
      }
    };

    getMedia();

    return () => {
       if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [videoEnabled, audioEnabled]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="flex flex-col lg:flex-row items-center gap-8 max-w-5xl w-full">
        {/* Left Side - Video Preview */}
        <div className="relative w-full max-w-lg">
          <Card className="aspect-video w-full overflow-hidden shadow-lg">
            {videoEnabled ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
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

        {/* Right Side - Join Options */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
          <h1 className="text-3xl md:text-4xl font-bold">Pronto para entrar?</h1>
          <p className="text-muted-foreground">Verifique seu áudio e vídeo antes de participar da reunião.</p>
          <Button size="lg" onClick={() => onJoin()} className="w-full sm:w-auto">
            Participar agora
          </Button>
        </div>
      </div>
    </div>
  );
}


export default function ArpolMeetPage() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get('room') || 'arpol-meet-dds';

  const [userInfo, setUserInfo] = useState({ name: 'Participante' });
  const [hasJoined, setHasJoined] = useState(false);

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
    // skip fetching token if the user hasn't joined yet
    skip: !hasJoined,
  });

  if (!hasJoined) {
    return <Lobby onJoin={() => setHasJoined(true)} />;
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
        video={true}
        audio={true}
        className="h-full"
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
