'use client';

import type { OrgNode } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TreeNode({ node }: { node: OrgNode }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }
  
  return (
    <div className="inline-flex flex-col items-center text-center relative px-4">
      {/* The node itself */}
      <Card className="min-w-52 text-center shadow-md hover:shadow-lg hover:scale-105 transition-all relative z-10 bg-card">
        <CardContent className="p-4 flex flex-col items-center gap-2">
          <Avatar className="w-16 h-16 border-2 border-primary">
            <AvatarImage src={node.avatar} data-ai-hint="person portrait" />
            <AvatarFallback>{getInitials(node.name)}</AvatarFallback>
          </Avatar>
          <div className="mt-2">
            <p className="font-bold text-lg font-headline">{node.name}</p>
            <p className="text-sm text-muted-foreground">{node.role}</p>
          </div>
          {node.role !== 'Company' && node.role !== 'Contract' && (
            <Button variant="outline" size="sm" className="mt-2 w-full">
              <MessageCircle className="w-4 h-4 mr-2" /> Message
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Children container */}
      {node.children && node.children.length > 0 && (
        <>
          {/* Connector line down from parent */}
          <div className="absolute top-full h-8 w-0.5 bg-gray-600" />
          
          <div className="flex pt-16 relative">
             {/* Horizontal line connecting all children */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-600" />
            
            {node.children.map((child) => (
              <div key={child.id} className={cn(
                "relative",
                // Vertical line from child up to horizontal line
                "before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:h-8 before:bg-gray-600"
              )}>
                <TreeNode node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
