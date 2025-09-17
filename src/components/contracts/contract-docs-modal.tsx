
'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Paperclip, Trash2, FileText, Download, UploadCloud } from 'lucide-react';
import type { Contract, ContractDocument, User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

// --- Sub-componente: Modal de Upload ---
function UploadModal({ 
    isOpen, 
    onClose, 
    onSave 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (doc: Omit<ContractDocument, 'id' | 'uploadedAt'>) => void;
}) {
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
    
    const triggerFileUnput = () => fileInputRef.current?.click();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                         <Button variant="outline" onClick={triggerFileUnput}>
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


// --- Componente Principal: Modal de Documentos do Contrato ---
type ContractDocsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onSaveDocument: (contractId: string, document: Omit<ContractDocument, 'id' | 'uploadedAt'>) => void;
  onDeleteDocument: (contractId: string, documentId: string) => void;
  currentUser: User | null;
};

export function ContractDocsModal({ isOpen, onClose, contract, onSaveDocument, onDeleteDocument, currentUser }: ContractDocsModalProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const isSupervisor = currentUser?.role === 'Supervisor' || currentUser?.role === 'Administrador';

  const handleSave = (document: Omit<ContractDocument, 'id' | 'uploadedAt'>) => {
    onSaveDocument(contract.id, document);
    setIsUploadModalOpen(false); // Garante que o modal de upload feche
  };

  const openFile = (fileUrl: string, fileType: string) => {
    if (fileType.startsWith('image/')) {
        const newWindow = window.open();
        newWindow?.document.write(`<img src="${fileUrl}" style="max-width: 100%; max-height: 100vh; margin: auto; display: block;">`);
    } else {
        window.open(fileUrl, '_blank');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Painel do Contrato: {contract.name}</DialogTitle>
            <DialogDescription>
              Gerencie documentos e outras informações relacionadas a este contrato.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="documents" className="flex-1 flex flex-col overflow-hidden">
            <TabsList>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="relationships" disabled>Relacionamentos</TabsTrigger>
              <TabsTrigger value="systems" disabled>Sistemas</TabsTrigger>
              <TabsTrigger value="revisions" disabled>Revisões</TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="flex-1 overflow-auto p-1">
              <div className="flex justify-between items-center mb-4 p-4">
                <h3 className="text-lg font-semibold">Documentos Anexados</h3>
                {isSupervisor && (
                    <Button onClick={() => setIsUploadModalOpen(true)}>
                        <PlusCircle className="mr-2" />
                        Adicionar Documento
                    </Button>
                )}
              </div>
              <ScrollArea className="h-full">
                <div className="space-y-3 px-4 pb-4">
                  {(contract.documents && contract.documents.length > 0) ? contract.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <FileText className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-semibold">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.fileName} - {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openFile(doc.fileUrl, doc.fileType)}>
                            <Download className="h-4 w-4" />
                        </Button>
                        {isSupervisor && (
                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onDeleteDocument(contract.id, doc.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-muted-foreground py-10">
                      <Paperclip className="mx-auto h-12 w-12 mb-4" />
                      <p>Nenhum documento anexado a este contrato ainda.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Renderiza o modal de upload separadamente */}
      {isSupervisor && (
          <UploadModal 
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onSave={handleSave}
          />
      )}
    </>
  );
}
