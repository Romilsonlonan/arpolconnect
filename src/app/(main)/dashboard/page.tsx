'use client';

import type { Metadata } from 'next';
import { useState, useEffect } from 'react';
import { messages as initialMessages, Message } from '@/lib/data';
import { MessageCard } from '@/components/dashboard/message-card';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setMessages(initialMessages);
    setIsBrowser(true);
  }, []);
  
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(messages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMessages(items);
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Message Dashboard</h1>
      </div>
      {isBrowser ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="messages">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {messages.map((message, index) => (
                  <Draggable key={message.id} draggableId={message.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <MessageCard message={message} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
         <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {initialMessages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
      )}
    </>
  );
}
