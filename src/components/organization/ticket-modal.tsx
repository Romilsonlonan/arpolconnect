
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { OrgNode, Message, Contract, User as AppUser } from '@/lib/data';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

type TicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: Omit<Message, 'id' | 'createdAt' | 'author'>) => void;
  node: OrgNode | null;
  allUsers: AppUser[];
};

const CONTRACTS_STORAGE_KEY = 'arpolarContracts';

export function TicketModal({ isOpen, onClose, onSave, node, allUsers }: TicketModalProps) {
  const { toast } = useToast();

  // Required fields
  const [contractName, setContractName] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState('Rotina');
  const [status, setStatus] = useState('Em andamento');
  const [visibility, setVisibility] = useState<'publico' | 'privado'>('publico');
  const [recipientId, setRecipientId] = useState('');


  // Optional fields
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentBrand, setEquipmentBrand] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [cause, setCause] = useState('');

  const [availableContracts, setAvailableContracts] = useState<Contract[]>([]);

  useEffect(() => {
    if (isOpen) {
       const savedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
       setAvailableContracts(savedContracts ? JSON.parse(savedContracts) : []);

      if (node) {
        setContractName(node.contract || '');
        setSupervisor(node.name);
        setContact(node.contact || '');
      } else {
        // Reset form when modal is closed or node is null
        setContractName('');
        setSupervisor('');
        setContact('');
        setMessage('');
        setUrgency('Rotina');
        setStatus('Em andamento');
        setVisibility('publico');
        setRecipientId('');
        setEquipmentName('');
        setEquipmentBrand('');
        setEquipmentModel('');
        setCause('');
      }
    }
  }, [node, isOpen]);
  
  useEffect(() => {
    // Reset recipient if visibility changes back to public
    if (visibility === 'publico') {
      setRecipientId('');
    }
  }, [visibility]);

  const handleSubmit = () => {
    if (!contractName || !supervisor || !contact || !message) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    if (visibility === 'privado' && !recipientId) {
       toast({
        title: "Destinatário Obrigatório",
        description: "Selecione um destinatário para o ticket privado.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      contractName,
      supervisor,
      contact,
      message,
      urgency,
      status,
      visibility,
      recipientId: visibility === 'privado' ? recipientId : undefined,
      equipmentName,
      equipmentBrand,
      equipmentModel,
      cause,
    });
    onClose();
    toast({
        title: "Ticket Criado!",
        description: "O ticket foi criado e enviado.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Ticket</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para abrir um novo ticket de serviço.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] -mx-6 px-6">
          <div className="grid gap-6 py-4">
            <fieldset className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
              <legend className="-ml-1 px-1 text-sm font-medium">Visibilidade</legend>
              <RadioGroup value={visibility} onValueChange={(value) => setVisibility(value as 'publico' | 'privado')} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                      <RadioGroupItem value="publico" id="r1" />
                      <Label htmlFor="r1">Público (visível no painel geral)</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                      <RadioGroupItem value="privado" id="r2" />
                      <Label htmlFor="r2">Privado (direcionado a uma pessoa)</Label>
                  </div>
              </RadioGroup>
              {visibility === 'privado' && (
                 <div className="grid gap-2">
                    <Label htmlFor="recipient">Destinatário <span className="text-red-500">*</span></Label>
                    <Select onValueChange={setRecipientId} value={recipientId}>
                        <SelectTrigger><SelectValue placeholder="Selecione o destinatário" /></SelectTrigger>
                        <SelectContent>
                        {allUsers.map((n) => (
                            <SelectItem key={n.id} value={n.id}>{n.name} ({n.role})</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
              )}
            </fieldset>

            <fieldset className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
              <legend className="-ml-1 px-1 text-sm font-medium">Informações do Ticket</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contractName">Nome do Contrato (Cliente) <span className="text-red-500">*</span></Label>
                   <Select onValueChange={setContractName} value={contractName}>
                        <SelectTrigger><SelectValue placeholder="Selecione o contrato" /></SelectTrigger>
                        <SelectContent>
                        {availableContracts.map((c) => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supervisor">Supervisor Responsável <span className="text-red-500">*</span></Label>
                  <Input id="supervisor" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} disabled={!!node} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Contato <span className="text-red-500">*</span></Label>
                  <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} disabled={!!node}/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="urgency">Urgência <span className="text-red-500">*</span></Label>
                    <Select onValueChange={setUrgency} value={urgency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Rotina">Rotina (Azul)</SelectItem>
                        <SelectItem value="Atenção">Atenção (Vermelho)</SelectItem>
                        <SelectItem value="Crítico">Crítico (Preto)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
               <div className="grid gap-2">
                <Label htmlFor="message">Mensagem (Descrição do Problema) <span className="text-red-500">*</span></Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                <legend className="-ml-1 px-1 text-sm font-medium">Informações Técnicas (Opcional)</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="equipmentName">Nome do Equipamento</Label>
                        <Input id="equipmentName" value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="equipmentBrand">Marca</Label>
                        <Input id="equipmentBrand" value={equipmentBrand} onChange={(e) => setEquipmentBrand(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="equipmentModel">Modelo</Label>
                        <Input id="equipmentModel" value={equipmentModel} onChange={(e) => setEquipmentModel(e.target.value)} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="cause">Causa Provável</Label>
                        <Input id="cause" value={cause} onChange={(e) => setCause(e.target.value)} />
                    </div>
                 </div>
            </fieldset>

             <fieldset className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                <legend className="-ml-1 px-1 text-sm font-medium">Status do Atendimento</legend>
                 <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={setStatus} value={status}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Em andamento">Em andamento</SelectItem>
                        <SelectItem value="Finalizado">Finalizado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </fieldset>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit}>Salvar Ticket</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
