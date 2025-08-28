'use client';

import { useState, useEffect } from 'react';
import { initialOrgTree, type OrgNode, type Contract } from '@/lib/data';
import { TreeNode } from '@/components/organization/tree-node';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCcw, Settings, Building } from 'lucide-react';
import { updateTree } from '@/lib/tree-utils';
import { ContractSettingsModal } from '@/components/organization/contract-settings-modal';
import { TicketModal } from '@/components/organization/ticket-modal';
import type { Message } from '@/lib/data';
import { saveAvatar } from '@/lib/avatar-storage';

const ORG_CHART_STORAGE_KEY = 'orgChartTree';
const CONTRACT_SETTINGS_STORAGE_KEY = 'contractSettings';
const DASHBOARD_MESSAGES_KEY = 'dashboardMessages';
const CONTRACTS_STORAGE_KEY = 'arpolarContracts';


type ContractSettings = {
  backgroundImage: string;
  contractName: string;
  region: string;
  address: string;
  responsible: string;
};


export default function OrganogramaPage() {
  const [zoom, setZoom] = useState(1);
  const [tree, setTree] = useState<OrgNode | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketNode, setTicketNode] = useState<OrgNode | null>(null);

  const [contractSettings, setContractSettings] = useState<ContractSettings>({
    backgroundImage: 'https://i.ibb.co/zVzbGGgD/fundoaqc.jpg',
    contractName: 'Contrato Principal',
    region: 'N/A',
    address: 'N/A',
    responsible: 'N/A',
  });
  
  const [nodeContractSettings, setNodeContractSettings] = useState(null);

  useEffect(() => {
    setIsClient(true);
    let treeToLoad = initialOrgTree;
    try {
      const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
      const savedSettings = localStorage.getItem(CONTRACT_SETTINGS_STORAGE_KEY);
      
      if (savedTree) {
        let parsedTree = JSON.parse(savedTree);
        treeToLoad = parsedTree;
      }

      if (savedSettings) {
        setContractSettings(JSON.parse(savedSettings));
      }

    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
    setTree(treeToLoad);
  }, []);

  useEffect(() => {
    if (isClient && tree) {
        try {
          localStorage.setItem(ORG_CHART_STORAGE_KEY, JSON.stringify(tree));
        } catch (error) {
          console.error("Failed to save org chart to localStorage", error);
        }
    }
  }, [tree, isClient]);

   useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(CONTRACT_SETTINGS_STORAGE_KEY, JSON.stringify(contractSettings));
      } catch (error) {
        console.error("Failed to save contract settings to localStorage", error);
      }
    }
  }, [contractSettings, isClient]);

  const syncContractList = (newContractName: string, supervisorNode: OrgNode) => {
    if (!newContractName || supervisorNode.role !== 'Supervisor') return;

    try {
        const savedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
        const contracts: Contract[] = savedContracts ? JSON.parse(savedContracts) : [];

        // Check if contract with the same name already exists
        if (!contracts.some(c => c.name === newContractName)) {
            const newContract: Contract = {
                id: `contract-${Date.now()}`,
                name: newContractName,
                supervisorId: supervisorNode.id,
                supervisorName: supervisorNode.name,
                address: "Não definido",
                region: "Não definida",
                backgroundImage: `https://picsum.photos/600/400?random=${Math.random()}`
            };
            const updatedContracts = [...contracts, newContract];
            localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updatedContracts));
        }
    } catch (error) {
        console.error("Failed to sync contract list", error);
    }
  };


  const handleUpdateNode = (nodeId: string, values: Partial<OrgNode>) => {
    if (!tree) return;
    let parentNode: OrgNode | null = null;
    
    // Find parent to sync contract
    updateTree(tree, (node) => {
        if(node.children?.some(c => c.id === nodeId)) {
            parentNode = node;
        }
        return node;
    });

    const newTree = updateTree(tree, (node) => {
      if (node.id === nodeId) {
        // If a new avatar data URL is passed, save it separately
        if (values.avatar && values.avatar.startsWith('data:image')) {
            saveAvatar(nodeId, values.avatar);
        }
        return { ...node, ...values };
      }
      return node;
    });

    setTree(newTree);

    if (values.contract && parentNode) {
        syncContractList(values.contract, parentNode);
    }
  };

  const handleToggleVisibility = (nodeId: string) => {
    if (!tree) return;
    const newTree = updateTree(tree, (node) => {
      if (node.id === nodeId) {
        return { ...node, showInNeuralNet: node.showInNeuralNet === false };
      }
      return node;
    });
    setTree(newTree);
  };


  const handleAddChildNode = (parentId: string, child: Omit<OrgNode, 'children' | 'id'>) => {
    if (!tree) return;

    let parentNode: OrgNode | null = null;
    
    const newTree = updateTree(tree, (node) => {
      if (node.id === parentId) {
        parentNode = node;
        const newNodeId = `node-${Date.now()}-${Math.random()}`;
        const newNode: OrgNode = {
          ...child,
          id: newNodeId,
          children: [],
          showInNeuralNet: true,
        };
        // If a new avatar data URL is passed, save it separately
        if (newNode.avatar && newNode.avatar.startsWith('data:image')) {
            saveAvatar(newNodeId, newNode.avatar);
        }
        return { ...node, children: [...(node.children || []), newNode] };
      }
      return node;
    });

    setTree(newTree);

    if(child.contract && parentNode) {
        syncContractList(child.contract, parentNode);
    }
  };

  const handleRemoveNode = (nodeId: string) => {
    if (!tree) return;
    
    if (nodeId === tree.id) {
       setTree(null);
       localStorage.removeItem(ORG_CHART_STORAGE_KEY);
       setTimeout(() => setTree(initialOrgTree), 0);
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

  const handleMoveNode = (draggedNodeId: string, targetNodeId: string) => {
    if (!tree || draggedNodeId === targetNodeId) return;

    let draggedNode: OrgNode | null = null;
    let newTree = { ...tree };

    // Find and remove the dragged node from its original parent
    newTree = updateTree(newTree, (node) => {
      if (node.children) {
        const childIndex = node.children.findIndex(c => c.id === draggedNodeId);
        if (childIndex > -1) {
          draggedNode = node.children[childIndex];
          node.children.splice(childIndex, 1);
        }
      }
      return node;
    });

    if (!draggedNode) return;

    // Add the dragged node to the target node's children
    newTree = updateTree(newTree, (node) => {
      if (node.id === targetNodeId) {
        return { ...node, children: [...(node.children || []), draggedNode!] };
      }
      return node;
    });
    
    setTree(newTree);
  };

  
  const handleSaveSettings = (newSettings: ContractSettings) => {
    setContractSettings(newSettings);
    setIsSettingsModalOpen(false);
  };

  const handleNodeContractSettingsChange = (newSettings: any) => {
    if(nodeContractSettings) {
        // @ts-ignore
        handleUpdateNode(nodeContractSettings.id, { contractSettings: newSettings})
    }
    setNodeContractSettings(null);
  }

  const handleOpenTicketModal = (node: OrgNode) => {
    setTicketNode(node);
    setIsTicketModalOpen(true);
  };

  const handleSaveTicket = (ticketData: Omit<Message, 'id' | 'createdAt' | 'author'>) => {
    if (!ticketNode) return;

    const newTicket: Message = {
      ...ticketData,
      id: `ticket-${Date.now()}`,
      author: ticketNode.name, 
      createdAt: new Date().toISOString(),
    };

    const existingMessages: Message[] = JSON.parse(localStorage.getItem(DASHBOARD_MESSAGES_KEY) || '[]');
    localStorage.setItem(DASHBOARD_MESSAGES_KEY, JSON.stringify([newTicket, ...existingMessages]));
    
    setIsTicketModalOpen(false);
    setTicketNode(null);
  };


  if (!isClient || !tree) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center pb-4 border-b gap-4">
        <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Organograma</h1>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSettingsModalOpen(true)}>
                <Settings className="h-5 w-5" />
            </Button>
        </div>
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
        className="flex-grow overflow-auto p-4 rounded-lg mt-4"
        style={{ backgroundImage: `url('${contractSettings.backgroundImage}')` }}
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
            onMoveNode={handleMoveNode}
            onContractSettingsChange={handleSaveSettings}
            onOpenTicketModal={handleOpenTicketModal}
            onToggleVisibility={handleToggleVisibility}
            contractSettings={contractSettings}
            isRoot={true}
          />
        </div>
      </div>
       <ContractSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveSettings}
        settings={contractSettings}
      />
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSave={handleSaveTicket}
        node={ticketNode}
      />
    </div>
  );
}
