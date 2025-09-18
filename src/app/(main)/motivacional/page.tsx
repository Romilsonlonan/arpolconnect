
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Upload, Maximize, Minimize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const BANNER_STORAGE_KEY = 'motivacionalBannerImage';

export default function MotivacionalPage() {
  const [bannerImage, setBannerImage] = useState('https://picsum.photos/seed/motivacional-banner/1200/600');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedBanner = localStorage.getItem(BANNER_STORAGE_KEY);
    if (savedBanner) {
        setBannerImage(savedBanner);
    }
  }, []);

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        try {
            localStorage.setItem(BANNER_STORAGE_KEY, result);
            setBannerImage(result);
            toast({
              title: 'Banner Alterado',
              description: 'A nova imagem motivacional foi salva no armazenamento local.',
            });
        } catch(err) {
             toast({
              title: 'Aviso: Imagem muito grande',
              description: 'A imagem pode ser grande demais para ser salva permanentemente no navegador.',
              variant: 'destructive',
            });
            setBannerImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center gap-4 mb-6", isFullscreen && "hidden")}>
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-headline">Página Motivacional</h1>
          <p className="text-muted-foreground">Inspire sua equipe com uma mensagem ou imagem.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        {!isFullscreen && (
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Banner Motivacional</CardTitle>
                <CardDescription>Clique na imagem para visualizar ou altere o banner.</CardDescription>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleBannerChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
            />
            <Button variant="outline" onClick={triggerFileInput}>
                <Upload className="mr-2"/>
                Alterar Banner
            </Button>
            </CardHeader>
        )}
        <CardContent className="flex-1 flex items-center justify-center p-0 relative">
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 z-10 bg-black/30 hover:bg-black/50 text-white hover:text-white"
                onClick={() => setIsFullscreen(!isFullscreen)}
            >
                {isFullscreen ? <Minimize /> : <Maximize />}
            </Button>
           <div className="relative w-full h-full">
              <Image
                  src={bannerImage}
                  alt="Banner Motivacional"
                  fill
                  className="object-cover"
                  data-ai-hint="inspirational quote"
                  unoptimized
              />
           </div>
        </CardContent>
      </Card>
      
      {!isFullscreen && (
        <div className="flex justify-end mt-4">
            <Link href="/relatorio">
                <Button>
                    Relatório de Atividades
                    <ArrowRight className="ml-2"/>
                </Button>
            </Link>
        </div>
      )}
    </div>
  );
}
