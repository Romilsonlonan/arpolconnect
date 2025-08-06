'use client';

import type { Employee, Supervisor } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Briefcase, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function EmployeeCard({ employee, supervisors, onRemove }: { employee: Employee; supervisors: Supervisor[]; onRemove: (id: string) => void; }) {
  const { toast } = useToast();

  const handleReassign = () => {
    toast({
      title: "Employee Reassigned",
      description: `${employee.name} has been successfully reassigned.`,
    })
  }
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={employee.avatar} data-ai-hint="person portrait" />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-lg">{employee.name}</h4>
            <p className="text-sm text-muted-foreground">{employee.role}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm flex-grow">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <a href={`mailto:${employee.email}`} className="hover:underline break-all">{employee.email}</a>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span>{employee.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span>{employee.contract}</span>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">Reatribuir</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reatribuir Funcionário</DialogTitle>
              <DialogDescription>
                Selecione um novo supervisor para {employee.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors
                    .filter(s => s.id !== employee.supervisorId)
                    .map(supervisor => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <DialogClose asChild>
                 <Button type="submit" onClick={handleReassign}>Confirmar Reatribuição</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Remover
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso removerá permanentemente o
                funcionário de seus registros.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onRemove(employee.id)}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
