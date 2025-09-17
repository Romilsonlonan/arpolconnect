'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User, Contract } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { UserModal } from '@/components/admin/user-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getAvatar, removeAvatar, saveAvatar } from '@/lib/avatar-storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const USERS_STORAGE_KEY = 'arpolarUsers';
const CONTRACTS_STORAGE_KEY = 'arpolarContracts';

function UserAvatar({ user }: { user: User }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const updateAvatar = () => {
            const url = getAvatar(user.id);
            setAvatarUrl(url);
        };
        updateAvatar();
        window.addEventListener('storage', updateAvatar);
        return () => window.removeEventListener('storage', updateAvatar);
    }, [user.id]);

    return (
        <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
    );
}


export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const loadData = () => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const savedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
      
      setUsers(savedUsers ? JSON.parse(savedUsers) : []);
      setContracts(savedContracts ? JSON.parse(savedContracts) : []);
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData: Omit<User, 'id'>, id?: string, avatarDataUrl?: string) => {
    let currentUsers: User[] = [];
    try {
      currentUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
      currentUsers = [];
    }

    let updatedUsers: User[];
    let toastTitle = '';
    let toastDescription = '';
    let userId = id;

    if (userId) { // Editing user
      updatedUsers = currentUsers.map(u => u.id === userId ? { ...u, ...userData, id: userId } : u);
      toastTitle = "Usuário Atualizado!";
      toastDescription = `As informações de "${userData.name}" foram atualizadas.`;
    } else { // Adding new user
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`
      };
      userId = newUser.id;
      updatedUsers = [...currentUsers, newUser];
      toastTitle = "Usuário Adicionado!";
      toastDescription = `O usuário "${newUser.name}" foi criado com sucesso.`;
    }

    if (avatarDataUrl && avatarDataUrl.startsWith('data:image') && userId) {
        try {
            saveAvatar(userId, avatarDataUrl);
        } catch(e) {
             toast({
                title: "Erro ao salvar imagem",
                description: "A imagem é muito grande. Tente uma menor.",
                variant: 'destructive',
            });
        }
    }


    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', { key: USERS_STORAGE_KEY }));

    loadData();
    toast({ title: toastTitle, description: toastDescription });
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    removeAvatar(userId); // Also remove avatar
    
    loadData();
    toast({ title: "Usuário Removido", description: `${userToDelete.name} foi removido do sistema.` });
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Painel do Administrador</h1>
            <p className="text-muted-foreground">Gerencie usuários, permissões e configurações do sistema.</p>
        </div>
        <Button onClick={handleOpenAddModal}>
            <PlusCircle className="mr-2" />
            Adicionar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Visualize e edite os usuários e suas permissões de acesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                      <UserAvatar user={user}/>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                     <Badge variant={user.role === 'Administrador' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Ativo' ? 'default' : 'outline'} className={user.status === 'Ativo' ? 'bg-status-resolved' : ''}>
                        {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenEditModal(user)}>Editar Permissões</DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Deletar</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação removerá o usuário permanentemente. Deseja continuar?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        contracts={contracts}
      />
    </div>
  );
}
