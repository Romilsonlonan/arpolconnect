
'use client';

import { useMemo } from 'react';
import type { Message } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type StatusInfo = {
  label: string;
  colorClass: string;
};

export function GroupedTicketCard({ ticket, onDelete }: { ticket: Message; onDelete: () => void; }) {
  const statusInfo = useMemo((): StatusInfo => {
    if (ticket.status === 'Finalizado') {
      return { label: 'Finalizado', colorClass: 'bg-status-resolved' };
    }
    switch (ticket.urgency) {
      case 'Crítico':
        return { label: 'Crítico', colorClass: 'bg-status-critical' };
      case 'Atenção':
        return { label: 'Atenção', colorClass: 'bg-destructive' };
      case 'Rotina':
      default:
        return { label: 'Rotina', colorClass: 'bg-status-new' };
    }
  }, [ticket.status, ticket.urgency]);

  return (
    <Card className="flex flex-col transition-shadow duration-300 h-full shadow-md hover:shadow-lg relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="h-7 w-7">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso removerá permanentemente o ticket.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-bold font-headline pr-2">{ticket.contractName}</CardTitle>
            <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                <div className={cn("h-4 w-4 rounded-full", statusInfo.colorClass)} />
                </TooltipTrigger>
                <TooltipContent>
                <p>{statusInfo.label}</p>
                </TooltipContent>
            </Tooltip>
            </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{ticket.message}</p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</p>
      </CardFooter>
    </Card>
  );
}
