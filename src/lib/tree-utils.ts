

import type { OrgNode, Employee, User, Contract } from './data';

export function findNode(tree: OrgNode, nodeId: string): OrgNode | null {
  if (tree.id === nodeId) {
    return tree;
  }
  if (tree.children) {
    for (const child of tree.children) {
      const found = findNode(child, nodeId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function updateTree(tree: OrgNode, updateFn: (node: OrgNode) => OrgNode): OrgNode {
  const updatedNode = updateFn({ ...tree });

  if (updatedNode.children) {
    updatedNode.children = updatedNode.children.map(child => updateTree(child, updateFn));
  }

  return updatedNode;
}


export function flattenTreeToEmployees(root: OrgNode): Employee[] {
  const employees: Employee[] = [];

  function traverse(node: OrgNode, supervisorId?: string) {
    if (supervisorId && node.role !== 'Contrato' && node.id !== 'arpolar') {
       employees.push({
        id: node.id,
        name: node.name,
        // @ts-ignore
        role: node.role,
        email: node.contact || `${node.name.toLowerCase().replace(/\s/g, '.')}@arpolar.com`,
        phone: node.contact || '',
        supervisorId: supervisorId,
        contract: node.contract || 'N/A',
        avatar: node.avatar || '',
      });
    }

    if (node.children) {
      node.children.forEach(child => traverse(child, node.id));
    }
  }

  root.children?.forEach(child => traverse(child, root.id));
  
  return employees;
}


export function removeNodeFromTree(tree: OrgNode, nodeId: string): OrgNode {
  if (tree.id === nodeId) {
    return tree;
  }
  
  const newTree = { ...tree };

  if (newTree.children) {
    newTree.children = newTree.children.filter(child => child.id !== nodeId);
    newTree.children = newTree.children.map(child => removeNodeFromTree(child, nodeId));
  }

  return newTree;
}

export function getAllNodes(tree: OrgNode): OrgNode[] {
  const nodes: OrgNode[] = [];

  function traverse(node: OrgNode) {
    nodes.push(node);
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(tree);
  return nodes;
}

export function buildTreeFromUsersAndContracts(users: User[], contracts: Contract[]): OrgNode {
  const root: OrgNode = {
    id: 'arpolar',
    name: 'Arpolar',
    role: 'Empresa',
    avatar: 'https://i.ibb.co/JR7Drmjj/aqc.png',
    showInNeuralNet: false,
    children: [],
  };

  const nodeMap: Map<string, OrgNode> = new Map();
  const childrenMap: Map<string, (OrgNode | Contract)[]> = new Map();

  // Initialize maps
  nodeMap.set(root.id, root);
  childrenMap.set(root.id, []);

  // Process users
  const activeUsers = users.filter(u => u.status === 'Ativo');
  activeUsers.forEach(user => {
    const userNode: OrgNode = {
      id: user.id,
      name: user.name,
      role: user.role,
      contact: user.email,
      avatar: '', // Will be handled by getAvatar
      showInNeuralNet: user.showInReports,
      children: []
    };
    nodeMap.set(user.id, userNode);

    const parentId = user.supervisorId || root.id;
    if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(userNode);
  });

  // Process contracts
  const activeContracts = contracts.filter(c => c.status === 'Ativo');
  activeContracts.forEach(contract => {
    const contractNode: OrgNode = {
        id: contract.id,
        name: contract.name,
        role: 'Contrato',
        avatar: contract.backgroundImage,
        showInNeuralNet: false,
        children: [],
    };
    const parentId = contract.supervisorId;
    if (childrenMap.has(parentId)) {
      childrenMap.get(parentId)!.push(contractNode);
    } else {
      // If supervisor is inactive or doesn't exist, attach to root
       if (!childrenMap.has(root.id)) childrenMap.set(root.id, []);
       childrenMap.get(root.id)!.push(contractNode);
    }
  });
  
  // Build the tree structure from the root down
  const queue: OrgNode[] = [root];
  while(queue.length > 0) {
      const currentNode = queue.shift();
      if (currentNode) {
          const childrenData = childrenMap.get(currentNode.id);
          if (childrenData) {
            // @ts-ignore
            const childNodes = childrenData.map(childData => {
              if (nodeMap.has(childData.id)) {
                return nodeMap.get(childData.id)!;
              }
              // This handles contract nodes which aren't in the user-based nodeMap
              return childData as OrgNode;
            });
            
            currentNode.children = childNodes;
            queue.push(...childNodes.filter(n => n.role !== 'Contrato')); // Don't traverse into contract children
          }
      }
  }

  return root;
}
