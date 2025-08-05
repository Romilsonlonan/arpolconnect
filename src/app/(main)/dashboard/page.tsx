import type { Metadata } from 'next';
import { messages } from '@/lib/data';
import { MessageCard } from '@/components/dashboard/message-card';

export const metadata: Metadata = {
  title: 'Dashboard - Arpolar Connect',
};

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Message Dashboard</h1>
      </div>
      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>
    </>
  );
}
