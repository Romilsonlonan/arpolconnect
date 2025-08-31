
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background/80 animate-in fade-in-50 duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse-slow">
            <Image 
                src="https://i.ibb.co/ksM7sG9D/Logo.png" 
                alt="Arpolar Connect Logo" 
                width={80} 
                height={80} 
                className="h-20 w-20"
                priority
            />
        </div>
        <p className="text-muted-foreground font-semibold">Carregando...</p>
      </div>
    </div>
  );
}
