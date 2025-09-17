
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, User, MapPin, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { type OrgNode, type Contract, initialOrgTree, type User as AppUser, type ContractDocument } from '@/lib/data';
import Image from 'next/image';
import { ContractModal } from '@/components/contracts/contract-modal';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { removeNodeFromTree } from '@/lib/tree-utils';
import { ContractDocsModal } from '@/components/contracts/contract-docs-modal';


const CONTRACTS_STORAGE_KEY = 'arpolarContracts';
const ORG_CHART_STORAGE_KEY = 'orgChartTree';
const USERS_STORAGE_KEY = 'arpolarUsers';
const CURRENT_USER_EMAIL = 'romilson@arpolar.com.br'; // This should be dynamic in a real app

function ContractCard({ contract, onEdit, onDelete, onOpenDocs }: { contract: Contract; onEdit: () => void; onDelete: () => void; onOpenDocs: () => void; }) {
  return (
    <Card 
      className="group flex flex-col justify-between text-white overflow-hidden shadow-lg relative min-h-[250px] bg-cover bg-center transition-all duration-300"
      style={{ backgroundImage: `url(${contract.backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0 opacity-100 group-hover:opacity-80 transition-opacity duration-300"></div>
      
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-white bg-black/20 hover:bg-black/50"
          onClick={(e) => { e.stopPropagation(); onOpenDocs(); }}
        >
          <FolderOpen className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-white bg-black/20 hover:bg-black/50"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso removerá permanentemente o contrato e o desalocará de qualquer funcionário associado no organograma.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <CardHeader onClick={onOpenDocs} className="cursor-pointer">
        <CardTitle className="text-xl font-bold font-headline z-10">{contract.name}</CardTitle>
        <CardDescription className="text-white/80 z-10">{contract.address}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow cursor-pointer" onClick={onOpenDocs}></CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-sm z-10 cursor-pointer" onClick={onOpenDocs}>
         <div className="flex items-center gap-2">
            <User className="w-4 h-4"/>
            <span>{contract.supervisorName}</span>
         </div>
         <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4"/>
            <span>{contract.region}</span>
         </div>
      </CardFooter>
    </Card>
  );
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [supervisors, setSupervisors] = useState<AppUser[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [docsModalContract, setDocsModalContract] = useState<Contract | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const { toast } = useToast();

  const loadData = () => {
      try {
        const savedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
        const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);

        const allContracts: Contract[] = savedContracts ? JSON.parse(savedContracts) : [];
        const allUsers: AppUser[] = savedUsers ? JSON.parse(savedUsers) : [];
        
        const user = allUsers.find(u => u.email === CURRENT_USER_EMAIL) || allUsers.find(u => u.role === 'Administrador');
        setCurrentUser(user || null);

        let visibleContracts: Contract[] = [];
        if (user) {
            if (user.permissions.canViewAllContracts) {
                visibleContracts = allContracts;
            } else {
                const allowedIds = new Set(user.permissions.allowedContractIds);
                visibleContracts = allContracts.filter(c => allowedIds.has(c.id));
            }
        }
        
        setContracts(visibleContracts);
        
        // Filter for supervisors from the general user list
        const supervisorUsers = allUsers.filter(u => u.role === 'Supervisor' || u.role === 'Administrador');
        setSupervisors(supervisorUsers);

      } catch (error) {
        console.error("Failed to load data from localStorage", error);
      }
  };

  useEffect(() => {
      setIsClient(true);
      loadData();
      window.addEventListener('storage', loadData);
      return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleOpenAddModal = () => {
    setEditingContract(null);
    setIsModalOpen(true);
  }

  const handleOpenEditModal = (contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  }
  
  const handleOpenDocsModal = (contract: Contract) => {
    setDocsModalContract(contract);
  }

  const handleSaveContract = (contractData: Omit<Contract, 'id'>, id?: string) => {
    let currentContracts: Contract[] = [];
    try {
       currentContracts = JSON.parse(localStorage.getItem(CONTRACTS_STORAGE_KEY) || '[]');
    } catch (e) {
      console.error("Failed to parse contracts from localStorage", e);
      currentContracts = [];
    }

    let updatedContracts: Contract[];
    let toastTitle = '';
    let toastDescription = '';
    
    if (id) {
        updatedContracts = currentContracts.map(c => {
          if (c.id === id) {
            // Preserve existing documents when editing
            return { ...c, ...contractData, id, documents: c.documents || [] };
          }
          return c;
        });
        toastTitle = "Contrato Atualizado!";
        toastDescription = `O contrato "${contractData.name}" foi atualizado com sucesso.`;
    } else {
        const newContract: Contract = {
            ...contractData,
            id: `contract-${Date.now()}`,
            documents: [] // Initialize with empty documents array
        };
        updatedContracts = [...currentContracts, newContract];
        toastTitle = "Contrato Adicionado!";
        toastDescription = `O contrato "${newContract.name}" foi salvo com sucesso.`;
    }
      
    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));
    window.dispatchEvent(new StorageEvent('storage', { key: CONTRACTS_STORAGE_KEY }));
    
    toast({ title: toastTitle, description: toastDescription });
    setIsModalOpen(false);
    setEditingContract(null);
  };
  
  const handleDeleteContract = (contractId: string) => {
    const contractToDelete = contracts.find(c => c.id === contractId);
    if (!contractToDelete) return;

    const updatedContracts = contracts.filter(c => c.id !== contractId);
    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));

    const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
    let orgTree = savedTree ? JSON.parse(savedTree) : initialOrgTree;
    const newTree = removeNodeFromTree(orgTree, contractId);
    localStorage.setItem(ORG_CHART_STORAGE_KEY, JSON.stringify(newTree));

    window.dispatchEvent(new StorageEvent('storage', { key: CONTRACTS_STORAGE_KEY }));
    window.dispatchEvent(new StorageEvent('storage', { key: ORG_CHART_STORAGE_KEY }));

    toast({ title: 'Contrato Deletado', description: `O contrato "${contractToDelete.name}" foi removido.` });
  };
  
  const handleSaveDocument = (contractId: string, document: Omit<ContractDocument, 'id' | 'uploadedAt'>) => {
    const newDocument: ContractDocument = {
        ...document,
        id: `doc-${Date.now()}`,
        uploadedAt: new Date().toISOString()
    };
    
    const updatedContracts = contracts.map(c => {
        if (c.id === contractId) {
            const updatedDocs = [...(c.documents || []), newDocument];
            return { ...c, documents: updatedDocs };
        }
        return c;
    });

    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));
    window.dispatchEvent(new StorageEvent('storage', { key: CONTRACTS_STORAGE_KEY }));

    toast({ title: "Documento Salvo!", description: `"${document.name}" foi adicionado ao contrato.` });
  };

  const handleDeleteDocument = (contractId: string, documentId: string) => {
     const updatedContracts = contracts.map(c => {
        if (c.id === contractId) {
            const updatedDocs = (c.documents || []).filter(doc => doc.id !== documentId);
            return { ...c, documents: updatedDocs };
        }
        return c;
    });

    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));
    window.dispatchEvent(new StorageEvent('storage', { key: CONTRACTS_STORAGE_KEY }));

    toast({ title: "Documento Removido", variant: "destructive" });
  }

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Gestão de Contratos</h1>
            <p className="text-muted-foreground">Visualize, adicione e edite os contratos de clientes.</p>
        </div>
        <Button onClick={handleOpenAddModal}>
            <PlusCircle className="mr-2" />
            Adicionar Contrato
        </Button>
      </div>

      {contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center bg-gray-100/50 rounded-lg">
            <p className="text-lg font-semibold text-muted-foreground">Nenhum contrato encontrado.</p>
            <p className="mt-2 text-sm text-muted-foreground">Verifique suas permissões ou adicione um novo contrato.</p>
        </div>
      ) : (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {contracts.map(contract => (
                <ContractCard 
                  key={contract.id} 
                  contract={contract} 
                  onEdit={() => handleOpenEditModal(contract)}
                  onDelete={() => handleDeleteContract(contract.id)}
                  onOpenDocs={() => handleOpenDocsModal(contract)}
                />
            ))}
        </div>
      )}

      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
