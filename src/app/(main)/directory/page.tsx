'use client';

import { useState } from 'react';
import type { Employee, Supervisor } from '@/lib/data';
import { employees as allEmployees, supervisors as allSupervisors } from '@/lib/data';
import { EmployeeCard } from '@/components/directory/employee-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function SupervisorSection({ supervisor, employees, allSupervisors }: { supervisor: Supervisor; employees: Employee[], allSupervisors: Supervisor[] }) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4 mb-4">
        <Avatar>
          <AvatarImage src={supervisor.avatar} data-ai-hint="person portrait" />
          <AvatarFallback>{supervisor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg">{supervisor.name}</h3>
          <p className="text-sm text-muted-foreground">{supervisor.email}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map(employee => (
          <EmployeeCard key={employee.id} employee={employee} supervisors={allSupervisors} />
        ))}
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  const [employees] = useState<Employee[]>(allEmployees);
  const [supervisors] = useState<Supervisor[]>(allSupervisors);

  return (
    <>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Employee Directory</h1>
      </div>
      <div className="space-y-6">
        {supervisors.map(supervisor => (
          <SupervisorSection
            key={supervisor.id}
            supervisor={supervisor}
            employees={employees.filter(e => e.supervisorId === supervisor.id)}
            allSupervisors={supervisors}
          />
        ))}
      </div>
    </>
  );
}
