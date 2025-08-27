'use client';

import { useState } from 'react';
import type { OrgNode } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Phone, Briefcase, Building, MessageSquarePlus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmployeeModal } from './employee-modal';
import { ContractSettingsModal } from './contract-settings-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type TreeNodeProps = {
  node: OrgNode;
  onUpdate: (nodeId: string, values: Partial<OrgNode>) => void;
  onAddChild: (parentId: string, child: Omit<OrgNode, 'children' | 'id'>) => void;
  onRemove: (nodeId: string) => void;
  onContractSettingsChange: (settings: any) => void;
  onOpenTicketModal: (node: OrgNode) => void;
  onToggleVisibility: (nodeId: string) => void;
  contractSettings: any;
  isRoot?: boolean;
};

export function TreeNode({ node, onUpdate, onAddChild, onRemove, onContractSettingsChange, onOpenTicketModal, onToggleVisibility, contractSettings, isRoot = false }: TreeNodeProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  }

  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<OrgNode | null>(null);

  const handleAdd = () => {
    setEditingNode(null);
    setEmployeeModalOpen(true);
  };

  const handleEdit = () => {
    setEditingNode(node);
    setEmployeeModalOpen(true);
  };
  
  const handleSaveEmployee = (values: Omit<OrgNode, 'id' | 'children'>) => {
    if (editingNode) {
      // Editing existing node
      onUpdate(editingNode.id, values);
    } else {
      // Adding new node as a child
      onAddChild(node.id, values);
    }
  };

  const handleOpenContractSettings = () => {
    setContractModalOpen(true);
  }
  
  return (
    <div className="flex flex-col items-center text-center relative px-4">
      <Card className={cn(
        "min-w-60 text-center shadow-md hover:shadow-lg transition-all duration-300 relative group",
        "bg-card"
        )}>
        <CardContent className="p-4 flex flex-col items-center gap-2">
          <Avatar className="w-16 h-16 border-2 border-primary">
            <AvatarImage src={node.avatar} data-ai-hint="person portrait" />
            <AvatarFallback>{getInitials(node.name)}</AvatarFallback>
          </Avatar>
          <div className="mt-2">
            <p className="font-bold text-lg font-headline">{node.name}</p>
            <p className="text-sm text-muted-foreground">{node.role}</p>
          </div>

          {node.contact && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{node.contact}</span>
             </div>
          )}

          {node.contract && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{node.contract}</span>
                </div>
           )}

          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
             </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80" onClick={handleEdit}>
                <Pencil className="h-4 w-4" />
            </Button>
            {!isRoot && (
              <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80" onClick={() => onToggleVisibility(node.id)}>
                {node.showInNeuralNet === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80" onClick={handleOpenContractSettings}>
                <Building className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80" onClick={() => onOpenTicketModal(node)}>
                <MessageSquarePlus className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <AlertDialog>
              <AlertDialogTrigger asChild>
                 <Button variant="destructive" size="icon" className="h-7 w-7">
                    <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso removerá permanentemente o funcionário e todos os seus subordinados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onRemove(node.id)}>
                    Continuar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
      
      <EmployeeModal
        isOpen={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        editingNode={editingNode}
      />

      <ContractSettingsModal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        onSave={onContractSettingsChange}
        settings={contractSettings}
        hideBackgroundImage
      />


      {node.children && node.children.length > 0 && (
        <>
          <div className="absolute top-full h-8 w-px bg-slate-600 left-1/2 -translate-x-1/2"></div>
          
          <div className="flex pt-16 relative before:content-[''] before:absolute before:top-8 before:w-full before:h-px before:bg-slate-600">
            {node.children.map((child, index) => (
              <div key={child.id} className={cn(
                "relative before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:w-px before:h-8 before:bg-slate-600",
                index > 0 && "ml-4",
              )}>
                <TreeNode 
                  node={child} 
                  onUpdate={onUpdate} 
                  onAddChild={onAddChild} 
                  onRemove={onRemove}
                  onContractSettingsChange={onContractSettingsChange}
                  onOpenTicketModal={onOpenTicketModal}
                  onToggleVisibility={onToggleVisibility}
                  contractSettings={contractSettings}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
