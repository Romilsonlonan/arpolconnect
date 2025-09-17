
'use client';

import { useState, useRef, useEffect } from 'react';
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

type RevisionData = {
    name: string;
    description: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
}

type RevisionModalProps = { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (docId: string, data: RevisionData) => void;
    document: ContractDocument;
};

export function RevisionModal({ isOpen, onClose, onSave, document }: RevisionModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (document) {
            setName(document.name);
            setDescription(document.description);
            setFile(null); // Reset file on open
        }
    }, [document]);

    const handleSave = async () => {
        if (!name) {
            toast({ title: "Nome obrigatório", description: "O nome do documento é necessário.", variant: "destructive" });
            return;
        }

        const dataToSave: RevisionData = {
            name,
            description
        };

        if (file) {
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
                dataToSave.fileUrl = fileUrl;
                dataToSave.fileName = file.name;
                dataToSave.fileType = file.type;
            } catch (error) {
                toast({ title: "Erro no Upload", description: "Não foi possível processar o novo arquivo.", variant: "destructive" });
                return;
            }
        }
        
        onSave(document.id, dataToSave);
    };
    
    const triggerFileInput = () => fileInputRef.current?.click();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Revisar Documento</DialogTitle>
                    <DialogDescription>Atualize os detalhes ou substitua o anexo do documento.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="doc-name">Nome do Documento</Label>
                        <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="doc-description">Descrição</Label>
                        <Textarea id="doc-description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                         <Label>Substituir Anexo (Opcional)</Label>
                         <p className="text-xs text-muted-foreground">Anexo atual: {document.fileName}</p>
                         <Input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        />
                         <Button variant="outline" onClick={triggerFileInput}>
                            <UploadCloud className="mr-2" />
                            {file ? `Novo arquivo: ${file.name}` : 'Escolher Novo Arquivo'}
                         </Button>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Revisão</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
