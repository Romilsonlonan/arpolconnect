
'use client';

import { useState, useEffect, useMemo } from 'react';
import { type Message, type OrgNode, initialOrgTree, type User as AppUser } from '@/lib/data';
import { getAllNodes } from '@/lib/tree-utils';
import { GroupedTicketCard } from '@/components/tickets/grouped-ticket-card';
import { TicketModal } from '@/components/organization/ticket-modal';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, ArrowRight, User, Aperture } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatar } from '@/lib/avatar-storage';

const DASHBOARD_MESSAGES_KEY = 'dashboardMessages';
const ORG_CHART_STORAGE_KEY = 'orgChartTree';
const USERS_STORAGE_KEY = 'arpolarUsers';

type GroupedTickets = {
  author: string;
  authorDetails?: {
    avatar: string;
    role: string;
  };
  tickets: Message[];
};

export default function TicketsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [allNodes, setAllNodes] = useState<OrgNode[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const { toast } = useToast();

  const loadData = () => {
    try {
      const savedMessages = localStorage.getItem(DASHBOARD_MESSAGES_KEY);
      setMessages(savedMessages ? JSON.parse(savedMessages) : []);

      const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
      const treeToLoad = savedTree ? JSON.parse(savedTree) : initialOrgTree;
      setAllNodes(getAllNodes(treeToLoad));
      
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      setAllUsers(savedUsers ? JSON.parse(savedUsers) : []);

    } catch (error) {
      console.error('Failed to load data from localStorage', error);
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleSaveTicket = (ticketData: Omit<Message, 'id' | 'createdAt' | 'author'>) => {
    const newTicket: Message = {
      ...ticketData,
      id: `ticket-${Date.now()}`,
      author: ticketData.supervisor, // Assuming supervisor is the author here.
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [newTicket, ...messages];
    localStorage.setItem(DASHBOARD_MESSAGES_KEY, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);

    setIsTicketModalOpen(false);
    toast({
        title: "Ticket Criado!",
        description: "O ticket foi criado e enviado.",
    });
  };

  const handleDeleteTicket = (ticketId: string) => {
    const ticketToDelete = messages.find(m => m.id === ticketId);
    if (!ticketToDelete) return;

    const updatedMessages = messages.filter(m => m.id !== ticketId);
    localStorage.setItem(DASHBOARD_MESSAGES_KEY, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);

    toast({
      title: 'Ticket Deletado',
      description: `O ticket para "${ticketToDelete.contractName}" foi removido.`,
    });
  };

  const groupedTickets = useMemo(() => {
    const groups: { [key: string]: GroupedTickets } = {};
    const userMap = new Map(allUsers.map(user => [user.name, user]));

    messages.forEach(message => {
      const author = message.author;
      if (!groups[author]) {
        const authorUser = userMap.get(author);
        groups[author] = {
          author: author,
          authorDetails: authorUser ? {
            avatar: getAvatar(authorUser.id) || '',
            role: authorUser.role,
          } : undefined,
          tickets: [],
        };
      }
      groups[author].tickets.push(message);
    });

    return Object.values(groups).sort((a, b) => b.tickets.length - a.tickets.length);
  }, [messages, allUsers]);

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl font-headline">Tickets por Responsável</h1>
          <p className="text-muted-foreground">Visualize todos os tickets abertos, agrupados por quem os criou.</p>
        </div>
        <Button onClick={() => setIsTicketModalOpen(true)}>
          <PlusCircle className="mr-2" />
          Criar Ticket
        </Button>
      </div>

      <div className="space-y-8">
        {groupedTickets.length === 0 ? (
           <div className="flex flex-col items-center justify-center flex-1 py-20 text-center bg-gray-100/50 rounded-lg">
                <Aperture className="w-16 h-16 text-muted-foreground mb-4"/>
                <p className="text-lg font-semibold text-muted-foreground">Nenhum ticket encontrado.</p>
                <p className="mt-2 text-sm text-muted-foreground">Crie um novo ticket para começar.</p>
            </div>
        ) : (
            groupedTickets.map(group => (
            <div key={group.author} className="p-4 rounded-lg bg-card border">
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={group.authorDetails?.avatar} />
                        <AvatarFallback>{group.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-lg">{group.author}</h2>
                        <p className="text-sm text-muted-foreground">{group.authorDetails?.role}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <ArrowRight className="h-5 w-5" />
                    <span className="sr-only">Ver todos</span>
                </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.tickets.slice(0, 8).map(ticket => (
                    <GroupedTicketCard key={ticket.id} ticket={ticket} onDelete={() => handleDeleteTicket(ticket.id)} />
                ))}
                </div>
            </div>
            ))
        )}
      </div>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSave={handleSaveTicket}
        node={null} // Pass null as we are creating a generic ticket
        allUsers={allUsers}
      />
    </div>
  );
}
