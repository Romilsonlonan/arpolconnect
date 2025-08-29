
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, User, MapPin, Pencil } from 'lucide-react';
import { type OrgNode, type Contract, initialOrgTree } from '@/lib/data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ContractModal } from '@/components/contracts/contract-modal';
import { useToast } from '@/hooks/use-toast';

const CONTRACTS_STORAGE_KEY = 'arpolarContracts';
const ORG_CHART_STORAGE_KEY = 'orgChartTree';

function ContractCard({ contract, onEdit }: { contract: Contract; onEdit: () => void; }) {
  return (
    <Card className="group flex flex-col justify-between text-white overflow-hidden shadow-lg relative min-h-[250px]">
      <Image 
        src={contract.backgroundImage} 
        alt={`Imagem de fundo para ${contract.name}`}
        fill
        style={{ objectFit: 'cover' }}
        unoptimized
        className="absolute inset-0 -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0"></div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-8 w-8 text-white bg-black/20 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click event
          onEdit();
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <CardHeader>
        <CardTitle className="text-xl font-bold font-headline z-10">{contract.name}</CardTitle>
        <CardDescription className="text-white/80 z-10">{contract.address}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-sm z-10">
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

function findSupervisorsInTree(node: OrgNode): OrgNode[] {
    let supervisors: OrgNode[] = [];
    
    // Recursive function to traverse the tree
    function traverse(currentNode: OrgNode) {
        // A supervisor is anyone with the role 'Supervisor', and is not hidden
        if (currentNode.role === 'Supervisor' && currentNode.showInNeuralNet !== false) {
            supervisors.push(currentNode);
        }
        if (currentNode.children) {
            for (const child of currentNode.children) {
                traverse(child);
            }
        }
    }
    
    traverse(node);
    return supervisors;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [supervisors, setSupervisors] = useState<OrgNode[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const { toast } = useToast();

  const loadData = () => {
      try {
        const savedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
        setContracts(savedContracts ? JSON.parse(savedContracts) : []);

        const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
        const orgTree = savedTree ? JSON.parse(savedTree) : initialOrgTree;
        
        const supervisorNodes = findSupervisorsInTree(orgTree);
        setSupervisors(supervisorNodes);

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

  const handleSaveContract = (contractData: Omit<Contract, 'id'>, id?: string) => {
    let updatedContracts: Contract[];
    let toastTitle = '';
    let toastDescription = '';

    if (id) {
        // Editing existing contract
        updatedContracts = contracts.map(c => c.id === id ? { ...c, ...contractData, id } : c);
        toastTitle = "Contrato Atualizado!";
        toastDescription = `O contrato "${contractData.name}" foi atualizado com sucesso.`;
    } else {
        // Adding new contract
        const newContract: Contract = {
            ...contractData,
            id: `contract-${Date.now()}`
        };
        updatedContracts = [...contracts, newContract];
        toastTitle = "Contrato Adicionado!";
        toastDescription = `O contrato "${newContract.name}" foi salvo com sucesso.`;
    }
      
    setContracts(updatedContracts);
    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));

    toast({
        title: toastTitle,
        description: toastDescription
    });

    setIsModalOpen(false);
    setEditingContract(null);
  };


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
            <p className="mt-2 text-sm text-muted-foreground">Adicione um novo contrato para começar.</p>
        </div>
      ) : (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {contracts.map(contract => (
                <ContractCard key={contract.id} contract={contract} onEdit={() => handleOpenEditModal(contract)} />
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
    </div>
  );
}
