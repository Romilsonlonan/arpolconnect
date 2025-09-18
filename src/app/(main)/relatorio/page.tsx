
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BANNER_STORAGE_KEY = 'reportBannerImage';

export default function ReportBannerPage() {
  const [bannerImage, setBannerImage] = useState('https://picsum.photos/seed/report-banner/1200/600');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

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
              description: 'A nova imagem de banner foi salva.',
            });
        } catch (error) {
             toast({
              title: 'Erro ao Salvar',
              description: 'A imagem é muito grande. Por favor, escolha um arquivo menor.',
              variant: 'destructive',
            });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-headline">Indicadores de Planejamento</h1>
          <p className="text-muted-foreground">Escolha um relatório para visualizar os indicadores de desempenho.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Banner do Relatório</CardTitle>
            <CardDescription>Clique na imagem para navegar ou altere o banner.</CardDescription>
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
        <CardContent className="flex-1 flex items-center justify-center p-0">
           <Link href="/relatorio/detalhes" className="w-full h-full block">
             <div className="relative w-full h-full">
                <Image
                    src={bannerImage}
                    alt="Banner do Relatório"
                    fill
                    className="object-cover"
                    data-ai-hint="presentation business"
                    unoptimized
                />
             </div>
           </Link>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-4">
        <Link href="/relatorio/detalhes">
            <Button>
                Visualizar Relatório
                <ArrowRight className="ml-2"/>
            </Button>
        </Link>
      </div>
    </div>
  );
}
