
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

type ReportCoverModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ReportCover, 'id'>, id?: string) => void;
  editingCover: ReportCover | null;
};

export function ReportCoverModal({ isOpen, onClose, onSave, editingCover }: ReportCoverModalProps) {
  const [type, setType] = useState<ReportCover['type']>('cover');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quote, setQuote] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [characterImageUrl, setCharacterImageUrl] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorImageUrl, setSupervisorImageUrl] = useState('');
  
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const charFileInputRef = useRef<HTMLInputElement>(null);
  const supervisorFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (editingCover) {
        setType(editingCover.type);
        setTitle(editingCover.title);
        setSubtitle(editingCover.subtitle);
        setImageUrl(editingCover.imageUrl);
        setQuote(editingCover.quote || '');
        setQuoteAuthor(editingCover.quoteAuthor || '');
        setCharacterImageUrl(editingCover.characterImageUrl || '');
        setSupervisorName(editingCover.supervisorName || '');
        setSupervisorImageUrl(editingCover.supervisorImageUrl || '');
      } else {
        setType('cover');
        setTitle('');
        setSubtitle('');
        setImageUrl('');
        setQuote('');
        setQuoteAuthor('');
        setCharacterImageUrl('');
        setSupervisorName('');
        setSupervisorImageUrl('');
      }
    }
  }, [editingCover, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        try {
          if (result.length > 2 * 1024 * 1024) { // Roughly 2MB
             toast({ title: 'Imagem muito grande', description: 'Tente uma imagem menor que 2MB.', variant: 'destructive'});
             return;
          }
          setter(result);
        } catch (err) {
            toast({ title: 'Erro ao carregar imagem', variant: 'destructive'});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!type || !title || !imageUrl) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Tipo, Título e Imagem de fundo são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      type,
      title,
      subtitle,
      imageUrl,
      quote,
      quoteAuthor,
      characterImageUrl,
      supervisors: type === 'supervisors' ? (editingCover?.supervisors || []) : undefined,
      supervisorName,
      supervisorImageUrl
    }, editingCover?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingCover ? 'Editar Página do Relatório' : 'Adicionar Nova Página'}</DialogTitle>
          <DialogDescription>
            Preencha as informações da página da apresentação.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] -mx-6">
        <div className="grid gap-4 py-4 px-6">
          <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Página</Label>
              <Select onValueChange={(v) => setType(v as ReportCover['type'])} value={type}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="cover">Capa de Apresentação</SelectItem>
                      <SelectItem value="motivational">Página Motivacional</SelectItem>
                      <SelectItem value="supervisors">Página de Supervisores</SelectItem>
                      <SelectItem value="supervisor-report">Página de Relatório Individual</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {type === 'cover' && (
            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtítulo (Ex: Mês)</Label>
              <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>
          )}

          {type === 'motivational' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="quote">Citação</Label>
                <Textarea id="quote" value={quote} onChange={(e) => setQuote(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quoteAuthor">Autor da Citação</Label>
                <Input id="quoteAuthor" value={quoteAuthor} onChange={(e) => setQuoteAuthor(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Imagem do Personagem (opcional)</Label>
                {characterImageUrl && (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                    <Image src={characterImageUrl} alt="Pré-visualização" fill style={{ objectFit: 'cover' }} unoptimized />
                  </div>
                )}
                <Input
                  id="char-image-upload" type="file" accept="image/*" className="hidden"
                  ref={charFileInputRef} onChange={(e) => handleImageUpload(e, setCharacterImageUrl)}
                />
                <Button variant="outline" onClick={() => charFileInputRef.current?.click()}>
                  <Upload className="mr-2" />
                  {characterImageUrl ? 'Alterar Imagem do Personagem' : 'Carregar Imagem'}
                </Button>
              </div>
            </>
          )}

          {type === 'supervisor-report' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="supervisorName">Nome do Supervisor</Label>
                <Input id="supervisorName" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Imagem do Supervisor</Label>
                {supervisorImageUrl && (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                    <Image src={supervisorImageUrl} alt="Pré-visualização" fill style={{ objectFit: 'cover' }} unoptimized />
                  </div>
                )}
                <Input
                  id="supervisor-image-upload" type="file" accept="image/*" className="hidden"
                  ref={supervisorFileInputRef} onChange={(e) => handleImageUpload(e, setSupervisorImageUrl)}
                />
                <Button variant="outline" onClick={() => supervisorFileInputRef.current?.click()}>
                  <Upload className="mr-2" />
                  {supervisorImageUrl ? 'Alterar Imagem' : 'Carregar Imagem'}
                </Button>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label>Imagem de Fundo</Label>
            {imageUrl && (
              <div className="relative w-full h-32 rounded-md overflow-hidden border">
                <Image src={imageUrl} alt="Pré-visualização" fill style={{ objectFit: 'cover' }} unoptimized />
              </div>
            )}
            <Input
              id="bg-image-upload" type="file" accept="image/*" className="hidden"
              ref={bgFileInputRef} onChange={(e) => handleImageUpload(e, setImageUrl)}
            />
            <Button variant="outline" onClick={() => bgFileInputRef.current?.click()}>
              <Upload className="mr-2" />
              {imageUrl ? 'Alterar Imagem de Fundo' : 'Carregar Imagem'}
            </Button>
          </div>
        </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    