
'use client';

import { useState, useEffect, useRef } from 'react';
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
import type { OrgNode, Contract, Supervisor } from '@/lib/data';
import { getAvatar } from '@/lib/avatar-storage';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type EmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: Omit<OrgNode, 'id' | 'children'>, supervisorId?: string) => void;
  editingNode: OrgNode | null;
  supervisors?: Supervisor[];
  selectedSupervisor?: string;
  onSupervisorChange?: (id: string) => void;
};

const defaultRoles = [
    'Diretor', 
    'Gerente', 
    'Coordenador', 
    'Supervisor',
    'Região',
    'Contrato',
    'Apoio',
    'Mecânico',
    '1/2 Oficial',
    'Ajudante',
    'Eletricista',
    'Auxiliar de PMOC',
    'PMOC',
    'Técnico de Planejamento',
    'Coordenador de Contratos',
    'Gerente de Contratos',
    'Auxiliar Administrativo',
    'Supervisor de Qualidade'
];

const PLACEHOLDER_AVATAR = 'https://placehold.co/100x100';
const CONTRACTS_STORAGE_KEY = 'arpolarContracts';

export function EmployeeModal({ isOpen, onClose, onSave, editingNode, supervisors, selectedSupervisor, onSupervisorChange }: EmployeeModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');
  const [contract, setContract] = useState('');
  const [avatar, setAvatar] = useState(PLACEHOLDER_AVATAR);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableContracts, setAvailableContracts] = useState<Contract[]>([]);
  const { toast } = useToast();


  useEffect(() => {
    if (isOpen) {
        const savedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
        setAvailableContracts(savedContracts ? JSON.parse(savedContracts) : []);

        if (editingNode) {
          setName(editingNode.name);
          setRole(editingNode.role);
          setContact(editingNode.contact || '');
          setContract(editingNode.contract || '');
          const storedAvatar = getAvatar(editingNode.id);
          setAvatar(storedAvatar || editingNode.avatar || PLACEHOLDER_AVATAR);
        } else {
          setName('');
          setRole('');
          setContact('');
          setContract('');
          setAvatar(PLACEHOLDER_AVATAR);
          onSupervisorChange?.('');
        }
    }
  }, [editingNode, isOpen, onSupervisorChange]);

  const handleSubmit = () => {
    if (!name || !role) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e Função são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    if (!editingNode && supervisors && !selectedSupervisor) {
      toast({
        title: "Supervisor obrigatório",
        description: "Por favor, selecione um supervisor para o novo funcionário.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      name,
      role,
      contact,
      contract,
      avatar,
    }, selectedSupervisor);
    onClose();
  };
  
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
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
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
        toast({
            title: "Arquivo muito grande",
            description: "Por favor, selecione uma imagem menor que 5MB.",
            variant: "destructive"
        });
        return;
      }
      
      try {
        const resizedDataUrl = await resizeImage(file, 256, 256, 0.9);
        setAvatar(resizedDataUrl);
      } catch (error) {
        console.error("Error resizing image:", error);
        toast({
            title: "Erro ao processar imagem",
            description: "Houve um problema ao redimensionar a imagem. Tente novamente.",
            variant: "destructive"
        });
      }
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingNode ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</DialogTitle>
          <DialogDescription>
            {editingNode ? 'Atualize os detalhes do funcionário.' : 'Preencha os detalhes para adicionar um novo membro à equipe.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] -mx-6">
            <div className="grid gap-4 py-4 px-6">
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
            {supervisors && !editingNode && (
                <div className="grid gap-2">
                    <Label htmlFor="supervisor-select">Supervisor</Label>
                    <Select onValueChange={onSupervisorChange} value={selectedSupervisor}>
                        <SelectTrigger id="supervisor-select">
                            <SelectValue placeholder="Selecione um supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                            {supervisors.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="role">Função</Label>
                <Select onValueChange={setRole} value={role}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                    {defaultRoles.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="contact">Contato</Label>
                <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="(XX) XXXXX-XXXX" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="contract">Contrato (Cliente)</Label>
                <Select onValueChange={setContract} value={contract}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione um contrato" />
                </SelectTrigger>
                <SelectContent>
                    {availableContracts.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
