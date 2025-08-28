'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { messages as initialMessages, Message } from '@/lib/data';
import { MessageCard } from '@/components/dashboard/message-card';
import { SupervisorNeuralNet } from '@/components/dashboard/supervisor-neural-net';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlarmClock, CheckCircle, ShieldAlert, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

function InfoCard({ title, value, icon, colorClass }: { title: string, value: number, icon: React.ReactNode, colorClass?: string }) {
  return (
    <Card className={cn("text-white", colorClass)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}


export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isBrowser, setIsBrowser] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    setIsBrowser(true);
    const loadMessages = () => {
        try {
            const storedMessages = localStorage.getItem('dashboardMessages');
            setMessages(storedMessages ? JSON.parse(storedMessages) : initialMessages);
        } catch (error) {
            console.error("Failed to parse messages from localStorage", error);
            setMessages(initialMessages);
        }
    };
    
    loadMessages();
    window.addEventListener('storage', loadMessages);

    return () => {
        window.removeEventListener('storage', loadMessages);
    }
  }, []);
  
  useEffect(() => {
    if(isBrowser) {
        try {
            localStorage.setItem('dashboardMessages', JSON.stringify(messages));
        } catch (error) {
            console.error("Failed to save messages to localStorage", error);
        }
    }
  }, [messages, isBrowser]);

  const ticketCounts = useMemo(() => {
    return messages.reduce((acc, msg) => {
      if (msg.status === 'Finalizado') {
        acc.finalizado++;
      } else {
        switch (msg.urgency) {
          case 'Crítico':
            acc.critico++;
            break;
          case 'Atenção':
            acc.alerta++;
            break;
          case 'Rotina':
            acc.rotina++;
            break;
        }
      }
      return acc;
    }, { rotina: 0, alerta: 0, critico: 0, finalizado: 0 });
  }, [messages]);


  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
        return;
    }
    
    setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const [draggedItem] = newMessages.splice(dragItem.current!, 1);
        newMessages.splice(dragOverItem.current!, 0, draggedItem);
        
        dragItem.current = null;
        dragOverItem.current = null;
        
        return newMessages;
    });
  };

  if (!isBrowser) {
    return (
       <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {initialMessages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard 
            title="Rotina" 
            value={ticketCounts.rotina} 
            icon={<AlarmClock className="h-4 w-4" />} 
            colorClass="bg-status-new"
        />
        <InfoCard 
            title="Alerta" 
            value={ticketCounts.alerta} 
            icon={<ShieldAlert className="h-4 w-4" />} 
            colorClass="bg-destructive"
        />
        <InfoCard 
            title="Crítico" 
            value={ticketCounts.critico} 
            icon={<Zap className="h-4 w-4" />}
            colorClass="bg-status-critical"
        />
        <InfoCard 
            title="Finalizado" 
            value={ticketCounts.finalizado} 
            icon={<CheckCircle className="h-4 w-4" />}
            colorClass="bg-status-resolved"
        />
       </div>
       
       <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline mb-4">Rede de Supervisores</h1>
        <div className="flex items-center justify-center p-4 bg-card rounded-lg shadow-sm min-h-[350px]">
          <SupervisorNeuralNet />
        </div>
      </div>

      <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Painel de Tickets</h1>
      </div>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center bg-gray-100/50 rounded-lg">
            <p className="text-lg font-semibold text-muted-foreground">Nenhum ticket encontrado.</p>
            <p className="mt-2 text-sm text-muted-foreground">Crie um novo ticket a partir do organograma.</p>
        </div>
        ) : (
            <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
            {messages.map((message, index) => (
                <div
                key={message.id}
                draggable
                onDragStart={() => dragItem.current = index}
                onDragEnter={() => dragOverItem.current = index}
                onDragEnd={handleDragSort}
                onDragOver={(e) => e.preventDefault()}
                className="cursor-move"
                >
                <MessageCard message={message} />
                </div>
            ))}
            </div>
      )}
    </div>
  );
}
