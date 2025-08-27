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
        // We don't want to add the root node as an employee
        if (node.id !== 'arpolar') {
            employees.push({
                id: node.id,
                name: node.name,
                role: node.role,
                email: node.contact || '', // Assuming contact is email for now
                phone: node.contact || '',
                supervisorId: supervisorId || '',
                contract: node.contract || '',
                avatar: node.avatar
            });
        }
        
        if (node.children) {
            node.children.forEach(child => traverse(child, node.id));
        }
    }

    traverse(root);
    return employees;
}
