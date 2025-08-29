
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { messages as initialMessages, Message, initialOrgTree, type Contract, type OrgNode } from '@/lib/data';
import { MessageCard } from '@/components/dashboard/message-card';
import { SupervisorNeuralNet } from '@/components/dashboard/supervisor-neural-net';
import { ContractCard } from '@/components/dashboard/contract-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlarmClock, CheckCircle, ShieldAlert, Zap, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { findNode } from '@/lib/tree-utils';

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

const CONTRACTS_STORAGE_KEY = 'arpolarContracts';
const ORG_CHART_STORAGE_KEY = 'orgChartTree';

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [orgTree, setOrgTree] = useState<OrgNode>(initialOrgTree);
  const [selectedSupervisor, setSelectedSupervisor] = useState<OrgNode | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    setIsBrowser(true);
    const loadData = () => {
        try {
            const storedMessages = localStorage.getItem('dashboardMessages');
            setMessages(storedMessages ? JSON.parse(storedMessages) : initialMessages);

            const savedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
            setContracts(savedContracts ? JSON.parse(savedContracts) : []);

            const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
            setOrgTree(savedTree ? JSON.parse(savedTree) : initialOrgTree);

        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
            setMessages(initialMessages);
        }
    };
    
    loadData();
    window.addEventListener('storage', loadData);

    return () => {
        window.removeEventListener('storage', loadData);
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

  const handleSelectSupervisor = (nodeId: string | null) => {
      if (nodeId === null) {
          setSelectedSupervisor(null);
          return;
      }
      if (selectedSupervisor?.id === nodeId) {
          // Deselect if clicking the same node again
          setSelectedSupervisor(null);
      } else {
        const node = findNode(orgTree, nodeId);
        setSelectedSupervisor(node);
      }
  }

  const supervisorContracts = useMemo(() => {
    if (!selectedSupervisor) return [];
    return contracts.filter(c => c.supervisorId === selectedSupervisor.id);
  }, [selectedSupervisor, contracts]);

  const contractAlertLevels = useMemo(() => {
    const alertMap = new Map<string, 'critical' | 'warning' | 'none'>();
    supervisorContracts.forEach(contract => {
        const contractMessages = messages.filter(msg => msg.contractName === contract.name && msg.status !== 'Finalizado');
        let level: 'critical' | 'warning' | 'none' = 'none';

        if (contractMessages.some(msg => msg.urgency === 'Crítico')) {
            level = 'critical';
        } else if (contractMessages.some(msg => msg.urgency === 'Atenção')) {
            level = 'warning';
        }
        alertMap.set(contract.id, level);
    });
    return alertMap;
  }, [supervisorContracts, messages]);


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
          <SupervisorNeuralNet onNodeClick={handleSelectSupervisor} selectedNodeId={selectedSupervisor?.id || null} />
        </div>
      </div>
      
       <div>
            <h1 className="text-lg font-semibold md:text-2xl font-headline">
                {selectedSupervisor ? `Contratos de ${selectedSupervisor.name}` : 'Painel de Contratos'}
            </h1>
            {supervisorContracts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
                    {supervisorContracts.map(contract => (
                       <ContractCard 
                         key={contract.id} 
                         contract={contract} 
                         alertLevel={contractAlertLevels.get(contract.id) || 'none'}
                       />
                    ))}
                </div>
             ) : (
                 <div className="flex flex-col items-center justify-center flex-1 py-12 text-center bg-gray-100/50 rounded-lg mt-4">
                    <Building className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">
                        {selectedSupervisor ? 'Nenhum contrato encontrado para este supervisor.' : 'Selecione um supervisor na rede para ver seus contratos.'}
                    </p>
                </div>
             )}
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

    