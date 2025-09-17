
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Paperclip, Trash2, FileText, Download, Pencil } from 'lucide-react';
import type { Contract, ContractDocument, User } from '@/lib/data';
import { UploadModal } from '@/components/contracts/upload-modal';
import { RevisionModal } from '@/components/contracts/revision-modal';

// --- Componente Principal: Modal de Documentos do Contrato ---
type ContractDocsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onSaveDocument: (contractId: string, document: Omit<ContractDocument, 'id' | 'uploadedAt'>) => void;
  onUpdateDocument: (contractId: string, documentId: string, documentData: Partial<Omit<ContractDocument, 'id'>>) => void;
  onDeleteDocument: (contractId: string, documentId: string) => void;
  currentUser: User | null;
};

export function ContractDocsModal({ isOpen, onClose, contract, onSaveDocument, onUpdateDocument, onDeleteDocument, currentUser }: ContractDocsModalProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [revisioningDoc, setRevisioningDoc] = useState<ContractDocument | null>(null);

  const isSupervisor = currentUser?.role === 'Supervisor' || currentUser?.role === 'Administrador';

  const handleSave = (document: Omit<ContractDocument, 'id' | 'uploadedAt'>) => {
    onSaveDocument(contract.id, document);
    setIsUploadModalOpen(false);
  };
  
  const handleUpdate = (docId: string, data: Partial<Omit<ContractDocument, 'id'>>) => {
    onUpdateDocument(contract.id, docId, data);
    setRevisioningDoc(null);
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
          <Tabs defaultValue="revisions" className="flex-1 flex flex-col overflow-hidden">
            <TabsList>
              <TabsTrigger value="revisions">Revisões e Anexos</TabsTrigger>
              <TabsTrigger value="relationships" disabled>Relacionamentos</TabsTrigger>
              <TabsTrigger value="systems" disabled>Sistemas</TabsTrigger>
              <TabsTrigger value="trainings" disabled>Treinamentos</TabsTrigger>
            </TabsList>
            <TabsContent value="revisions" className="flex-1 overflow-auto p-1">
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
                            {doc.fileName} - 
                            {doc.revisedAt 
                                ? ` Revisado em: ${new Date(doc.revisedAt).toLocaleDateString()}`
                                : ` Criado em: ${new Date(doc.uploadedAt).toLocaleDateString()}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openFile(doc.fileUrl, doc.fileType)}>
                            <Download className="h-4 w-4" />
                        </Button>
                        {isSupervisor && (
                           <>
                             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setRevisioningDoc(doc)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onDeleteDocument(contract.id, doc.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                           </>
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

      {isSupervisor && (
        <>
            <UploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSave={handleSave}
            />
            {revisioningDoc && (
                <RevisionModal
                    isOpen={!!revisioningDoc}
                    onClose={() => setRevisioningDoc(null)}
                    onSave={handleUpdate}
                    document={revisioningDoc}
                />
            )}
        </>
      )}
    </>
  );
}
