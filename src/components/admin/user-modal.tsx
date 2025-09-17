
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { User, Contract } from '@/lib/data';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

type UserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<User, 'id'>, id?: string) => void;
  editingUser: User | null;
  contracts: Contract[];
};

const userRoles: User['role'][] = ['Administrador', 'Supervisor', 'Mecânico', 'Visualizador'];

export function UserModal({ isOpen, onClose, onSave, editingUser, contracts }: UserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('Visualizador');
  const [status, setStatus] = useState<User['status']>('Ativo');
  
  // Permissions state
  const [canViewAllContracts, setCanViewAllContracts] = useState(false);
  const [allowedContractIds, setAllowedContractIds] = useState<string[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        setName(editingUser.name);
        setEmail(editingUser.email);
        setRole(editingUser.role);
        setStatus(editingUser.status);
        setCanViewAllContracts(editingUser.permissions.canViewAllContracts);
        setAllowedContractIds(editingUser.permissions.allowedContractIds);
      } else {
        // Reset form for new user
        setName('');
        setEmail('');
        setRole('Visualizador');
        setStatus('Ativo');
        setCanViewAllContracts(false);
        setAllowedContractIds([]);
      }
    }
  }, [editingUser, isOpen]);

  const handleSave = () => {
    if (!name || !email || !role) {
      toast({
        title: "Campos Obrigatórios",
        description: "Nome, e-mail e função são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const permissions = {
        canViewAllContracts,
        allowedContractIds: canViewAllContracts ? [] : allowedContractIds
    };
    
    let toastMessage = 'Permissões salvas. ';
    if (permissions.canViewAllContracts) {
        toastMessage += 'O usuário tem acesso a todos os contratos.';
    } else {
        toastMessage += `O usuário tem acesso a ${permissions.allowedContractIds.length} contrato(s) específico(s).`;
    }

    onSave({
        name,
        email,
        role,
        status,
        permissions,
    }, editingUser?.id);
    
    toast({
        title: editingUser ? "Usuário Atualizado" : "Usuário Criado",
        description: toastMessage
    });
  };

  const handleContractPermissionChange = (contractId: string, checked: boolean) => {
    setAllowedContractIds(prev => 
        checked ? [...prev, contractId] : prev.filter(id => id !== contractId)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Editar Usuário e Permissões' : 'Adicionar Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {editingUser ? 'Atualize as informações e permissões do usuário.' : 'Preencha as informações para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] -mx-6">
          <div className="grid gap-6 py-4 px-6">
            <fieldset className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                <legend className="-ml-1 px-1 text-sm font-medium">Informações do Usuário</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Função</Label>
                        <Select onValueChange={(value) => setRole(value as User['role'])} value={role}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {userRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={(value) => setStatus(value as User['status'])} value={status}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ativo">Ativo</SelectItem>
                                <SelectItem value="Inativo">Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                <legend className="-ml-1 px-1 text-sm font-medium">Permissões de Acesso aos Contratos</legend>
                 <div className="flex items-center space-x-2">
                    <Switch 
                        id="all-contracts-permission" 
                        checked={canViewAllContracts}
                        onCheckedChange={setCanViewAllContracts}
                    />
                    <Label htmlFor="all-contracts-permission">Permitir acesso a todos os contratos?</Label>
                </div>
                <Separator className="my-2"/>
                <div className={canViewAllContracts ? 'opacity-50' : ''}>
                    <h4 className="font-medium text-sm mb-2">Acesso Específico</h4>
                    <p className="text-xs text-muted-foreground mb-4">Se o acesso total não for concedido, selecione abaixo a quais contratos este usuário terá acesso.</p>
                    <div className="space-y-2">
                        {contracts.map(contract => (
                            <div key={contract.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`contract-${contract.id}`}
                                    checked={allowedContractIds.includes(contract.id)}
                                    onCheckedChange={(checked) => handleContractPermissionChange(contract.id, !!checked)}
                                    disabled={canViewAllContracts}
                                />
                                <Label 
                                    htmlFor={`contract-${contract.id}`} 
                                    className="font-normal"
                                >
                                    {contract.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {contracts.length === 0 && <p className="text-sm text-muted-foreground text-center">Nenhum contrato cadastrado.</p>}
                </div>
            </fieldset>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

