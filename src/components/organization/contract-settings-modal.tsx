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
import { ScrollArea } from '../ui/scroll-area';

type ContractSettings = {
  backgroundImage?: string;
  contractName: string;
  region: string;
  address: string;
  responsible: string;
};

type ContractSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ContractSettings) => void;
  settings: ContractSettings;
  hideBackgroundImage?: boolean;
};

export function ContractSettingsModal({ isOpen, onClose, onSave, settings, hideBackgroundImage = false }: ContractSettingsModalProps) {
  const [backgroundImage, setBackgroundImage] = useState('');
  const [contractName, setContractName] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [responsible, setResponsible] = useState('');

  useEffect(() => {
    if (settings) {
      setBackgroundImage(settings.backgroundImage || '');
      setContractName(settings.contractName);
      setRegion(settings.region);
      setAddress(settings.address);
      setResponsible(settings.responsible);
    }
  }, [settings, isOpen]);

  const handleSubmit = () => {
    const settingsToSave: ContractSettings = {
      contractName,
      region,
      address,
      responsible,
    };
    if (!hideBackgroundImage) {
        settingsToSave.backgroundImage = backgroundImage
    }
    onSave(settingsToSave);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações do Contrato</DialogTitle>
          <DialogDescription>
            Atualize as informações gerais do contrato e a imagem de fundo do organograma.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] -mx-6">
          <div className="grid gap-4 py-4 px-6">
            {!hideBackgroundImage && (
                <div className="grid gap-2">
                <Label htmlFor="backgroundImage">URL da Imagem de Fundo</Label>
                <Input id="backgroundImage" value={backgroundImage} onChange={(e) => setBackgroundImage(e.target.value)} placeholder="https://exemplo.com/imagem.png" />
                </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="contractName">Nome do Contrato (Cliente)</Label>
              <Input id="contractName" value={contractName} onChange={(e) => setContractName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">Região</Label>
              <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="responsible">Cliente Responsável</Label>
              <Input id="responsible" value={responsible} onChange={(e) => setResponsible(e.target.value)} />
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
