'use client'

import { useState } from 'react';
import { initialOrgTree, type OrgNode } from '@/lib/data';
import { TreeNode } from '@/components/organization/tree-node';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { findNode, updateTree } from '@/lib/tree-utils';

export default function OrganogramaPage() {
  const [zoom, setZoom] = useState(1);
  const [tree, setTree] = useState<OrgNode>(initialOrgTree);

  const handleUpdateNode = (nodeId: string, values: Partial<OrgNode>) => {
    const newTree = updateTree(tree, (node) => {
      if (node.id === nodeId) {
        return { ...node, ...values };
      }
      return node;
    });
    setTree(newTree);
  };

  const handleAddChildNode = (parentId: string, child: Omit<OrgNode, 'children' | 'id'>) => {
    const newTree = updateTree(tree, (node) => {
      if (node.id === parentId) {
        const newNode: OrgNode = {
          ...child,
          id: `node-${Date.now()}-${Math.random()}`,
          children: [],
        };
        return { ...node, children: [...(node.children || []), newNode] };
      }
      return node;
    });
    setTree(newTree);
  };
  
  const handleRemoveNode = (nodeId: string) => {
      if (nodeId === tree.id) {
          alert("Cannot remove root node.");
          return;
      }
       const newTree = updateTree(tree, (node) => {
          if (node.children) {
              node.children = node.children.filter(child => child.id !== nodeId);
          }
          return node;
      });
      setTree(newTree);
  };


  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center pb-4 border-b gap-4">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Organograma</h1>
        <div className="ml-0 sm:ml-auto flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 w-36 sm:w-48">
             <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
             <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.2}
                max={2}
                step={0.1}
             />
             <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
          </div>
           <Button variant="outline" size="icon" onClick={() => setZoom(1)}><RotateCcw className="h-4 w-4" /></Button>
        </div>
      </div>
      <div 
        className="flex-grow overflow-auto p-4 rounded-lg mt-4 bg-cover bg-center"
        style={{ backgroundImage: "url('https://files.fm/f/ypp4krtn5j')" }}
      >
        <div
          className="transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >
          <TreeNode 
            node={tree}
            onUpdate={handleUpdateNode}
            onAddChild={handleAddChildNode}
            onRemove={handleRemoveNode}
           />
        </div>
      </div>
    </div>
  );
}
