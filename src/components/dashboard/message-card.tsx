
'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow, differenceInHours } from 'date-fns';
import type { Message } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Briefcase, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


type StatusInfo = {
  label: string;
  colorClass: string;
  pulse: boolean;
  shadowClass?: string;
};

export function MessageCard({ message }: { message: Message }) {
  const [timeAgo, setTimeAgo] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const updateTimes = () => {
        setTimeAgo(formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }));
    };
    updateTimes();
    const interval = setInterval(updateTimes, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [message.createdAt]);

  const statusInfo = useMemo((): StatusInfo => {
    if (message.status === 'Finalizado') {
      return { label: 'Finalizado', colorClass: 'bg-status-resolved', pulse: false };
    }

    let urgency = message.urgency;
    if (message.urgency === 'Rotina') {
        const hoursSinceCreation = differenceInHours(new Date(), new Date(message.createdAt));
        if (hoursSinceCreation >= 72) {
            urgency = 'Crítico';
        } else if (hoursSinceCreation >= 48) {
            urgency = 'Atenção';
        }
    }

    switch (urgency) {
      case 'Crítico':
        return { label: 'Crítico (escalado)', colorClass: 'bg-status-critical text-white', pulse: true, shadowClass: 'animate-shadow-pulse-critical' };
      case 'Atenção':
        return { label: 'Atenção (escalado)', colorClass: 'bg-destructive', pulse: true, shadowClass: 'animate-shadow-pulse-warning' };
      case 'Rotina':
      default:
        return { label: 'Rotina', colorClass: 'bg-status-new', pulse: false };
    }
  }, [message.status, message.urgency, message.createdAt]);

  return (
    <Card className={cn(
        "flex flex-col transition-transform duration-300 h-full",
        statusInfo.shadowClass
    )}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-bold font-headline pr-2">{message.contractName}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={cn(
                    "flex items-center justify-center h-7 w-7 rounded-full",
                    statusInfo.colorClass,
                    statusInfo.pulse && 'animate-pulse'
                  )}
                >
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{statusInfo.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="flex flex-col gap-1 text-xs pt-2">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3"/> Supervisor: {message.supervisor}
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-3 h-3"/> Contato: {message.contact}
          </div>
           <div className="flex items-center gap-2">
            <Tag className="w-3 h-3"/> Criado por: {message.author}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm font-semibold mb-2">Problema:</p>
        <p className="text-sm text-muted-foreground line-clamp-3">{message.message}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground mt-auto">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{isClient ? timeAgo : '...'}</span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" draggable="false">Detalhes</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Ticket: {message.contractName}</DialogTitle>
              <DialogDescription>
                Informações completas sobre o ticket de serviço.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 text-sm">
                <p><strong>Mensagem:</strong> {message.message}</p>
                <p><strong>Status:</strong> {message.status}</p>
                <hr/>
                <h4 className="font-semibold">Informações Técnicas</h4>
                <p><strong>Equipamento:</strong> {message.equipmentName || 'N/A'}</p>
                <p><strong>Marca:</strong> {message.equipmentBrand || 'N/A'}</p>
                <p><strong>Modelo:</strong> {message.equipmentModel || 'N-A'}</p>
                <p><strong>Causa Provável:</strong> {message.cause || 'N/A'}</p>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
