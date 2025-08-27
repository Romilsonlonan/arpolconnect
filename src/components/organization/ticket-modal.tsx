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
import type { OrgNode, Message } from '@/lib/data';

type TicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: Omit<Message, 'id' | 'createdAt' | 'author'>) => void;
  node: OrgNode | null;
};

export function TicketModal({ isOpen, onClose, onSave, node }: TicketModalProps) {
  const { toast } = useToast();

  // Required fields
  const [contractName, setContractName] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState('Rotina');
  const [status, setStatus] = useState('Em andamento');

  // Optional fields
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentBrand, setEquipmentBrand] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [cause, setCause] = useState('');

  useEffect(() => {
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
      setEquipmentName('');
      setEquipmentBrand('');
      setEquipmentModel('');
      setCause('');
    }
  }, [node, isOpen]);

  const handleSubmit = () => {
    if (!contractName || !supervisor || !contact || !message) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
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
      equipmentName,
      equipmentBrand,
      equipmentModel,
      cause,
    });
    onClose();
    toast({
        title: "Ticket Criado!",
        description: "O ticket foi criado e enviado para o painel.",
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
              <legend className="-ml-1 px-1 text-sm font-medium">Informações do Ticket</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contractName">Nome do Contrato (Cliente) <span className="text-red-500">*</span></Label>
                  <Input id="contractName" value={contractName} onChange={(e) => setContractName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supervisor">Supervisor Responsável <span className="text-red-500">*</span></Label>
                  <Input id="supervisor" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Contato <span className="text-red-500">*</span></Label>
                  <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} />
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
