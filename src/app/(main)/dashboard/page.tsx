'use client';

import type { Metadata } from 'next';
import { useState, useEffect, useRef } from 'react';
import { messages as initialMessages, Message } from '@/lib/data';
import { MessageCard } from '@/components/dashboard/message-card';

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBrowser, setIsBrowser] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
    setIsBrowser(true);
  }, []);
  
  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const items = Array.from(messages);
    const [reorderedItem] = items.splice(dragItem.current, 1);
    items.splice(dragOverItem.current, 0, reorderedItem);

    dragItem.current = null;
    dragOverItem.current = null;
    setMessages(items);
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
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Message Dashboard</h1>
      </div>
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
    </>
  );
}
