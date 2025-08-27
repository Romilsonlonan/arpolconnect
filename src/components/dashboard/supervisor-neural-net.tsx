'use client'

import { supervisors } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Logo } from '../icons/logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function SupervisorNeuralNet() {
    const radius = 120; // Raio do círculo
    const supervisorCount = supervisors.length;
    const angleStep = (2 * Math.PI) / supervisorCount;

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
                                    <p className="text-muted-foreground">{supervisor.email}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )
                })}

            </div>
        </TooltipProvider>
    )
}
