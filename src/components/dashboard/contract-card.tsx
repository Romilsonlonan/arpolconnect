
'use client';

import { useMemo } from 'react';
import { type Contract } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type AlertLevel = 'critical' | 'warning' | 'none';

export function ContractCard({ contract, alertLevel }: { contract: Contract; alertLevel: AlertLevel }) {

  const shadowClass = useMemo(() => {
    switch (alertLevel) {
        case 'critical': return 'animate-shadow-pulse-critical';
        case 'warning': return 'animate-shadow-pulse-warning';
        default: return '';
    }
  }, [alertLevel]);

  return (
    <Card className={cn(
        "group flex flex-col justify-between text-white overflow-hidden shadow-lg relative min-h-[250px]",
        shadowClass
    )}>
       <Image 
        src={contract.backgroundImage} 
        alt={`Imagem de fundo para ${contract.name}`}
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0"></div>
      <CardHeader>
        <CardTitle className="text-xl font-bold font-headline z-10">{contract.name}</CardTitle>
        <CardDescription className="text-white/80 z-10">{contract.address}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-sm z-10">
         <div className="flex items-center gap-2">
            <User className="w-4 h-4"/>
            <span>{contract.supervisorName}</span>
         </div>
         <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4"/>
            <span>{contract.region}</span>
         </div>
      </CardFooter>
    </Card>
  );
}

    