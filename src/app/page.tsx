
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
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

const userRoles = [
    'Diretor', 
    'Gerente', 
    'Coordenador', 
    'Supervisor',
    'Técnico de Planejamento',
    'Coordenador de Contratos',
    'Gerente de Contratos',
    'Mecânico',
    'Eletricista',
    'Ajudante',
    'Supervisor de Qualidade'
];

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;


export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleAdminLogin = () => {
    if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASS) {
      toast({
        title: "Login de Administrador Bem-sucedido!",
        description: "Redirecionando para o painel de administração.",
      });
      router.push('/admin');
    } else {
      toast({
        title: "Credenciais Inválidas",
        description: "O e-mail ou a senha de administrador estão incorretos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center p-4"
      style={{ backgroundImage: "url('https://i.ibb.co/zVzbGGgD/fundoaqc.jpg')" }}
    >
      <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white bg-black/20 hover:bg-black/50 hover:text-white">
                <KeyRound className="h-6 w-6" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <ShieldCheck />
                    Acesso Restrito ao Administrador
                </AlertDialogTitle>
                <AlertDialogDescription>
                    Por favor, insira as credenciais de administrador para continuar.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="admin-email">E-mail</Label>
                    <Input id="admin-email" type="email" placeholder="admin@arpolar.com.br" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="admin-password">Senha</Label>
                    <Input id="admin-password" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                </div>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleAdminLogin}>Entrar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="mx-auto max-w-sm w-full bg-white/30 backdrop-blur-lg border border-white/50 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center text-primary">
            <div className="w-24 h-24">
              <Image src="https://i.ibb.co/jL2G9w9/Logo.png" alt="Arpolar Connect Logo" width={96} height={96} />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-headline text-slate-800">Arpolar Connect</CardTitle>
            <CardDescription className="text-slate-700">Insira suas credenciais para acessar sua conta</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-800">Nome</Label>
              <Input id="name" type="text" placeholder="Seu nome completo" required className="bg-white/50 border-white/60 placeholder:text-slate-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-800">Senha</Label>
              <Input id="password" type="password" required className="bg-white/50 border-white/60" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="text-slate-800">Confirmar Senha</Label>
              <Input id="confirm-password" type="password" required className="bg-white/50 border-white/60" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="role" className="text-slate-800">Função</Label>
                <Select>
                    <SelectTrigger id="role" className="bg-white/50 border-white/60 text-slate-800">
                        <SelectValue placeholder="Selecione sua função" />
                    </SelectTrigger>
                    <SelectContent>
                        {userRoles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
