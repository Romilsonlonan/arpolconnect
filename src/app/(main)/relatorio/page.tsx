
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';

export default function ReportBannerPage() {
  const [bannerImage, setBannerImage] = useState('https://picsum.photos/seed/report-banner/1200/600');

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
          <Button variant="outline">
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
