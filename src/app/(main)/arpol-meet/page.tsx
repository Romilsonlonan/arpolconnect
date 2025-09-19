
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MoreVertical,
  ScreenShare,
  MessageSquare,
  Users,
  Info,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

const participants = [
  { name: 'Marco Antônio', id: 1, imageHint: 'man portrait' },
  { name: 'Edson Dos santos Souza', id: 2, imageHint: 'man portrait' },
  { name: 'Rian Arpol', id: 3, imageHint: 'man portrait' },
  { name: 'Lucas Castro Alves', id: 4, imageHint: 'man portrait' },
  { name: 'Levy Malaquias', id: 5, imageHint: 'man portrait' },
  { name: 'edson de souza souza', id: 6, imageHint: 'man portrait' },
  { name: 'Tadeu Lopes', id: 7, imageHint: 'man portrait' },
  { name: 'Rogerio Vieira', id: 8, imageHint: 'man portrait' },
  { name: 'Almir Campos', id: 9, imageHint: 'man portrait' },
  { name: 'Helio Arpol', id: 10, imageHint: 'man portrait' },
  { name: 'Gilberto Paulinho Vieira', id: 11, imageHint: 'man portrait' },
  { name: 'robert', id: 12, imageHint: 'man portrait' },
  { name: 'Nilson Afonso', id: 13, imageHint: 'man portrait' },
  { name: 'Jean carlo Da silva feitosa', id: 14, imageHint: 'man portrait' },
];

const ParticipantCard = ({ name, imageHint }: { name: string; imageHint: string }) => {
  const seed = name.replace(/\s/g, '');
  return (
    <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center group">
      <Image
        src={`https://picsum.photos/seed/${seed}/400/300`}
        alt={`Vídeo de ${name}`}
        fill
        className="object-cover"
        data-ai-hint={imageHint}
      />
      <div className="absolute bottom-0 left-0 bg-black/50 p-2 rounded-tr-lg">
        <p className="text-white text-sm font-medium">{name}</p>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <MicOff className="text-white" />
      </div>
    </div>
  );
};

export default function ArpolMeetPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acesso à Câmera Negado',
          description: 'Por favor, habilite as permissões de câmera e microfone no seu navegador para usar o Arpol-Meet.',
        });
      }
    };

    getCameraPermission();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const toggleMute = () => setIsMuted(prev => !prev);
  const toggleCamera = () => {
    setIsCameraOff(prev => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !(!prev);
            }
        }
        return !prev;
    });
  };

  return (
    <div className="bg-zinc-900 text-white flex flex-col h-full -m-6 p-4">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main User Video */}
        <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center group col-span-1 lg:col-span-2 lg:row-span-2">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
          {!hasCameraPermission && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800">
               <VideoOff className="w-12 h-12 mb-4" />
               <p className="text-lg">Câmera indisponível</p>
               <p className="text-sm text-zinc-400">Verifique as permissões do navegador.</p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 bg-black/50 p-2 rounded-tr-lg">
            <p className="text-white text-sm font-medium">Você</p>
          </div>
        </div>

        {/* Other Participants */}
        {participants.map(p => (
          <ParticipantCard key={p.id} name={p.name} imageHint={p.imageHint} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm">
            <span>09:04</span> | <span>arpol-meet-dds</span>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={toggleMute} variant="secondary" size="icon" className={cn("bg-zinc-700 hover:bg-zinc-600 rounded-full", isMuted && "bg-red-600 hover:bg-red-500")}>
              {isMuted ? <MicOff /> : <Mic />}
            </Button>
             <Button onClick={toggleCamera} variant="secondary" size="icon" className={cn("bg-zinc-700 hover:bg-zinc-600 rounded-full", isCameraOff && "bg-red-600 hover:bg-red-500")}>
              {isCameraOff ? <VideoOff /> : <Video />}
            </Button>
            <Button variant="secondary" className="rounded-full bg-zinc-700 hover:bg-zinc-600"><ChevronUp /></Button>
            <Button variant="secondary" className="rounded-full bg-zinc-700 hover:bg-zinc-600"><ScreenShare /></Button>
            <Button variant="secondary" size="icon" className="rounded-full bg-zinc-700 hover:bg-zinc-600"><MoreVertical /></Button>
            <a href="/dds-info">
              <Button variant="destructive" size="icon" className="rounded-full w-16 h-10"><PhoneOff /></Button>
            </a>
        </div>
        <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon"><Info /></Button>
             <Button variant="ghost" size="icon"><Users /></Button>
             <Button variant="ghost" size="icon"><MessageSquare /></Button>
        </div>
      </div>
    </div>
  );
}
