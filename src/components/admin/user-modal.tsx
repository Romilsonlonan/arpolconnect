

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Upload } from 'lucide-react';
import { getAvatar } from '@/lib/avatar-storage';

type UserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<User, 'id'>, id?: string, avatarDataUrl?: string) => void;
  editingUser: User | null;
  users: User[];
  contracts: Contract[];
};

const userRoles: string[] = [
    'Administrador', 
    'Supervisor', 
    'Mecânico', 
    'Visualizador',
    'Técnico de Planejamento',
    'Supervisor de Qualidade',
    '1/2 Oficial',
    'Ajudante',
    'Eletricista',
    'Diretor',
    'Gerente',
    'Coordenador',
    'Gerente de Contratos',
    'Coordenador de Contratos',
    'Auxiliar Administrativo',
    'Mecânico de Corretiva',
    'Supervisor de Corretiva',
    'Coordenador de Corretiva',
    'Auxiliar de PMOC',
    'PMOC'
];
const PLACEHOLDER_AVATAR = 'https://placehold.co/100x100';

export function UserModal({ isOpen, onClose, onSave, editingUser, users, contracts }: UserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('Visualizador');
  const [status, setStatus] = useState<User['status']>('Ativo');
  const [avatar, setAvatar] = useState(PLACEHOLDER_AVATAR);
  const [supervisorId, setSupervisorId] = useState<string | undefined>('');
  
  // Permissions state
  const [canViewAllContracts, setCanViewAllContracts] = useState(false);
  const [allowedContractIds, setAllowedContractIds] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const possibleSupervisors = useMemo(() => {
    const supervisorRoles = ['Administrador', 'Diretor', 'Gerente', 'Coordenador', 'Supervisor'];
    return users.filter(u => supervisorRoles.includes(u.role) && u.status === 'Ativo');
  }, [users]);

  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        setName(editingUser.name);
        setEmail(editingUser.email);
        setRole(editingUser.role);
        setStatus(editingUser.status);
        setSupervisorId(editingUser.supervisorId);
        
        const storedAvatar = getAvatar(editingUser.id);
        setAvatar(storedAvatar || PLACEHOLDER_AVATAR);

        setCanViewAllContracts(editingUser.permissions.canViewAllContracts);
        setAllowedContractIds(editingUser.permissions.allowedContractIds);
      } else {
        // Reset form for new user
        setName('');
        setEmail('');
        setRole('Visualizador');
        setStatus('Ativo');
        setSupervisorId('');
        setAvatar(PLACEHOLDER_AVATAR);
        setCanViewAllContracts(false);
        setAllowedContractIds([]);
      }
    }
  }, [editingUser, isOpen]);

    const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject(new Error('Could not get canvas context'));
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = (error) => reject(error);
                img.src = event.target?.result as string;
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({ title: "Arquivo muito grande", description: "Por favor, selecione uma imagem menor que 5MB.", variant: "destructive"});
                return;
            }
            try {
                const resizedDataUrl = await resizeImage(file, 256, 256, 0.9);
                setAvatar(resizedDataUrl);
            } catch (error) {
                console.error("Error resizing image:", error);
                toast({ title: "Erro ao processar imagem", description: "Houve um problema ao redimensionar a imagem.", variant: "destructive"});
            }
        }
    };


  const handleSave = () => {
    if (!name || !email || !role) {
      toast({
        title: "Campos Obrigatórios",
        description: "Nome, e-mail e função são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
     if (!supervisorId) {
        toast({
            title: "Campo Obrigatório",
            description: "Por favor, selecione a dependência (superior direto).",
            variant: "destructive"
        });
        return;
    }

    const permissions = {
        canViewAllContracts,
        allowedContractIds: canViewAllContracts ? [] : allowedContractIds
    };

    onSave({
        name,
        email,
        role,
        status,
        permissions,
        supervisorId,
    }, editingUser?.id, avatar);
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
            <div className="grid gap-2 items-center justify-center text-center">
                <Avatar className="w-24 h-24 mx-auto border-2 border-primary">
                    <AvatarImage src={avatar} data-ai-hint="person portrait" />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Input 
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                />
                 <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2" />
                    Carregar Imagem
                </Button>
            </div>

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
                     <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="supervisor">Dependência (Superior Direto)</Label>
                        <Select onValueChange={setSupervisorId} value={supervisorId}>
                            <SelectTrigger><SelectValue placeholder="Selecione a dependência" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="arpolar">Arpolar (Empresa)</SelectItem>
                                <Separator />
                                {possibleSupervisors.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>)}
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
