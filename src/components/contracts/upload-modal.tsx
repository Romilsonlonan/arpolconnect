
'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud } from 'lucide-react';
import type { ContractDocument } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type UploadModalProps = { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (doc: Omit<ContractDocument, 'id' | 'uploadedAt'>) => void;
};

export function UploadModal({ isOpen, onClose, onSave }: UploadModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleSave = async () => {
        if (!name || !file) {
            toast({ title: "Campos obrigatórios", description: "O nome e o arquivo são necessários.", variant: "destructive" });
            return;
        }

        const fileToUrl = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
        };

        try {
            const fileUrl = await fileToUrl(file);
            onSave({
                name,
                description,
                fileUrl,
                fileName: file.name,
                fileType: file.type,
            });
            onClose(); // Close the modal on success
        } catch (error) {
            toast({ title: "Erro no Upload", description: "Não foi possível processar o arquivo.", variant: "destructive" });
        }
    };
    
    const triggerFileInput = () => fileInputRef.current?.click();

    // Reset state when modal is closed
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setName('');
            setDescription('');
            setFile(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if(!open) handleOpenChange(false)}}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Documento</DialogTitle>
                    <DialogDescription>Preencha os detalhes e anexe o arquivo.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="doc-name">Nome do Documento</Label>
                        <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Proposta Técnica Final"/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="doc-description">Descrição</Label>
                        <Textarea id="doc-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição do conteúdo do documento..."/>
                    </div>
                    <div className="grid gap-2">
                         <Label>Anexo</Label>
                         <Input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        />
                         <Button variant="outline" onClick={triggerFileInput}>
                            <UploadCloud className="mr-2" />
                            {file ? `Arquivo: ${file.name}` : 'Escolher Arquivo'}
                         </Button>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Documento</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
