
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

  function traverse(node: OrgNode, supervisorId?: string) {
    // This is a valid employee if it's not a contract and has a supervisor
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

    // Recursively traverse children, passing the current node's ID as the supervisorId for them.
    if (node.children) {
      node.children.forEach(child => traverse(child, node.id));
    }
  }

  // Start the traversal from the root's children.
  // The root itself (Arpolar) is not an employee.
  root.children?.forEach(child => traverse(child, root.id));
  
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
