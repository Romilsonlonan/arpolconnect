
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, User, MapPin, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type OrgNode, type Contract, initialOrgTree } from '@/lib/data';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const CONTRACTS_STORAGE_KEY = 'arpolarContracts';
const ORG_CHART_STORAGE_KEY = 'orgChartTree';

function ContractCard({ contract }: { contract: Contract }) {
  return (
    <Card className="group flex flex-col justify-between text-white overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 relative min-h-[250px]">
       <div 
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: `url('${contract.backgroundImage}')`}}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent -z-10"></div>
      <CardHeader>
        <CardTitle className="text-xl font-bold font-headline">{contract.name}</CardTitle>
        <CardDescription className="text-white/80">{contract.address}</CardDescription>
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

function AddContractModal({ supervisors, onSave }: { supervisors: OrgNode[], onSave: (newContract: Omit<Contract, 'id'>) => void }) {
    const [name, setName] = useState('');
    const [supervisorId, setSupervisorId] = useState('');
    const [address, setAddress] = useState('');
    const [region, setRegion] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    title: "Imagem Muito Grande",
                    description: "Por favor, selecione uma imagem menor que 2MB.",
                    variant: "destructive",
                });
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setBackgroundImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = () => {
        if (!name || !supervisorId || !address || !region || !backgroundImage) {
            toast({
                title: "Campos Obrigatórios",
                description: "Por favor, preencha todos os campos, incluindo a imagem.",
                variant: "destructive",
            });
            return;
        }

        const supervisor = supervisors.find(s => s.id === supervisorId);
        if (!supervisor) return;

        onSave({
            name,
            supervisorId,
            supervisorName: supervisor.name,
            address,
            region,
            backgroundImage
        });
        // Reset state after save
        setName('');
        setSupervisorId('');
        setAddress('');
        setRegion('');
        setBackgroundImage('');
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Adicionar Contrato
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Contrato</DialogTitle>
                    <DialogDescription>Preencha as informações para registrar um novo contrato.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome do Contrato (Cliente)</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="supervisor">Supervisor Responsável</Label>
                        <Select onValueChange={setSupervisorId} value={supervisorId}>
                            <SelectTrigger><SelectValue placeholder="Selecione um supervisor" /></SelectTrigger>
                            <SelectContent>
                                {supervisors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input id="address" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="region">Região</Label>
                        <Input id="region" value={region} onChange={e => setRegion(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Imagem de Fundo</Label>
                        {backgroundImage && (
                            <div className="relative w-full h-32 rounded-md overflow-hidden border">
                                <Image src={backgroundImage} alt="Pré-visualização da imagem" layout="fill" objectFit="cover" />
                            </div>
                        )}
                        <Input 
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                         <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2" />
                            Carregar Imagem
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
                    <DialogClose asChild><Button onClick={handleSubmit}>Salvar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function findSupervisorsInTree(node: OrgNode): OrgNode[] {
    let supervisors: OrgNode[] = [];
    if (node.role === 'Supervisor') {
        supervisors.push(node);
    }
    if (node.children) {
        for (const child of node.children) {
            supervisors = supervisors.concat(findSupervisorsInTree(child));
        }
    }
    return supervisors;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [supervisors, setSupervisors] = useState<OrgNode[]>([]);
  const [isClient, setIsClient] = useState(false);
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

  const handleSaveContract = (newContractData: Omit<Contract, 'id'>) => {
      const newContract: Contract = {
          ...newContractData,
          id: `contract-${Date.now()}`
      };
      
      const updatedContracts = [...contracts, newContract];
      setContracts(updatedContracts);
      localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));

      toast({
          title: "Contrato Adicionado!",
          description: `O contrato "${newContract.name}" foi salvo com sucesso.`
      });
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Gestão de Contratos</h1>
            <p className="text-muted-foreground">Visualize e adicione novos contratos de clientes.</p>
        </div>
        <AddContractModal supervisors={supervisors} onSave={handleSaveContract} />
      </div>

      {contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center bg-gray-100/50 rounded-lg">
            <p className="text-lg font-semibold text-muted-foreground">Nenhum contrato encontrado.</p>
            <p className="mt-2 text-sm text-muted-foreground">Adicione um novo contrato para começar.</p>
        </div>
      ) : (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {contracts.map(contract => (
                <ContractCard key={contract.id} contract={contract} />
            ))}
        </div>
      )}
    </div>
  );
}
