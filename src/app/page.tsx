
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function LoginPage() {
  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center p-4"
      style={{ backgroundImage: "url('https://i.ibb.co/Z1pWCjK4/fundo-login-arpolconnect.jpg')" }}
    >
      <Card className="mx-auto max-w-sm w-full bg-white/30 backdrop-blur-lg border border-white/50 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center text-primary">
            <div className="w-24 h-24">
              <Image src="https://i.ibb.co/ksM7sG9D/Logo.png" alt="Arpolar Connect Logo" width={96} height={96} />
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
