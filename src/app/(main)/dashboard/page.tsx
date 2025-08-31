
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { messages as initialMessages, Message, initialOrgTree, type Contract, type OrgNode, type Employee } from '@/lib/data';
import { MessageCard } from '@/components/dashboard/message-card';
import { SupervisorNeuralNet } from '@/components/dashboard/supervisor-neural-net';
import { ContractCard } from '@/components/dashboard/contract-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlarmClock, CheckCircle, ShieldAlert, Zap, Building, FilterX, List, User, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { findNode, flattenTreeToEmployees } from '@/lib/tree-utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getAvatar } from '@/lib/avatar-storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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
const AVATAR_STORAGE_PREFIX = 'avatar_';


function EmployeeAvatar({ employee }: { employee: Employee }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const updateAvatar = () => {
            const url = getAvatar(employee.id);
            setAvatarUrl(url);
        };

        updateAvatar(); // Initial load

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === `${AVATAR_STORAGE_PREFIX}${employee.id}`) {
                updateAvatar();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [employee.id]);

    const finalAvatarUrl = avatarUrl || employee.avatar;

    return (
        <Avatar className="w-12 h-12">
            <AvatarImage src={finalAvatarUrl ?? undefined} data-ai-hint="person portrait" draggable="false" />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
        </Avatar>
    );
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orgTree, setOrgTree] = useState<OrgNode>(initialOrgTree);
  const [selectedSupervisor, setSelectedSupervisor] = useState<OrgNode | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewingContractTickets, setViewingContractTickets] = useState<Contract | null>(null);
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
            const tree = savedTree ? JSON.parse(savedTree) : initialOrgTree;
            setOrgTree(tree);
            setEmployees(flattenTreeToEmployees(tree));

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
          setSelectedContract(null);
          return;
      }
      if (selectedSupervisor?.id === nodeId) {
          // Deselect if clicking the same node again
          setSelectedSupervisor(null);
          setSelectedContract(null);
      } else {
        const node = findNode(orgTree, nodeId);
        setSelectedSupervisor(node);
        setSelectedContract(null); // Reset contract selection when supervisor changes
      }
  }

  const supervisorContracts = useMemo(() => {
    if (!selectedSupervisor) return [];
    return contracts.filter(c => c.supervisorId === selectedSupervisor.id);
  }, [selectedSupervisor, contracts]);
  
  const handleSelectContract = (contract: Contract) => {
    // This now filters the main ticket list
    setSelectedContract(prev => prev?.id === contract.id ? null : contract);
  }

  const handleViewContractTickets = (contract: Contract) => {
    setViewingContractTickets(contract);
  };

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

  const filteredMessages = useMemo(() => {
    if (selectedContract) {
      return messages.filter(msg => msg.contractName === selectedContract.name);
    }
    if (selectedSupervisor) {
      const supervisorContractNames = contracts
        .filter(c => c.supervisorId === selectedSupervisor.id)
        .map(c => c.name);
      return messages.filter(msg => supervisorContractNames.includes(msg.contractName));
    }
    return messages;
  }, [selectedContract, selectedSupervisor, messages, contracts]);

  const pendingTicketsForModal = useMemo(() => {
    if (!viewingContractTickets) return [];
    return messages.filter(msg => msg.contractName === viewingContractTickets.name && msg.status !== 'Finalizado');
  }, [viewingContractTickets, messages]);

  const teamForModal = useMemo(() => {
    if (!viewingContractTickets) return [];
    return employees.filter(emp => emp.contract === viewingContractTickets.name);
  }, [viewingContractTickets, employees]);


  const handleClearFilter = () => {
    setSelectedSupervisor(null);
    setSelectedContract(null);
  }

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
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold md:text-2xl font-headline">
                  {selectedSupervisor ? `Contratos de ${selectedSupervisor.name}` : 'Painel de Contratos'}
              </h1>
              {selectedSupervisor && (
                <Button variant="ghost" onClick={() => handleSelectContract(selectedContract!)} disabled={!selectedContract}>
                  <List className="mr-2 h-4 w-4" />
                  {selectedContract ? `Filtrando por ${selectedContract.name}` : 'Filtrar Tickets por Contrato'}
                </Button>
              )}
            </div>
            {supervisorContracts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
                    {supervisorContracts.map(contract => (
                       <ContractCard 
                         key={contract.id} 
                         contract={contract} 
                         alertLevel={contractAlertLevels.get(contract.id) || 'none'}
                         onCardClick={() => handleViewContractTickets(contract)}
                         onSelectClick={(e) => {
                           e.stopPropagation();
                           handleSelectContract(contract);
                         }}
                         isSelected={selectedContract?.id === contract.id}
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
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl font-headline">
            {selectedContract 
              ? `Tickets para ${selectedContract.name}` 
              : selectedSupervisor 
              ? `Tickets de ${selectedSupervisor.name}`
              : 'Painel de Tickets'
            }
          </h1>
          {(selectedSupervisor || selectedContract) && (
            <Button variant="ghost" onClick={handleClearFilter}>
                <FilterX className="mr-2 h-4 w-4" />
                Limpar Filtro
            </Button>
          )}
        </div>
      </div>
      {filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center bg-gray-100/50 rounded-lg">
            <p className="text-lg font-semibold text-muted-foreground">Nenhum ticket encontrado.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedContract 
                ? 'Não há tickets para este contrato.' 
                : selectedSupervisor
                ? 'Não há tickets para os contratos deste supervisor.'
                : 'Crie um novo ticket a partir do organograma.'
              }
            </p>
        </div>
        ) : (
            <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
            {filteredMessages.map((message, index) => (
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
       <Dialog open={!!viewingContractTickets} onOpenChange={(isOpen) => !isOpen && setViewingContractTickets(null)}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Tickets Pendentes: {viewingContractTickets?.name}</DialogTitle>
                    <DialogDescription>
                        Abaixo estão todos os tickets com status "Em andamento" para este contrato.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                    <div className="py-4 space-y-6">
                        {pendingTicketsForModal.length > 0 ? (
                            pendingTicketsForModal.map((ticket, index) => (
                                <div key={ticket.id}>
                                    <div className="font-semibold text-md">
                                        Problema: <span className="font-normal text-muted-foreground">{ticket.message}</span>
                                    </div>
                                    <div className="text-sm space-y-1 mt-2">
                                        <p><strong>Autor:</strong> {ticket.author}</p>
                                        <p><strong>Urgência:</strong> {ticket.urgency}</p>
                                        <p><strong>Equipamento:</strong> {ticket.equipmentName || 'N/A'}</p>
                                    </div>
                                    {index < pendingTicketsForModal.length - 1 && <Separator className="mt-6" />}
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">Nenhum ticket pendente para este contrato.</p>
                        )}

                        {teamForModal.length > 0 && (
                            <div>
                                <Separator className="my-6" />
                                <h3 className="text-lg font-semibold mb-4">Equipe Local</h3>
                                <div className="space-y-4">
                                    {teamForModal.map(employee => (
                                        <div key={employee.id} className="flex items-center gap-4 p-2 rounded-lg bg-muted/50">
                                           <EmployeeAvatar employee={employee} />
                                            <div className="text-sm">
                                                <p className="font-semibold">{employee.name}</p>
                                                <p className="text-muted-foreground">{employee.role}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">{employee.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    </div>
  );
}
