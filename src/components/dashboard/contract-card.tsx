
'use client';

import { useMemo } from 'react';
import { type Contract } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


type AlertLevel = 'critical' | 'warning' | 'none';

export function ContractCard({ 
  contract, 
  alertLevel, 
  onCardClick,
  onSelectClick, 
  isSelected 
}: { 
  contract: Contract; 
  alertLevel: AlertLevel;
  onCardClick: () => void;
  onSelectClick: (e: React.MouseEvent) => void;
  isSelected: boolean;
}) {

  const shadowClass = useMemo(() => {
    switch (alertLevel) {
        case 'critical': return 'animate-shadow-pulse-critical';
        case 'warning': return 'animate-shadow-pulse-warning';
        default: return '';
    }
  }, [alertLevel]);

  return (
    <Card 
      onClick={onCardClick}
      style={{ backgroundImage: `url(${contract.backgroundImage})` }}
      className={cn(
        "group flex flex-col justify-between text-white overflow-hidden shadow-lg relative min-h-[250px] cursor-pointer transition-all duration-300 bg-cover bg-center",
        shadowClass,
        isSelected && 'ring-4 ring-offset-2 ring-accent'
    )}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0 opacity-100 group-hover:opacity-80 transition-opacity duration-300"></div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 text-white bg-black/20 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                onClick={onSelectClick}
              >
                <ListFilter className="h-4 w-4" />
              </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Filtrar tickets por este contrato</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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
