
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Trash2, Pencil, FolderOpen, History, UserCheck, AlertTriangle, FilterX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { User, Contract, ContractDocument } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { UserModal } from '@/components/admin/user-modal';
import { ContractModal } from '@/components/contracts/contract-modal';
import { ContractDocsModal } from '@/components/contracts/contract-docs-modal';
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
import { getAvatar, saveAvatar } from '@/lib/avatar-storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { differenceInDays, isValid, format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { removeNodeFromTree } from '@/lib/tree-utils';

const USERS_STORAGE_KEY = 'arpolarUsers';
const CONTRACTS_STORAGE_KEY = 'arpolarContracts';
const ORG_CHART_STORAGE_KEY = 'orgChartTree';


// --- Componente do Cartão de Status do Documento ---
function DocStatusCard({ contract }: { contract: Contract }) {

    const getStatus = () => {
        if (!contract.docStartDate || !contract.docEndDate) {
            return {
                daysRemaining: null,
                statusColor: 'bg-gray-500',
                statusText: 'Datas do documento não definidas',
            };
        }

        // Adjust for timezone issues by appending T00:00:00
        const startDate = new Date(`${contract.docStartDate}T00:00:00`);
        const expiryDate = new Date(`${contract.docEndDate}T00:00:00`);
        
        if (!isValid(startDate) || !isValid(expiryDate)) {
             return { daysRemaining: null, statusColor: 'bg-gray-500', statusText: 'Datas inválidas' };
        }

        const daysRemaining = differenceInDays(expiryDate, new Date());

        if (daysRemaining < 0) {
            return { daysRemaining, statusColor: 'bg-black', statusText: 'Vencida' };
        }
        if (daysRemaining <= 7) {
            return { daysRemaining, statusColor: 'bg-destructive', statusText: 'Vencimento crítico' };
        }
        return {
            daysRemaining,
            statusColor: 'bg-sky-600',
            statusText: 'Em dia',
        };
    };

    const { daysRemaining, statusColor, statusText } = getStatus();
    const startDate = contract.docStartDate ? new Date(`${contract.docStartDate}T00:00:00`) : null;
    const expiryDate = contract.docEndDate ? new Date(`${contract.docEndDate}T00:00:00`) : null;


    return (
        <Card className={cn("text-white w-full max-w-md mx-auto shadow-lg", statusColor)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <AlertTriangle/>
                    Status do Documento Principal
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm opacity-80">Contrato</p>
                    <p className="font-bold text-lg">{contract.name}</p>
                </div>
                 <div>
                    <p className="text-sm opacity-80">Tipo de Documento</p>
                    <p className="font-semibold">{contract.documentType || 'Não informado'}</p>
                </div>
                <div className="flex justify-between">
                    <div>
                        <p className="text-sm opacity-80">Data de Início</p>
                        <p className="font-semibold">{startDate && isValid(startDate) ? format(startDate, 'dd/MM/yyyy') : 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-sm opacity-80">Data de Fim</p>
                        <p className="font-semibold">{expiryDate && isValid(expiryDate) ? format(expiryDate, 'dd/MM/yyyy') : 'N/A'}</p>
                    </div>
                </div>
                {daysRemaining !== null ? (
                    <div className="text-center bg-black/20 p-3 rounded-lg">
                        <p className="text-sm opacity-80">Status</p>
                        <p className="text-2xl font-bold">
                            {daysRemaining >= 0 ? `${daysRemaining} dias restantes` : `Vencida há ${Math.abs(daysRemaining)} dias`}
                        </p>
                        <p className="text-sm font-medium">{statusText}</p>
                    </div>
                ) : (
                     <div className="text-center bg-black/20 p-3 rounded-lg">
                        <p className="font-semibold">Este documento não tem controle de vencimento.</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}

function UserAvatar({ user }: { user: User }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const updateAvatar = () => {
            const url = getAvatar(user.id);
            setAvatarUrl(url);
        };
        updateAvatar();
        window.addEventListener('storage', updateAvatar);
        return () => window.removeEventListener('storage', updateAvatar);
    }, [user.id]);

    return (
        <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
    );
}


export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  // User Modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Contract Modal state
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  // Docs Modal state
  const [docsModalContract, setDocsModalContract] = useState<Contract | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // New state for filters and selected contract info
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string | null>(null);
  const [selectedContractForInfo, setSelectedContractForInfo] = useState<Contract | null>(null);


  const loadData = () => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const savedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
      
      const allUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      setUsers(allUsers);
      setContracts(savedContracts ? JSON.parse(savedContracts) : []);
      
      const adminUser = allUsers.find(u => u.role === 'Administrador');
      setCurrentUser(adminUser || null);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // --- User Management ---
  const handleOpenAddUserModal = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
    setIsContractModalOpen(false); // Close other modal
  };

  const handleOpenEditUserModal = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
    setIsContractModalOpen(false); // Close other modal
  };

  const handleSaveUser = (userData: Omit<User, 'id'>, id?: string, avatarDataUrl?: string) => {
    let currentUsers: User[] = [];
    try {
      currentUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
      currentUsers = [];
    }

    let updatedUsers: User[];
    let toastTitle = '';
    let toastDescription = '';
    let userId = id;

    if (userId) { // Editing user
      updatedUsers = currentUsers.map(u => u.id === userId ? { ...u, ...userData, id: userId } : u);
      toastTitle = "Usuário Atualizado!";
      toastDescription = `As informações de "${userData.name}" foram atualizadas.`;
    } else { // Adding new user
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`
      };
      userId = newUser.id;
      updatedUsers = [...currentUsers, newUser];
      toastTitle = "Usuário Adicionado!";
      toastDescription = `O usuário "${newUser.name}" foi criado com sucesso.`;
    }

    if (avatarDataUrl && avatarDataUrl.startsWith('data:image') && userId) {
        try {
            saveAvatar(userId, avatarDataUrl);
        } catch(e) {
             toast({
                title: "Erro ao salvar imagem",
                description: "A imagem é muito grande. Tente uma menor.",
                variant: 'destructive',
            });
        }
    }


    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    window.dispatchEvent(new StorageEvent('storage', { key: USERS_STORAGE_KEY }));
    
    toast({ title: toastTitle, description: toastDescription });
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleToggleUserStatus = (userId: string, currentStatus: 'Ativo' | 'Inativo') => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    window.dispatchEvent(new StorageEvent('storage', { key: USERS_STORAGE_KEY }));
    
    toast({ 
        title: `Usuário ${newStatus === 'Ativo' ? 'Reativado' : 'Desativado'}`, 
        description: `O status de ${userToUpdate.name} foi alterado para ${newStatus}.` 
    });
  };
  
  // --- Contract Management ---
  const handleOpenAddContractModal = () => {
    setEditingContract(null);
    setIsContractModalOpen(true);
    setIsUserModalOpen(false); // Close other modal
  }

  const handleOpenEditContractModal = (contract: Contract) => {
    setEditingContract(contract);
    setIsContractModalOpen(true);
    setIsUserModalOpen(false); // Close other modal
  }
  
  const handleOpenDocsModal = (contract: Contract) => {
    setDocsModalContract(contract);
  }

  const handleSaveContract = (contractData: Omit<Contract, 'id'|'documents'>, id?: string) => {
    let currentContracts: Contract[] = [];
    try {
       currentContracts = JSON.parse(localStorage.getItem(CONTRACTS_STORAGE_KEY) || '[]');
    } catch (e) {
      console.error("Failed to parse contracts from localStorage", e);
      currentContracts = [];
    }

    let updatedContracts: Contract[];
    let toastTitle = '';
    
    if (id) {
        updatedContracts = currentContracts.map(c => c.id === id ? { ...c, ...contractData, id } : c);
        toastTitle = "Contrato Atualizado!";
    } else {
        const newContract: Contract = {
            ...contractData,
            id: `contract-${Date.now()}`,
            documents: [],
            status: 'Ativo' // Default status for new contracts
        };
        updatedContracts = [...currentContracts, newContract];
        toastTitle = "Contrato Adicionado!";
    }
      
    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));
    window.dispatchEvent(new StorageEvent('storage', { key: CONTRACTS_STORAGE_KEY }));
    
    toast({ title: toastTitle });
    setIsContractModalOpen(false);
    setEditingContract(null);
  };
  
  const handleToggleContractStatus = (contractId: string, currentStatus: 'Ativo' | 'Inativo') => {
    const contractToUpdate = contracts.find(c => c.id === contractId);
    if (!contractToUpdate) return;

    const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
    const updatedContracts = contracts.map(c => c.id === contractId ? { ...c, status: newStatus } : c);

    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));
    window.dispatchEvent(new StorageEvent('storage', { key: CONTRACTS_STORAGE_KEY }));
    window.dispatchEvent(new StorageEvent('storage', { key: ORG_CHART_STORAGE_KEY })); // Update org chart as well

    toast({ 
      title: `Contrato ${newStatus === 'Ativo' ? 'Reativado' : 'Desativado'}`,
      description: `O status do contrato "${contractToUpdate.name}" foi alterado.`
    });
  };

  const handleDeleteContract = (contractId: string) => {
    const contractToDelete = contracts.find(c => c.id === contractId);
    if (!contractToDelete) return;

    const updatedContracts = contracts.filter(c => c.id !== contractId);
    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));
    
    // Also remove any employees associated with this contract from the org chart
     const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
    if (savedTree) {
      let tree = JSON.parse(savedTree);
      tree = removeNodeFromTree(tree, contractId);
      localStorage.setItem(ORG_CHART_STORAGE_KEY, JSON.stringify(tree));
    }
    
    window.dispatchEvent(new StorageEvent('storage', { key: CONTRACTS_STORAGE_KEY }));
    window.dispatchEvent(new StorageEvent('storage', { key: ORG_CHART_STORAGE_KEY }));

    toast({ 
      title: "Contrato Deletado",
      description: `O contrato "${contractToDelete.name}" foi removido permanentemente.`,
      variant: 'destructive',
    });
  };

  
  // --- Document Management ---
  const handleSaveDocument = (contractId: string, document: Omit<ContractDocument, 'id' | 'uploadedAt'>) => {
    const allContracts: Contract[] = JSON.parse(localStorage.getItem(CONTRACTS_STORAGE_KEY) || '[]');
    const newDocument: ContractDocument = {
        ...document,
        id: `doc-${Date.now()}`,
        uploadedAt: new Date().toISOString()
    };
    
    const updatedContracts = allContracts.map(c => {
        if (c.id === contractId) {
            return { ...c, documents: [...(c.documents || []), newDocument] };
        }
        return c;
    });

    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));
    window.dispatchEvent(new StorageEvent('storage', { key: CONTRACTS_STORAGE_KEY }));
    toast({ title: "Documento Salvo!", description: `"${document.name}" foi adicionado.` });
  };

  const handleDeleteDocument = (contractId: string, documentId: string) => {
     const allContracts: Contract[] = JSON.parse(localStorage.getItem(CONTRACTS_STORAGE_KEY) || '[]');
     const updatedContracts = allContracts.map(c => {
        if (c.id === contractId) {
            return { ...c, documents: (c.documents || []).filter(doc => doc.id !== documentId) };
        }
        return c;
    });

    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));
    window.dispatchEvent(new StorageEvent('storage', { key: CONTRACTS_STORAGE_KEY }));
    toast({ title: "Documento Removido", variant: "destructive" });
  };

  const supervisors = useMemo(() => {
    return users.filter(u => u.status === 'Ativo' && (u.role === 'Supervisor' || u.role === 'Administrador'));
  }, [users]);
  
  const filteredContracts = useMemo(() => {
    if (!selectedSupervisorId || selectedSupervisorId === 'all') {
        return contracts;
    }
    return contracts.filter(c => c.supervisorId === selectedSupervisorId);
  }, [contracts, selectedSupervisorId]);

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Painel do Administrador</h1>
            <p className="text-muted-foreground">Gerencie usuários, contratos e configurações do sistema.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={handleOpenAddUserModal} variant={isUserModalOpen ? 'secondary' : 'default'}>
                <PlusCircle className="mr-2" />
                Adicionar Usuário
            </Button>
            <Button onClick={handleOpenAddContractModal} variant={isContractModalOpen ? 'secondary' : 'default'}>
                <PlusCircle className="mr-2" />
                Adicionar Contrato
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Visualize e edite os usuários e suas permissões de acesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className={user.status === 'Inativo' ? 'bg-muted/50 text-muted-foreground' : ''}>
                  <TableCell>
                      <UserAvatar user={user}/>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                     <Badge variant={user.role === 'Administrador' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Ativo' ? 'default' : 'outline'} className={user.status === 'Ativo' ? 'bg-green-500 text-white' : ''}>
                        {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenEditUserModal(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        {user.status === 'Ativo' ? (
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id, user.status)} className="text-orange-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Desativar
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id, user.status)}>
                                <History className="mr-2 h-4 w-4" /> Reativar
                            </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Contratos</CardTitle>
          <CardDescription>Visualize e edite os contratos de clientes.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Label htmlFor="supervisor-filter">Filtrar por Supervisor</Label>
                            <Select onValueChange={setSelectedSupervisorId} value={selectedSupervisorId || 'all'}>
                                <SelectTrigger id="supervisor-filter">
                                <SelectValue placeholder="Selecione um supervisor" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="all">Todos os Supervisores</SelectItem>
                                {supervisors.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedSupervisorId && selectedSupervisorId !== 'all' && (
                            <Button variant="ghost" size="icon" onClick={() => setSelectedSupervisorId(null)} className="mt-6">
                                <FilterX className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
                 <div className="flex items-center justify-center">
                    {selectedContractForInfo ? (
                        <DocStatusCard contract={selectedContractForInfo} />
                    ) : (
                        <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg h-full flex flex-col justify-center items-center">
                            <AlertTriangle className="w-8 h-8 mb-2" />
                            <p>Selecione um contrato na tabela para ver o status do documento.</p>
                        </div>
                    )}
                 </div>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Contrato</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Região</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow 
                    key={contract.id} 
                    className={cn(
                        'transition-colors',
                        contract.status === 'Inativo' ? 'bg-muted/50 text-muted-foreground' : 'cursor-pointer hover:bg-yellow-100',
                        selectedContractForInfo?.id === contract.id && 'bg-accent'
                    )} 
                    onClick={() => setSelectedContractForInfo(contract)}
                >
                  <TableCell className="font-medium">{contract.name}</TableCell>
                  <TableCell>{contract.supervisorName}</TableCell>
                   <TableCell>
                    <Badge variant={contract.status === 'Ativo' ? 'default' : 'outline'} className={contract.status === 'Ativo' ? 'bg-green-500 text-white' : ''}>
                        {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{contract.region}</TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleOpenDocsModal(contract);}}>
                          <FolderOpen className="mr-2 h-4 w-4"/> Documentos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleOpenEditContractModal(contract);}}>
                          <Pencil className="mr-2 h-4 w-4"/> Editar
                        </DropdownMenuItem>
                        {contract.status === 'Ativo' ? (
                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleToggleContractStatus(contract.id, contract.status);}} className="text-orange-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Desativar
                            </DropdownMenuItem>
                        ) : (
                             <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleToggleContractStatus(contract.id, contract.status);}}>
                                <History className="mr-2 h-4 w-4" /> Reativar
                            </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                               <Trash2 className="mr-2 h-4 w-4" /> Deletar
                              </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso removerá permanentemente o contrato e pode afetar usuários associados.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteContract(contract.id)}>
                                  Deletar Permanentemente
                              </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        contracts={contracts}
      />

      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onSave={handleSaveContract}
        supervisors={supervisors}
        editingContract={editingContract}
      />
      
      {docsModalContract && (
        <ContractDocsModal 
            isOpen={!!docsModalContract}
            onClose={() => setDocsModalContract(null)}
            contract={docsModalContract}
            onSaveDocument={handleSaveDocument}
            onDeleteDocument={handleDeleteDocument}
            currentUser={currentUser}
        />
      )}
    </div>
  );
}
