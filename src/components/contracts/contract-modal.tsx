
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Contract, OrgNode } from '@/lib/data';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

type ContractModalProps = {
  isOpen: boolean;
  onClose: () => void;
  supervisors: OrgNode[];
  onSave: (data: Omit<Contract, 'id'>, id?: string) => void;
  editingContract: Contract | null;
};

export function ContractModal({ isOpen, onClose, supervisors, onSave, editingContract }: ContractModalProps) {
    const [name, setName] = useState('');
    const [supervisorId, setSupervisorId] = useState('');
    const [address, setAddress] = useState('');
    const [region, setRegion] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (editingContract) {
                setName(editingContract.name);
                setSupervisorId(editingContract.supervisorId);
                setAddress(editingContract.address);
                setRegion(editingContract.region);
                setBackgroundImage(editingContract.backgroundImage);
            } else {
                // Reset form for new contract
                setName('');
                setSupervisorId('');
                setAddress('');
                setRegion('');
                setBackgroundImage('');
            }
        }
    }, [editingContract, isOpen]);

    const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
              const img = document.createElement('img');
              img.src = event.target?.result as string;
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
                  ctx?.drawImage(img, 0, 0, width, height);

                  resolve(canvas.toDataURL('image/jpeg', quality));
              };
              img.onerror = reject;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: "Imagem Muito Grande",
                    description: "Por favor, selecione uma imagem menor que 5MB.",
                    variant: "destructive",
                });
                return;
            }
            try {
              const resizedDataUrl = await resizeImage(file, 1200, 800, 0.9);
              setBackgroundImage(resizedDataUrl);
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
        if (!supervisor) {
            toast({
                title: "Supervisor Inválido",
                description: "O supervisor selecionado não foi encontrado.",
                variant: "destructive",
            });
            return;
        }

        onSave({
            name,
            supervisorId,
            supervisorName: supervisor.name,
            address,
            region,
            backgroundImage
        }, editingContract?.id);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingContract ? 'Editar Contrato' : 'Adicionar Novo Contrato'}</DialogTitle>
                    <DialogDescription>
                        {editingContract ? 'Atualize as informações do contrato.' : 'Preencha as informações para registrar um novo contrato.'}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] -mx-6">
                    <div className="grid gap-4 py-4 px-6">
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
                                    <Image src={backgroundImage} alt="Pré-visualização da imagem" fill style={{objectFit: "cover"}} unoptimized/>
                                </div>
                            )}
                            <Input 
                                id="image-upload"
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                            />
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2" />
                                {backgroundImage ? 'Alterar Imagem' : 'Carregar Imagem'}
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
                    <Button onClick={handleSubmit}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
