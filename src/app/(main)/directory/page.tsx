
'use client';

import { useState, useEffect } from 'react';
import { type Employee, type Supervisor, initialOrgTree, type OrgNode } from '@/lib/data';
import { flattenTreeToEmployees, updateTree, findNode, removeNodeFromTree } from '@/lib/tree-utils';
import { EmployeeCard } from '@/components/directory/employee-card';
import { EmployeeModal } from '@/components/organization/employee-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { saveAvatar, removeAvatar } from '@/lib/avatar-storage';

type GroupedEmployees = {
  supervisorId: string;
  supervisorName: string;
  employees: Employee[];
};

const ORG_CHART_STORAGE_KEY = 'orgChartTree';

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [supervisorsData, setSupervisorsData] = useState<Supervisor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isClient, setIsClient] = useState(false);
  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<OrgNode | null>(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const { toast } = useToast();

  const loadData = () => {
    const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
    const orgTree = savedTree ? JSON.parse(savedTree) : initialOrgTree;
    const allEmployees = flattenTreeToEmployees(orgTree);
    
    // Find all nodes with the role of 'Supervisor' or roles that manage others
    const supervisorNodes: OrgNode[] = [];
    updateTree(orgTree, (node) => {
        // Assuming supervisors can be at different levels
        if (['Supervisor', 'Gerente', 'Coordenador', 'Diretor'].includes(node.role)) {
            supervisorNodes.push(node);
        }
        return node;
    });

    const supData = supervisorNodes.map((node: OrgNode) => ({
      id: node.id,
      name: node.name,
      email: node.contact || '',
      avatar: node.avatar,
      region: 'N/A' 
    }));

    setEmployees(allEmployees);
    setSupervisorsData(supData);
  };
  
  useEffect(() => {
    setIsClient(true);
    loadData();

    const handleStorageChange = () => loadData();

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSaveEmployee = (values: Omit<OrgNode, 'id' | 'children'>, supervisorId?: string) => {
     const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
     let orgTree = savedTree ? JSON.parse(savedTree) : initialOrgTree;

     let newTree: OrgNode;
     let toastTitle = '';
     let toastDescription = '';

     if (editingEmployee) {
        // --- Editing existing employee ---
        newTree = updateTree(orgTree, (node) => {
            if (node.id === editingEmployee.id) {
                if (values.avatar && values.avatar.startsWith('data:image')) {
                    saveAvatar(editingEmployee.id, values.avatar);
                    values.avatar = `avatar:${editingEmployee.id}`;
                }
                return { ...node, ...values };
            }
            return node;
        });
        toastTitle = "Funcionário Atualizado!";
        toastDescription = `${values.name} foi atualizado com sucesso.`;
        setEditingEmployee(null);

     } else {
        // --- Adding new employee ---
        if (!supervisorId) {
            toast({ title: "Supervisor não selecionado", description: "Por favor, selecione um supervisor.", variant: "destructive" });
            return;
        }
        newTree = updateTree(orgTree, (node) => {
            if (node.id === supervisorId) {
                const newNodeId = `node-${Date.now()}-${Math.random()}`;
                const newNode: OrgNode = {
                    ...values,
                    id: newNodeId,
                    children: [],
                    showInNeuralNet: true,
                };
                if (newNode.avatar && newNode.avatar.startsWith('data:image')) {
                    saveAvatar(newNodeId, newNode.avatar);
                    newNode.avatar = `avatar:${newNodeId}`;
                }
                return { ...node, children: [...(node.children || []), newNode] };
            }
            return node;
        });
        toastTitle = "Funcionário Adicionado!";
        toastDescription = `${values.name} foi adicionado à equipe de ${supervisorsData.find(s => s.id === supervisorId)?.name}.`;
     }

    localStorage.setItem(ORG_CHART_STORAGE_KEY, JSON.stringify(newTree));
    loadData(); // Reload data to reflect changes
    setIsModalOpen(false); // Close modal on save
    setSelectedSupervisorId(''); // Reset selection
    toast({ title: toastTitle, description: toastDescription });
  };
  
  const handleDeleteEmployee = (employeeId: string) => {
    const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
    let orgTree = savedTree ? JSON.parse(savedTree) : initialOrgTree;
    
    const employeeToDelete = employees.find(e => e.id === employeeId);

    const newTree = removeNodeFromTree(orgTree, employeeId);

    localStorage.setItem(ORG_CHART_STORAGE_KEY, JSON.stringify(newTree));
    removeAvatar(employeeId); // Also remove avatar from storage
    loadData(); // Reload data
    
    toast({
        title: "Funcionário Removido",
        description: `${employeeToDelete?.name || 'O funcionário'} foi removido do sistema.`
    });
  }

  const handleOpenEditModal = (employee: Employee) => {
      const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
      const orgTree = savedTree ? JSON.parse(savedTree) : initialOrgTree;
      const nodeToEdit = findNode(orgTree, employee.id);
      if (nodeToEdit) {
        setEditingEmployee(nodeToEdit);
        setIsModalOpen(true);
      } else {
        toast({ title: "Erro", description: "Não foi possível encontrar os dados do funcionário para edição.", variant: "destructive" });
      }
  };


  const handleDrop = (targetSupervisorId: string) => {
    if (!draggedEmployeeId || !targetSupervisorId || draggedEmployeeId === targetSupervisorId) {
      setDropTargetId(null);
      return;
    }

    const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
    let orgTree = savedTree ? JSON.parse(savedTree) : initialOrgTree;

    let employeeNode: OrgNode | null = null;
    let oldParent: OrgNode | null = null;
    let newParent: OrgNode | null = findNode(orgTree, targetSupervisorId);
    
    // Find the node and its parent
    updateTree(orgTree, (node) => {
      if (node.children) {
        const childIndex = node.children.findIndex(c => c.id === draggedEmployeeId);
        if (childIndex > -1) {
          employeeNode = node.children[childIndex];
          oldParent = node;
        }
      }
      return node;
    });

    if (employeeNode && oldParent && newParent && oldParent.id !== newParent.id) {
       // 1. Remove from old parent
       oldParent.children = (oldParent.children || []).filter(c => c.id !== draggedEmployeeId);
       
       // 2. Add to new parent
       newParent.children = [...(newParent.children || []), employeeNode];
       
       // 3. Save the updated tree
       localStorage.setItem(ORG_CHART_STORAGE_KEY, JSON.stringify(orgTree));

       const employeeName = employeeNode.name;
       const newSupervisorName = newParent.name;
       
       toast({
         title: "Funcionário Reatribuído",
         description: `${employeeName} foi movido para a equipe de ${newSupervisorName}.`
       });

       // 4. Reload data on page
       loadData();
    }
    
    setDraggedEmployeeId(null);
    setDropTargetId(null);
  };


  const filteredEmployees = employees.filter(employee => {
    const supervisor = supervisorsData.find(s => s.id === employee.supervisorId);
    const regionMatch = selectedRegion === 'all' // || supervisor?.region === selectedRegion;
    const searchMatch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (employee.role && employee.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (employee.contract && employee.contract.toLowerCase().includes(searchTerm.toLowerCase()));
    return regionMatch && searchMatch;
  });

  const groupedBySupervisor: GroupedEmployees[] = supervisorsData
    .map(supervisor => ({
        supervisorId: supervisor.id,
        supervisorName: supervisor.name,
        employees: filteredEmployees.filter(emp => emp.supervisorId === supervisor.id)
    }))
    .filter(group => group.employees.length > 0);

  const regions = [...new Set(supervisorsData.map(s => s.region).filter(Boolean))] as string[];

  if (!isClient) {
      return null;
  }

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Diretório de Funcionários</h1>
        <p className="text-muted-foreground">Encontre, gerencie, adicione e reatribua os funcionários da sua equipe.</p>
       </div>
      
       <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <Input
            placeholder="Pesquisar por nome, cargo, contrato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm"
            />
            <Select value={selectedRegion} onValueChange={setSelectedRegion} disabled>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por região" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todas as Regiões</SelectItem>
                {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
            </SelectContent>
            </Select>
            <Button onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }} className="w-full sm:w-auto">
              <PlusCircle className="mr-2"/>
              Adicionar Funcionário
            </Button>
        </div>
       </Card>

      {groupedBySupervisor.map(({ supervisorId, supervisorName, employees: employeeList }) => (
        <div 
          key={supervisorId}
          onDragOver={(e) => {
            e.preventDefault();
            setDropTargetId(supervisorId);
          }}
          onDragLeave={() => setDropTargetId(null)}
          onDrop={() => handleDrop(supervisorId)}
          className={cn(
            "p-4 rounded-lg transition-colors duration-300",
            dropTargetId === supervisorId ? 'bg-accent/80' : 'bg-transparent'
          )}
        >
          <h2 className="text-xl font-semibold mb-4">{supervisorName}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {employeeList.map(employee => (
              <div 
                key={employee.id}
                draggable
                onDragStart={() => setDraggedEmployeeId(employee.id)}
                onDragEnd={() => setDraggedEmployeeId(null)}
                className="cursor-move"
              >
                <EmployeeCard
                  employee={employee}
                  onEdit={() => handleOpenEditModal(employee)}
                  onDelete={() => handleDeleteEmployee(employee.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredEmployees.length === 0 && (
         <div className="flex flex-col items-center justify-center flex-1 py-12 text-center bg-gray-100/50 rounded-lg">
            <p className="text-lg font-semibold text-muted-foreground">Nenhum funcionário encontrado.</p>
            <p className="mt-2 text-sm text-muted-foreground">Ajuste os filtros ou adicione novos funcionários.</p>
        </div>
      )}

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEmployee(null); }}
        onSave={(values) => {
           editingEmployee 
                ? handleSaveEmployee(values)
                : handleSaveEmployee(values, selectedSupervisorId);
        }}
        editingNode={editingEmployee}
        supervisors={supervisorsData}
        selectedSupervisor={selectedSupervisorId}
        onSupervisorChange={setSelectedSupervisorId}
      />
    </div>
  );
}
