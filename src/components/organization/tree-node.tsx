
'use client';

import { useState, useEffect } from 'react';
import type { OrgNode } from '@/lib/data';
import { getAvatar } from '@/lib/avatar-storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Briefcase, Building, MessageSquarePlus, ChevronDown, ChevronUp, Bell, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"

type TreeNodeProps = {
  node: OrgNode;
  onUpdate: (nodeId: string, values: Partial<OrgNode>) => void;
  onAddChild: (parentId: string, child: Omit<OrgNode, 'children' | 'id'>) => void;
  onRemove: (nodeId: string) => void;
  onMoveNode: (draggedNodeId: string, targetNodeId: string) => void;
  onOpenTicketModal: (node: OrgNode) => void;
  onToggleVisibility: (nodeId: string) => void;
  privateTicketCount: number;
  isRoot?: boolean;
};

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
)

function NodeAvatar({ node }: { node: OrgNode }) {
    const avatarUrl = getAvatar(node.id) || node.avatar;
    const isContract = node.role === 'Contrato';

    return (
        <Avatar className={cn(
            "w-16 h-16 border-2",
            isContract ? "border-accent" : "border-primary",
        )}>
            <AvatarImage src={avatarUrl ?? undefined} alt={node.name} data-ai-hint="person portrait" draggable="false" className={cn(isContract && "object-cover")}/>
            <AvatarFallback>{node.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
        </Avatar>
    );
}

export function TreeNode({ node, onUpdate, onAddChild, onRemove, onMoveNode, onOpenTicketModal, onToggleVisibility, privateTicketCount, isRoot = false }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isContractNode = node.role === 'Contrato';
  const formattedPhone = node.contact?.replace(/\D/g, '');

  return (
    <TooltipProvider>
    <div className="flex flex-col items-center text-center relative px-4">
      <Card 
        className={cn(
        "w-60 text-center shadow-md hover:shadow-lg transition-all duration-300 relative group min-h-[200px] flex flex-col",
        "bg-card"
        )}>
        <CardContent className="p-4 flex flex-col items-center gap-2 relative h-full flex-1">
          <NodeAvatar node={node} />
          <div className="mt-2 flex-grow">
            <p className="font-bold text-lg font-headline">{node.name}</p>
            <p className="text-sm text-muted-foreground">{node.role}</p>
          </div>

          <div className="space-y-2">
            {node.role !== 'Contrato' && node.contact && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${node.contact}`} className="truncate hover:underline">{node.contact}</a>
              </div>
            )}

            {node.role === 'Contrato' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4" />
                    <span>Nó de Contrato</span>
                </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80" onClick={() => onOpenTicketModal(node)} disabled={isContractNode}>
                        <MessageSquarePlus className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Criar Ticket</p></TooltipContent>
            </Tooltip>
            {!isContractNode && node.contact && (
                <>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <a href={`mailto:${node.contact}`}>
                            <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80">
                                <Mail className="h-4 w-4" />
                            </Button>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent><p>Enviar Email</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <a href={`https://wa.me/${formattedPhone}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80">
                                <WhatsAppIcon />
                            </Button>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent><p>Enviar WhatsApp</p></TooltipContent>
                </Tooltip>
                </>
            )}
          </div>

          {/* Private ticket indicator */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-100 z-10">
             {privateTicketCount > 0 && (
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative">
                            <Button variant="destructive" size="icon" className="h-7 w-7">
                                <Bell className="h-4 w-4" />
                            </Button>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white text-xs">
                                {privateTicketCount}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Você tem {privateTicketCount} tickets privados</p></TooltipContent>
                </Tooltip>
             )}
          </div>
          
            {/* Expander button */}
            {node.children && node.children.length > 0 && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary/10 hover:bg-primary/20 z-10"
                    onClick={() => setIsExpanded(prev => !prev)}
                >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            )}
        </CardContent>
      </Card>
      
      {isExpanded && node.children && node.children.length > 0 && (
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
                  onMoveNode={onMoveNode}
                  onOpenTicketModal={onOpenTicketModal}
                  onToggleVisibility={onToggleVisibility}
                  privateTicketCount={privateTicketCount}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
    </TooltipProvider>
  );
}
