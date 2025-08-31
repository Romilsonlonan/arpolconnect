
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
        root.children.forEach(supervisorNode => {
           // We need to traverse both the supervisor node itself (as it might have children)
           // and its children. The supervisor nodes themselves are not "employees" in this flattened list.
           if(supervisorNode.children) {
                supervisorNode.children.forEach(employeeNode => traverse(employeeNode, supervisorNode.id))
           }
        });
    }
    
    // A separate traversal to get employees of supervisors
    const supervisors: OrgNode[] = [];
    updateTree(root, (node) => {
        if (['Supervisor', 'Gerente', 'Coordenador', 'Diretor'].includes(node.role)) {
            supervisors.push(node);
        }
        return node;
    });

    for (const supervisor of supervisors) {
        if (supervisor.children) {
            for (const employeeNode of supervisor.children) {
                 if (!employees.some(e => e.id === employeeNode.id)) {
                    employees.push({
                        id: employeeNode.id,
                        name: employeeNode.name,
                        role: employeeNode.role,
                        email: employeeNode.contact || `${employeeNode.name.toLowerCase().replace(/\s/g, '.')}@arpolar.com`,
                        phone: employeeNode.contact || '',
                        supervisorId: supervisor.id,
                        contract: employeeNode.contract || '',
                        avatar: employeeNode.avatar || ''
                    });
                }
            }
        }
    }


    return employees;
}

export function removeNodeFromTree(tree: OrgNode, nodeId: string): OrgNode {
  // If the root is the one to be removed, handle it (though unlikely in this app's context)
  if (tree.id === nodeId) {
    // Cannot remove the root, perhaps return an empty structure or throw error
    // For now, we'll assume root is not removable this way.
    return tree;
  }
  
  const newTree = { ...tree };

  if (newTree.children) {
    // Filter out the node to be removed from the direct children
    newTree.children = newTree.children.filter(child => child.id !== nodeId);
    // Recursively call on the remaining children
    newTree.children = newTree.children.map(child => removeNodeFromTree(child, nodeId));
  }

  return newTree;
}
