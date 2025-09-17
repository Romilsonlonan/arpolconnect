'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { ReportCover } from '@/lib/data';
import Image from 'next/image';
import { Upload } from 'lucide-react';

type ReportCoverModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ReportCover, 'id'>, id?: string) => void;
  editingCover: ReportCover | null;
};

export function ReportCoverModal({ isOpen, onClose, onSave, editingCover }: ReportCoverModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (editingCover) {
        setTitle(editingCover.title);
        setSubtitle(editingCover.subtitle);
        setImageUrl(editingCover.imageUrl);
      } else {
        setTitle('');
        setSubtitle('');
        setImageUrl('');
      }
    }
  }, [editingCover, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        try {
          // A simple check for large images, though localStorage has its own limits
          if (result.length > 2 * 1024 * 1024) { // Roughly 2MB
             toast({ title: 'Imagem muito grande', description: 'Tente uma imagem menor.', variant: 'destructive'});
             return;
          }
          setImageUrl(result);
        } catch (err) {
            toast({ title: 'Erro ao carregar imagem', variant: 'destructive'});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title || !imageUrl) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Título e Imagem de fundo são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      title,
      subtitle,
      imageUrl,
    }, editingCover?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCover ? 'Editar Capa do Relatório' : 'Adicionar Nova Capa'}</DialogTitle>
          <DialogDescription>
            Preencha as informações da capa da apresentação.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subtitle">Subtítulo (Ex: Mês)</Label>
            <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Imagem de Fundo</Label>
            {imageUrl && (
              <div className="relative w-full h-32 rounded-md overflow-hidden border">
                <Image src={imageUrl} alt="Pré-visualização" fill style={{ objectFit: 'cover' }} unoptimized />
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
              {imageUrl ? 'Alterar Imagem' : 'Carregar Imagem'}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
