'use client';

import { useState, useEffect } from 'react';
import { supervisors, type Employee, type Supervisor, initialOrgTree, type OrgNode } from '@/lib/data';
import { flattenTreeToEmployees } from '@/lib/tree-utils';
import { EmployeeCard } from '@/components/directory/employee-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

type GroupedEmployees = {
  [key: string]: Employee[];
};

const ORG_CHART_STORAGE_KEY = 'orgChartTree';

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const savedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
    const orgTree = savedTree ? JSON.parse(savedTree) : initialOrgTree;
    const allEmployees = flattenTreeToEmployees(orgTree);
    
    setEmployees(allEmployees);

    const handleStorageChange = () => {
        const updatedSavedTree = localStorage.getItem(ORG_CHART_STORAGE_KEY);
        const updatedOrgTree = updatedSavedTree ? JSON.parse(updatedSavedTree) : initialOrgTree;
        setEmployees(flattenTreeToEmployees(updatedOrgTree));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleRemoveEmployee = (id: string) => {
    // This function might need to be updated to modify the main org tree
    // For now, it only affects the local state of this page.
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const filteredEmployees = employees.filter(employee => {
    const supervisor = supervisors.find(s => s.id === employee.supervisorId);
    const regionMatch = selectedRegion === 'all' || supervisor?.region === selectedRegion;
    const searchMatch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (employee.role && employee.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (employee.contract && employee.contract.toLowerCase().includes(searchTerm.toLowerCase()));
    return regionMatch && searchMatch;
  });

  const groupedBySupervisor = filteredEmployees.reduce((acc: GroupedEmployees, employee) => {
    // This logic might need adjustment if supervisor data is also in the tree
    const supervisorName = supervisors.find(s => s.id === employee.supervisorId)?.name || 'Unassigned';
    if (!acc[supervisorName]) {
      acc[supervisorName] = [];
    }
    acc[supervisorName].push(employee);
    return acc;
  }, {});

  const regions = [...new Set(supervisors.map(s => s.region).filter(Boolean))] as string[];

  if (!isClient) {
      return null;
  }

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Diretório de Funcionários</h1>
        <p className="text-muted-foreground">Encontre e gerencie os funcionários da sua equipe.</p>
       </div>
      
       <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <Input
            placeholder="Pesquisar por nome, cargo, contrato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm"
            />
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
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
        </div>
       </Card>

      {Object.entries(groupedBySupervisor).map(([supervisorName, employeeList]) => (
        <div key={supervisorName}>
          <h2 className="text-xl font-semibold mb-4">{supervisorName}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {employeeList.map(employee => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                supervisors={supervisors}
                onRemove={handleRemoveEmployee}
              />
            ))}
          </div>
        </div>
      ))}

      {filteredEmployees.length === 0 && (
         <div className="flex flex-col items-center justify-center flex-1 py-12 text-center bg-gray-100/50 rounded-lg">
            <p className="text-lg font-semibold text-muted-foreground">Nenhum funcionário encontrado.</p>
            <p className="mt-2 text-sm text-muted-foreground">Ajuste os filtros ou adicione novos funcionários no organograma.</p>
        </div>
      )}
    </div>
  );
}
