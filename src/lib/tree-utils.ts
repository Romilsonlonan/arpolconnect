
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
    // We consider any node that is not the root and has a supervisor as an employee.
    // We also exclude 'Contrato' nodes from being listed as employees.
    if (supervisorId && node.id !== 'arpolar' && node.role !== 'Contrato') {
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

    // Recursively traverse children, passing the current node's ID as the new supervisorId.
    if (node.children) {
      node.children.forEach(child => traverse(child, node.id));
    }
  }

  // Start traversal from the root node.
  traverse(root);
  
  // The initial call to traverse with just `root` will handle all nodes recursively.
  // We remove the root company node itself from the list if it gets added.
  return employees.filter(emp => emp.id !== 'arpolar');
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
