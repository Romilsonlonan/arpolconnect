
'use client'

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { initialOrgTree, type OrgNode, type Message } from '@/lib/data';
import { getAvatar } from '@/lib/avatar-storage';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const ORG_CHART_STORAGE_KEY = 'orgChartTree';
const DASHBOARD_MESSAGES_KEY = 'dashboardMessages';


function getVisibleNodes(tree: OrgNode): OrgNode[] {
    const visibleNodes: OrgNode[] = [];

    function findVisible(node: OrgNode) {
        if (node.showInNeuralNet !== false) {
             visibleNodes.push(node);
        }

        if (node.children) {
            for (const child of node.children) {
                findVisible(child);
            }
        }
    }
    
    // Start from the root, but exclude the root itself from the final list
    findVisible(tree);
    return visibleNodes.filter(node => node.id !== 'arpolar' && node.role === 'Supervisor');
}

function NodeAvatar({ node, alertLevel, isSelected }: { node: OrgNode, alertLevel: 'critical' | 'warning' | 'none', isSelected: boolean }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const url = getAvatar(node.id);
        setAvatarUrl(url);
    }, [node.id]);

    const finalAvatarUrl = avatarUrl || node.avatar;
    
    const shadowClass = useMemo(() => {
        if (isSelected) return 'ring-4 ring-offset-2 ring-accent';
        switch (alertLevel) {
            case 'critical': return 'animate-shadow-pulse-critical';
            case 'warning': return 'animate-shadow-pulse-warning';
            default: return '';
        }
    }, [alertLevel, isSelected]);


    return (
        <Avatar className={cn(
            "w-16 h-16 border-4 border-background shadow-lg hover:scale-110 transition-all cursor-pointer rounded-full",
            shadowClass
        )}>
            <AvatarImage src={finalAvatarUrl} alt={node.name} data-ai-hint="person portrait" />
            <AvatarFallback>{node.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
    );
}


export function SupervisorNeuralNet({ onNodeClick, selectedNodeId }: { onNodeClick: (nodeId: string | null) => void, selectedNodeId: string | null }) {
    const [nodes, setNodes] = useState<OrgNode[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
      setIsClient(true);
      
      const handleStorageChange = () => {
         const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
         const orgTree = savedTree ? JSON.parse(savedTree) : initialOrgTree;
         setNodes(getVisibleNodes(orgTree));

         const savedMessages = localStorage.getItem(DASHBOARD_MESSAGES_KEY);
         setMessages(savedMessages ? JSON.parse(savedMessages) : []);
      }

      // Initial load
      handleStorageChange();

      window.addEventListener('storage', handleStorageChange);
      return () => {
          window.removeEventListener('storage', handleStorageChange);
      }
    }, []);

    const supervisorAlertLevels = useMemo(() => {
        const criticalAuthors = new Set<string>();
        const warningAuthors = new Set<string>();

        messages.forEach(msg => {
            if (msg.status !== 'Finalizado') {
                if (msg.urgency === 'Crítico') {
                    criticalAuthors.add(msg.supervisor);
                } else if (msg.urgency === 'Atenção') {
                    warningAuthors.add(msg.supervisor);
                }
            }
        });

        const alertMap = new Map<string, 'critical' | 'warning' | 'none'>();
        nodes.forEach(node => {
            if (criticalAuthors.has(node.name)) {
                alertMap.set(node.id, 'critical');
            } else if (warningAuthors.has(node.name)) {
                alertMap.set(node.id, 'warning');
            } else {
                 alertMap.set(node.id, 'none');
            }
        });
        return alertMap;

    }, [nodes, messages]);


    if (!isClient) {
        return null; // Or a loading skeleton
    }

    const radius = 120; // Circle radius
    const nodeCount = nodes.length;
    const angleStep = nodeCount > 0 ? (2 * Math.PI) / nodeCount : 0;

    return (
        <TooltipProvider>
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => {
                // If the click is on the background, deselect the node
                if (e.target === e.currentTarget) {
                    onNodeClick(null);
                }
            }}>
                {/* Central Logo */}
                <div className="z-10">
                   <Tooltip>
                        <TooltipTrigger>
                           <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center p-2">
                                <Image src="https://i.ibb.co/ksM7sG9D/Logo.png" alt="Arpolar Connect Logo" width={96} height={96} />
                           </div>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Arpolar Connect</p>
                        </TooltipContent>
                    </Tooltip>
                </div>


                {/* Supervisor Nodes and Lines */}
                {nodes.map((node, index) => {
                    const angle = angleStep * index;
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);
                    const rotation = (angle * 180 / Math.PI) + 90;
                    const alertLevel = supervisorAlertLevels.get(node.id) || 'none';
                    const isSelected = selectedNodeId === node.id;

                    return (
                        <div key={node.id} className="absolute top-1/2 left-1/2">
                            {/* Connection Line */}
                            <div 
                                className="absolute bottom-1/2 left-1/2 w-px bg-primary/50"
                                style={{
                                    height: `${radius}px`,
                                    transform: `rotate(${rotation}deg)`,
                                    transformOrigin: 'bottom'
                                }}
                            />
                            
                             {/* Supervisor Avatar */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className="absolute"
                                        style={{
                                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`
                                        }}
                                        onClick={(e) => { e.stopPropagation(); onNodeClick(node.id); }}
                                    >
                                        <NodeAvatar node={node} alertLevel={alertLevel} isSelected={isSelected} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">{node.name}</p>
                                    <p className="text-muted-foreground">{node.contact}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )
                })}

            </div>
        </TooltipProvider>
    )
}

    