'use client';

import { useState, useEffect, useRef } from 'react';
import { messages as initialMessages, Message } from '@/lib/data';
import { MessageCard } from '@/components/dashboard/message-card';

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isBrowser, setIsBrowser] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    setIsBrowser(true);
    const storedMessages = localStorage.getItem('dashboardMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages(initialMessages);
    }
  }, []);
  
  useEffect(() => {
    if(isBrowser) {
        localStorage.setItem('dashboardMessages', JSON.stringify(messages));
    }
  }, [messages, isBrowser]);

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
    <>
      <div className="flex items-center">
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
    </>
  );
}
