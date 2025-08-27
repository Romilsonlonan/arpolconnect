'use client'

import { useState, useEffect } from 'react';
import { initialOrgTree, type OrgNode } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Logo } from '../icons/logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ORG_CHART_STORAGE_KEY = 'orgChartTree';

function getVisibleSupervisors(node: OrgNode): OrgNode[] {
    let supervisors: OrgNode[] = [];
    if (node.role === 'Supervisor' && node.showInNeuralNet !== false) {
        supervisors.push(node);
    }
    if (node.children) {
        for (const child of node.children) {
            supervisors = supervisors.concat(getVisibleSupervisors(child));
        }
    }
    return supervisors;
}

export function SupervisorNeuralNet() {
    const [supervisors, setSupervisors] = useState<OrgNode[]>([]);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
      setIsClient(true);
      const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
      const orgTree = savedTree ? JSON.parse(savedTree) : initialOrgTree;
      setSupervisors(getVisibleSupervisors(orgTree));

      const handleStorageChange = () => {
         const updatedSavedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
         const updatedOrgTree = updatedSavedTree ? JSON.parse(updatedSavedTree) : initialOrgTree;
         setSupervisors(getVisibleSupervisors(updatedOrgTree));
      }

      window.addEventListener('storage', handleStorageChange);
      return () => {
          window.removeEventListener('storage', handleStorageChange);
      }
    }, []);

    if (!isClient) {
        return null; // Or a loading skeleton
    }

    const radius = 120; // Circle radius
    const supervisorCount = supervisors.length;
    const angleStep = supervisorCount > 0 ? (2 * Math.PI) / supervisorCount : 0;

    return (
        <TooltipProvider>
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Central Logo */}
                <div className="z-10">
                   <Tooltip>
                        <TooltipTrigger>
                           <div className="w-24 h-24 text-primary bg-primary/10 rounded-full flex items-center justify-center p-4">
                                <Logo />
                           </div>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Arpolar Connect</p>
                        </TooltipContent>
                    </Tooltip>
                </div>


                {/* Supervisor Nodes and Lines */}
                {supervisors.map((supervisor, index) => {
                    const angle = angleStep * index;
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);
                    const rotation = (angle * 180 / Math.PI) + 90;

                    return (
                        <div key={supervisor.id} className="absolute top-1/2 left-1/2">
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
                                    >
                                        <Avatar className="w-16 h-16 border-4 border-background shadow-lg hover:scale-110 transition-transform cursor-pointer">
                                            <AvatarImage src={supervisor.avatar} alt={supervisor.name} data-ai-hint="person portrait" />
                                            <AvatarFallback>{supervisor.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">{supervisor.name}</p>
                                    <p className="text-muted-foreground">{supervisor.contact}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )
                })}

            </div>
        </TooltipProvider>
    )
}
