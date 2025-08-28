import type { OrgNode, Employee } from './data';

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

    // This function will find all nodes that are not the root and are not direct children of the root.
    // In our structure, this means they are employees under a supervisor/director.
    function traverse(node: OrgNode, supervisorId?: string) {
        // Only add nodes that have a supervisorId, meaning they are not the top-level directors/supervisors
        if (supervisorId && node.id !== 'arpolar') {
            employees.push({
                id: node.id,
                name: node.name,
                // @ts-ignore
                role: node.role,
                // @ts-ignore
                email: node.contact || `${node.name.toLowerCase().split(' ').join('.')}@arpolar.com`,
                phone: node.contact || '',
                supervisorId: supervisorId,
                contract: node.contract || '',
                avatar: node.avatar || ''
            });
        }
        
        if (node.children) {
            // The new supervisorId for the next level is the current node's id
            node.children.forEach(child => traverse(child, node.id));
        }
    }

    // Start traversal from the children of the root, as they are the supervisors
    if (root.children) {
        root.children.forEach(supervisorNode => traverse(supervisorNode, root.id));
    }
    
    return employees;
}
