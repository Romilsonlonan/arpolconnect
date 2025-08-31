
'use client';

import { useState, useEffect } from 'react';
import type { Employee } from '@/lib/data';
import { getAvatar } from '@/lib/avatar-storage';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Briefcase, Trash2, Pencil } from 'lucide-react';
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

const AVATAR_STORAGE_PREFIX = 'avatar_';

function EmployeeAvatar({ employee }: { employee: Employee }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const updateAvatar = () => {
            const url = getAvatar(employee.id);
            setAvatarUrl(url);
        };

        updateAvatar(); // Initial load

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === `${AVATAR_STORAGE_PREFIX}${employee.id}`) {
                updateAvatar();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [employee.id]);

    const finalAvatarUrl = avatarUrl || employee.avatar;

    return (
        <Avatar className="w-16 h-16">
            <AvatarImage src={finalAvatarUrl ?? undefined} data-ai-hint="person portrait" draggable="false" />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
        </Avatar>
    );
}

export function EmployeeCard({ 
    employee, 
    onEdit, 
    onDelete 
}: { 
    employee: Employee; 
    onEdit: () => void; 
    onDelete: () => void;
}) {
  return (
    <Card className="flex flex-col h-full bg-card transition-transform duration-300 hover:scale-105 relative group">
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" className="h-7 w-7">
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso removerá permanentemente o funcionário.
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>
                      Continuar
                  </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
           </AlertDialog>
      </div>
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
