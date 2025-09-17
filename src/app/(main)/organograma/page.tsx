
'use client';

import { useState, useEffect, useMemo } from 'react';
import { initialOrgTree, type OrgNode, type Contract, type User as AppUser, type Message } from '@/lib/data';
import { TreeNode } from '@/components/organization/tree-node';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { buildTreeFromUsersAndContracts } from '@/lib/tree-utils';
import { TicketModal } from '@/components/organization/ticket-modal';

const ORG_CHART_STORAGE_KEY = 'orgChartTree';
const DASHBOARD_MESSAGES_KEY = 'dashboardMessages';
const CONTRACTS_STORAGE_KEY = 'arpolarContracts';
const USERS_STORAGE_KEY = 'arpolarUsers';


export default function OrganogramaPage() {
  const [zoom, setZoom] = useState(1);
  const [tree, setTree] = useState<OrgNode | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketNode, setTicketNode] = useState<OrgNode | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  
  const loadData = () => {
     try {
      // These are the sources of truth
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const savedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
      const savedMessages = localStorage.getItem(DASHBOARD_MESSAGES_KEY);

      const users: AppUser[] = savedUsers ? JSON.parse(savedUsers) : [];
      const contracts: Contract[] = savedContracts ? JSON.parse(savedContracts) : [];
      
      setAllUsers(users);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      
      const generatedTree = buildTreeFromUsersAndContracts(users, contracts);
      setTree(generatedTree);

    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      setTree(initialOrgTree);
    }
  }

  useEffect(() => {
    setIsClient(true);
    loadData();

    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Placeholder functions, as direct editing from organograma is disabled
  const handlePlaceholder = () => {};

  const handleOpenTicketModal = (node: OrgNode) => {
    setTicketNode(node);
    setIsTicketModalOpen(true);
  };

  const handleSaveTicket = (ticketData: Omit<Message, 'id' | 'createdAt' | 'author'>) => {
    if (!ticketNode) return;

    const newTicket: Message = {
      ...ticketData,
      id: `ticket-${Date.now()}`,
      author: ticketNode.name, 
      createdAt: new Date().toISOString(),
    };

    const existingMessages: Message[] = JSON.parse(localStorage.getItem(DASHBOARD_MESSAGES_KEY) || '[]');
    localStorage.setItem(DASHBOARD_MESSAGES_KEY, JSON.stringify([newTicket, ...existingMessages]));
    setMessages([newTicket, ...existingMessages]);
    
    setIsTicketModalOpen(false);
    setTicketNode(null);
  };

  const privateTicketCounts = useMemo(() => {
    const counts = new Map<string, number>();
    messages.forEach(msg => {
      if (msg.visibility === 'privado' && msg.recipientId) {
        counts.set(msg.recipientId, (counts.get(msg.recipientId) || 0) + 1);
      }
    });
    return counts;
  }, [messages]);


  if (!isClient || !tree) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center pb-4 border-b gap-4">
        <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Organograma</h1>
        </div>
        <div className="ml-0 sm:ml-auto flex items-center gap-2 sm:gap-4">
          <p className="text-sm text-muted-foreground">O organograma é montado dinamicamente. Para editar, vá ao painel de Admin.</p>
          <div className="flex items-center gap-2 w-36 sm:w-48">
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={0.2}
              max={2}
              step={0.1}
            />
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" size="icon" onClick={() => setZoom(1)}><RotateCcw className="h-4 w-4" /></Button>
        </div>
      </div>
      <div
        className="flex-grow overflow-auto p-4 rounded-lg mt-4 bg-cover bg-center"
        style={{ backgroundImage: `url('https://i.ibb.co/zVzbGGgD/fundoaqc.jpg')` }}
      >
        <div
          className="transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >
          <TreeNode
            node={tree}
            onUpdate={handlePlaceholder}
            onAddChild={handlePlaceholder}
            onRemove={handlePlaceholder}
            onMoveNode={handlePlaceholder}
            onOpenTicketModal={handleOpenTicketModal}
            onToggleVisibility={handlePlaceholder}
            privateTicketCount={privateTicketCounts.get(tree.id) || 0}
            isRoot={true}
          />
        </div>
      </div>
       <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSave={handleSaveTicket}
        node={ticketNode}
        allUsers={allUsers}
      />
    </div>
  );
}
