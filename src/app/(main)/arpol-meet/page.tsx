
'use client';

import { useEffect, useState, useRef } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  useToken,
  useRoomContext,
  useDataChannel,
  ControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Video, Mic, VideoOff, MicOff, LogOut, Smile, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { animated, useTransition } from '@react-spring/web';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const USER_SETTINGS_STORAGE_KEY = 'userSettings';

// --- Reactions Components ---
const EMOJIS = ['💖', '👍', '🎉', '👏', '😂', '😮', '😢', '🤔', '👎'];

type Reaction = {
  id: number;
  emoji: string;
  x: number;
};

function ReactionButton({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
          <Smile />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-gray-800 border-gray-700 rounded-full">
        <div className="flex gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="text-2xl p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ReactionAnimations() {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const reactionId = useRef(0);

  useDataChannel('reactions', (payload) => {
    const message = new TextDecoder().decode(payload.payload);
    const newReaction: Reaction = {
      id: reactionId.current++,
      emoji: message,
      x: Math.random() * 80 + 10, // Horizontal position from 10% to 90%
    };
    setReactions((prev) => [...prev, newReaction]);
  });
  
  const transitions = useTransition(reactions, {
    from: { transform: 'translateY(0px) scale(1)', opacity: 1 },
    enter: { transform: 'translateY(-200px) scale(1.5)', opacity: 1 },
    leave: { transform: 'translateY(-400px) scale(0.5)', opacity: 0 },
    config: { duration: 3000 },
    onRest: (result, spring, item) => {
        setReactions((prev) => prev.filter(r => r.id !== item.id));
    },
  });

  return (
    <div className="absolute bottom-24 inset-x-0 h-96 pointer-events-none z-50">
        {transitions((style, item) => (
            <animated.div
             style={{
                ...style,
                position: 'absolute',
                bottom: 0,
                left: `${item.x}%`,
                transform: style.transform,
              }}
              className="text-4xl"
            >
                {item.emoji}
            </animated.div>
        ))}
    </div>
  );
}


function Lobby({ onJoin, videoEnabled, setVideoEnabled, audioEnabled, setAudioEnabled }: { 
    onJoin: () => void;
    videoEnabled: boolean;
    setVideoEnabled: (enabled: boolean) => void;
    audioEnabled: boolean;
    setAudioEnabled: (enabled: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const getMedia = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (isMounted) {
          setHasCameraPermission(true);
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          stream.getVideoTracks()[0].enabled = videoEnabled;
          stream.getAudioTracks()[0].enabled = audioEnabled;
        } else {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error('Error accessing media for lobby:', err);
        if (isMounted) {
          setHasCameraPermission(false);
          setVideoEnabled(false);
          setAudioEnabled(false);
          toast({
            variant: 'destructive',
            title: 'Permissão Negada',
            description: 'O acesso à câmera e ao microfone é necessário. Habilite nas configurações do seu navegador.',
          });
        }
      }
    };
    
    getMedia();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <Card className="aspect-video w-full overflow-hidden shadow-lg bg-slate-800">
             <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {(!videoEnabled || !hasCameraPermission) && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-800">
                <VideoOff className="w-16 h-16 text-slate-500" />
              </div>
            )}
          </Card>
           {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Acesso à Câmera Negado</AlertTitle>
              <AlertDescription>
                Por favor, permita o acesso à câmera e ao microfone nas configurações do seu navegador para continuar.
              </AlertDescription>
            </Alert>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
            <Button
              variant={audioEnabled ? 'secondary' : 'destructive'}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => setAudioEnabled(!audioEnabled)}
              disabled={!hasCameraPermission}
            >
              {audioEnabled ? <Mic /> : <MicOff />}
            </Button>
            <Button
              variant={videoEnabled ? 'secondary' : 'destructive'}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => setVideoEnabled(!videoEnabled)}
              disabled={!hasCameraPermission}
            >
              {videoEnabled ? <Video /> : <VideoOff />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
          <h1 className="text-3xl md:text-4xl font-bold">Pronto para entrar?</h1>
          <p className="text-muted-foreground">Verifique seu áudio e vídeo antes de participar da reunião.</p>
          <Button size="lg" onClick={onJoin} className="w-full sm:w-auto" disabled={!hasCameraPermission}>
            Participar agora
          </Button>
        </div>
      </div>
    </div>
  );
}

function CustomVideoConference() {
  const room = useRoomContext();
  const router = useRouter();
  const [isDisconnected, setIsDisconnected] = useState(false);
  const { send } = useDataChannel('reactions');

  const handleReaction = (emoji: string) => {
    if (send) {
        const payload = new TextEncoder().encode(emoji);
        send(payload);
    }
  };


  useEffect(() => {
    const handleDisconnected = () => {
      setIsDisconnected(true);
    };
    room.on('disconnected', handleDisconnected);
    return () => {
      room.off('disconnected', handleDisconnected);
    };
  }, [room, router]);

  if (isDisconnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4 p-8 bg-gray-800/50 rounded-lg">
          <h1 className="text-2xl font-bold">Você foi desconectado.</h1>
          <p className="text-muted-foreground">A reunião terminou ou sua conexão foi perdida.</p>
          <Button onClick={() => router.push('/')} variant="secondary" size="lg">
            <LogOut className="mr-2" />
            Voltar para o Início
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="relative h-full">
        <VideoConference />
        <ReactionAnimations />
         <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center">
            <ControlBar controls={{
                camera: true,
                chat: true,
                microphone: true,
                screenShare: true,
                leave: true,
            }}>
                <ReactionButton onSelect={handleReaction} />
                 <ControlBar.ControlButton label="Levantar a mão">
                    <Hand />
                </ControlBar.ControlButton>
            </ControlBar>
        </div>
    </div>
  );
}


function MeetingRoom({ roomName, userInfo, videoEnabled, audioEnabled }: {
  roomName: string;
  userInfo: { name: string };
  videoEnabled: boolean;
  audioEnabled: boolean;
}) {
  const token = useToken('/api/livekit', roomName, {
    userInfo: {
      name: userInfo.name,
    },
  });

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


export default function ArpolMeetPage() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get('room') || 'arpol-meet-dds';

  const [userInfo, setUserInfo] = useState({ name: 'Participante' });
  const [hasJoined, setHasJoined] = useState(false);
  
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

  if (!hasJoined) {
    return <Lobby 
      onJoin={() => setHasJoined(true)} 
      videoEnabled={videoEnabled}
      setVideoEnabled={setVideoEnabled}
      audioEnabled={audioEnabled}
      setAudioEnabled={setAudioEnabled}
    />;
  }
  
  return (
    <MeetingRoom 
      roomName={roomName}
      userInfo={userInfo}
      videoEnabled={videoEnabled}
      audioEnabled={audioEnabled}
    />
  );
}
