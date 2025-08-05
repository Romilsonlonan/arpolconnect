'use client';

import { useState } from 'react';
import type { Employee, Supervisor } from '@/lib/data';
import { employees as allEmployees, supervisors as allSupervisors } from '@/lib/data';
import { EmployeeCard } from '@/components/directory/employee-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

function SupervisorSection({ supervisor, employees, allSupervisors, onRemoveEmployee }: { supervisor: Supervisor; employees: Employee[], allSupervisors: Supervisor[], onRemoveEmployee: (id: string) => void }) {
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
          <EmployeeCard key={employee.id} employee={employee} supervisors={allSupervisors} onRemove={onRemoveEmployee} />
        ))}
      </div>
    </div>
  );
}

function AddEmployeeDialog({ supervisors, onAddEmployee }: { supervisors: Supervisor[], onAddEmployee: (employee: Employee) => void }) {
    const [name, setName] = useState('');
    const [role, setRole] = useState<Employee['role']>('Mechanic');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [contract, setContract] = useState('');
    const [supervisorId, setSupervisorId] = useState('');
    const [avatar, setAvatar] = useState('https://placehold.co/100x100');
    const { toast } = useToast();

    const handleAddEmployee = () => {
        if (!name || !role || !email || !phone || !contract || !supervisorId) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Por favor, preencha todos os campos.',
            });
            return;
        }

        const newEmployee: Employee = {
            id: `emp${Date.now()}`,
            name,
            role,
            email,
            phone,
            contract,
            supervisorId,
            avatar,
        };
        onAddEmployee(newEmployee);
        toast({
            title: 'Funcionário Adicionado',
            description: `${name} foi adicionado com sucesso.`,
        });

        // Reset form
        setName('');
        setRole('Mechanic');
        setEmail('');
        setPhone('');
        setContract('');
        setSupervisorId('');
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Adicionar Funcionário
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Funcionário</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes abaixo para adicionar um novo funcionário.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nome</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Função</Label>
                        <Select onValueChange={(value: Employee['role']) => setRole(value)} value={role}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione a função" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Mechanic">Mechanic</SelectItem>
                                <SelectItem value="Electrician">Electrician</SelectItem>
                                <SelectItem value="Assistant">Assistant</SelectItem>
                                <SelectItem value="Artificer">Artificer</SelectItem>
                                <SelectItem value="Half-Official">Half-Official</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Telefone</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contract" className="text-right">Contrato</Label>
                        <Input id="contract" value={contract} onChange={(e) => setContract(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supervisor" className="text-right">Supervisor</Label>
                        <Select onValueChange={setSupervisorId} value={supervisorId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione um supervisor" />
                            </SelectTrigger>
                            <SelectContent>
                                {supervisors.map(supervisor => (
                                    <SelectItem key={supervisor.id} value={supervisor.id}>
                                        {supervisor.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="submit" onClick={handleAddEmployee}>Salvar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function DirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>(allEmployees);
  const [supervisors] = useState<Supervisor[]>(allSupervisors);
  const { toast } = useToast();

  const handleAddEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  };

  const handleRemoveEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast({
      title: "Funcionário Removido",
      description: "O funcionário foi removido do diretório.",
      variant: "destructive"
    })
  }

  return (
    <>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Diretório de Funcionários</h1>
        <div className="ml-auto">
            <AddEmployeeDialog supervisors={supervisors} onAddEmployee={handleAddEmployee} />
        </div>
      </div>
      <div className="space-y-6">
        {supervisors.map(supervisor => (
          <SupervisorSection
            key={supervisor.id}
            supervisor={supervisor}
            employees={employees.filter(e => e.supervisorId === supervisor.id)}
            allSupervisors={supervisors}
            onRemoveEmployee={handleRemoveEmployee}
          />
        ))}
      </div>
    </>
  );
}
