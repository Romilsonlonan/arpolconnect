
'use client';

import { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference, useToken } from '@livekit/components-react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const USER_SETTINGS_STORAGE_KEY = 'userSettings';

export default function ArpolMeetPage() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get('room') || 'arpol-meet-dds';
  
  const [userInfo, setUserInfo] = useState({ name: 'Participante' });

  useEffect(() => {
      const savedSettings = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
      if (savedSettings) {
          try {
              const settings = JSON.parse(savedSettings);
              setUserInfo({ name: settings.name || 'Participante' });
          } catch(e) {
              console.error("Failed to parse user settings", e);
          }
      }
  }, []);
  
  const token = useToken('/api/livekit', roomName, {
      userInfo: {
          name: userInfo.name,
      }
  });


  if (token === null) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <h1 className="text-2xl font-bold">Entrando na sala...</h1>
            <p className="text-muted-foreground">Estamos preparando tudo para você.</p>
        </div>
    )
  }

  return (
    <div className="h-full w-full">
        <div data-lk-theme="default" className='h-full w-full'>
            <LiveKitRoom
                token={token}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                connect={true}
                video={true}
                audio={true}
            >
                <VideoConference />
            </LiveKitRoom>
        </div>
    </div>
  );
}
