'use client';

import { useState, useEffect } from 'react';
import type { Employee, Supervisor } from '@/lib/data';
import { getAvatar } from '@/lib/avatar-storage';
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

function EmployeeAvatar({ employee }: { employee: Employee }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        // Fetch avatar from localStorage on the client
        const url = getAvatar(employee.id);
        setAvatarUrl(url);
    }, [employee.id]);

    const finalAvatarUrl = avatarUrl || employee.avatar;

    return (
        <Avatar className="w-16 h-16">
            <AvatarImage src={finalAvatarUrl} data-ai-hint="person portrait" draggable="false" />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
        </Avatar>
    );
}

// The onRemove prop is no longer needed here as re-assignment is handled by drag-and-drop
// and removal should happen from the main organogram page.
export function EmployeeCard({ employee, supervisors }: { employee: Employee; supervisors: Supervisor[]; }) {
  const { toast } = useToast();

  const handleReassign = () => {
    toast({
      title: "Função Desativada",
      description: "Por favor, use o método de arrastar e soltar para reatribuir funcionários.",
    })
  }
  
  return (
    <Card className="flex flex-col bg-card transition-transform duration-300 hover:scale-105">
      <CardHeader>
        <div className="flex items-center gap-4">
          <EmployeeAvatar employee={employee} />
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
      <CardFooter>
         <p className="text-xs text-muted-foreground">Arraste para reatribuir a um novo supervisor.</p>
      </CardFooter>
    </Card>
  );
}
