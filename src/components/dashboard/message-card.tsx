'use client';

import { useMemo } from 'react';
import { differenceInHours, formatDistanceToNow } from 'date-fns';
import type { Message } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = {
  label: string;
  colorClass: string;
  pulse: boolean;
};

export function MessageCard({ message }: { message: Message }) {
  const status = useMemo((): Status => {
    const hoursDiff = differenceInHours(new Date(), new Date(message.createdAt));
    
    if (message.status === 'resolved') {
      return { label: 'Resolved', colorClass: 'bg-status-resolved', pulse: false };
    }
    if (hoursDiff > 72) {
      return { label: 'Critical', colorClass: 'bg-status-critical', pulse: true };
    }
    if (hoursDiff > 48) {
      return { label: 'Warning', colorClass: 'bg-status-warning', pulse: false };
    }
    return { label: 'New', colorClass: 'bg-status-new', pulse: false };
  }, [message.createdAt, message.status]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-bold font-headline pr-2">{message.title}</CardTitle>
          <div
            className={cn(
              "flex items-center gap-2 text-xs font-semibold text-white px-2 py-1 rounded-full whitespace-nowrap",
              status.colorClass,
              status.pulse && 'animate-pulse'
            )}
          >
            {status.label}
          </div>
        </div>
        <CardDescription className="flex items-center gap-2 text-xs pt-2">
            <User className="w-3 h-3"/> From: {message.author}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm">{message.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
        </div>
        <Button variant="outline" size="sm">Details</Button>
      </CardFooter>
    </Card>
  );
}
