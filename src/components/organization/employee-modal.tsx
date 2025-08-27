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
import type { OrgNode } from '@/lib/data';
import { contractList } from '@/lib/data';
import { getAvatar } from '@/lib/avatar-storage';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Upload } from 'lucide-react';

type EmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: Omit<OrgNode, 'id' | 'children'>) => void;
  editingNode: OrgNode | null;
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

export function EmployeeModal({ isOpen, onClose, onSave, editingNode }: EmployeeModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');
  const [contract, setContract] = useState('');
  const [avatar, setAvatar] = useState(PLACEHOLDER_AVATAR);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (editingNode) {
      setName(editingNode.name);
      setRole(editingNode.role);
      setContact(editingNode.contact || '');
      setContract(editingNode.contract || '');
      const storedAvatar = getAvatar(editingNode.id);
      setAvatar(storedAvatar || editingNode.avatar || PLACEHOLDER_AVATAR);
    } else {
      // Reset form when adding a new node
      setName('');
      setRole('');
      setContact('');
      setContract('');
      setAvatar(PLACEHOLDER_AVATAR);
    }
  }, [editingNode, isOpen]);

  const handleSubmit = () => {
    if (!name || !role) {
      alert('Nome e Função são obrigatórios.');
      return;
    }

    // The `avatar` state here is a data URL. 
    // The parent component (`OrganogramaPage`) is responsible for saving it to storage.
    onSave({
      name,
      role,
      contact,
      contract,
      avatar,
    });
    onClose();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File is too large. Please select an image smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
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
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                />
                 <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2" />
                    Carregar Imagem
                </Button>
            </div>
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
                    {contractList.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
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
