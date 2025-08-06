import type { OrgNode } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export function TreeNode({ node }: { node: OrgNode }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }
  
  return (
    <div className="flex flex-col items-center relative">
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
          {node.role !== 'Company' && (
            <Button variant="outline" size="sm" className="mt-2 w-full">
              <MessageCircle className="w-4 h-4 mr-2" /> Message
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Children container */}
      {node.children && node.children.length > 0 && (
        <>
          {/* Vertical line from parent to the horizontal line */}
          <div className="absolute top-full h-8 w-0.5 bg-border" style={{left: '50%'}}></div>

          <div className="flex justify-center gap-8 pt-16 relative">
             {/* Horizontal line connecting all children */}
            {node.children.length > 1 &&
              <div className="absolute top-[32px] h-0.5 bg-border" style={{ left: '25%', right: '25%' }}></div>
            }
            
            {node.children.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center">
                 {/* Top vertical line for each child connecting to the horizontal line */}
                 <div className="absolute bottom-full h-8 w-0.5 bg-border" style={{left: '50%'}}></div>

                <TreeNode node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
