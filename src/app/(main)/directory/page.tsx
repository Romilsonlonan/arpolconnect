'use client';

import { useState } from 'react';
import { employees as allEmployees, supervisors, type Employee, type Supervisor } from '@/lib/data';
import { EmployeeCard } from '@/components/directory/employee-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type GroupedEmployees = {
  [key: string]: Employee[];
};

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>(allEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const handleRemoveEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const filteredEmployees = employees.filter(employee => {
    const supervisor = supervisors.find(s => s.id === employee.supervisorId);
    const regionMatch = selectedRegion === 'all' || supervisor?.region === selectedRegion;
    const searchMatch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        employee.contract.toLowerCase().includes(searchTerm.toLowerCase());
    return regionMatch && searchMatch;
  });

  const groupedBySupervisor = filteredEmployees.reduce((acc: GroupedEmployees, employee) => {
    const supervisorName = supervisors.find(s => s.id === employee.supervisorId)?.name || 'Unassigned';
    if (!acc[supervisorName]) {
      acc[supervisorName] = [];
    }
    acc[supervisorName].push(employee);
    return acc;
  }, {});

  const regions = [...new Set(supervisors.map(s => s.region).filter(Boolean))] as string[];

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

// Dummy Card component to avoid breaking the code.
const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);
