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
import type { OrgNode } from '@/lib/data';
import { contractList } from '@/lib/data';
import { ScrollArea } from '../ui/scroll-area';

type EmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: Omit<OrgNode, 'id' | 'children'>) => void;
  editingNode: OrgNode | null;
};

const defaultRoles = ['Diretor', 'Gerente', 'Coordenador', 'Supervisor'];

export function EmployeeModal({ isOpen, onClose, onSave, editingNode }: EmployeeModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');
  const [contract, setContract] = useState('');

  useEffect(() => {
    if (editingNode) {
      setName(editingNode.name);
      setRole(editingNode.role);
      setContact(editingNode.contact || '');
      setContract(editingNode.contract || '');
    } else {
      // Reset form when adding a new node
      setName('');
      setRole('');
      setContact('');
      setContract('');
    }
  }, [editingNode, isOpen]);

  const handleSubmit = () => {
    if (!name || !role) {
      alert('Nome e Função são obrigatórios.');
      return;
    }

    onSave({
      name,
      role,
      contact,
      contract,
      avatar: 'https://placehold.co/100x100', // Default or generate a placeholder
    });
    onClose();
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
