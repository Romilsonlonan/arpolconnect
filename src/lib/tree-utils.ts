
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
    avatar: 'https://i.ibb.co/zVzbGGgD/fundoaqc.jpg',
    showInNeuralNet: false,
    children: [],
  };

  const nodeMap: Map<string, OrgNode> = new Map();
  const childrenMap: Map<string, (OrgNode | Contract)[]> = new Map();

  // Initialize maps
  childrenMap.set(root.id, []);

  // Process users
  users.forEach(user => {
    const userNode: OrgNode = {
      id: user.id,
      name: user.name,
      role: user.role,
      contact: user.email,
      avatar: '', // Will be handled by getAvatar
      showInNeuralNet: user.role === 'Supervisor' || user.role === 'Administrador',
      children: []
    };
    nodeMap.set(user.id, userNode);
    // This logic is simplified; real app would need a supervisor field in User model
    // For now, let's assume all non-admins report to the root admin
    const supervisorId = user.role !== 'Administrador' ? users.find(u=>u.role === 'Administrador')?.id || root.id : root.id;
    if (!childrenMap.has(supervisorId)) {
        childrenMap.set(supervisorId, []);
    }
    childrenMap.get(supervisorId)!.push(userNode);
  });

  // Process contracts
  contracts.forEach(contract => {
    const contractNode: OrgNode = {
        id: contract.id,
        name: contract.name,
        role: 'Contrato',
        avatar: contract.backgroundImage,
        showInNeuralNet: false,
        children: [],
    };
    if (!childrenMap.has(contract.supervisorId)) {
        childrenMap.set(contract.supervisorId, []);
    }
    childrenMap.get(contract.supervisorId)!.push(contractNode);
  });
  
  // Build the tree structure from the root down
  const queue: OrgNode[] = [root];
  while(queue.length > 0) {
      const currentNode = queue.shift();
      if (currentNode) {
          const children = childrenMap.get(currentNode.id);
          if (children) {
            // @ts-ignore
            currentNode.children = children.map(child => {
                const childNode = nodeMap.get(child.id) || child;
                queue.push(childNode as OrgNode);
                return childNode;
            });
          }
      }
  }

  return root;
}
