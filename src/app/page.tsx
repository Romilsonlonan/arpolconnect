'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';

export default function LoginPage() {
  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <Card className="mx-auto max-w-sm w-full bg-white/30 backdrop-blur-lg border border-white/50 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center text-primary">
            <div className="w-24 h-24 text-primary">
              <Logo />
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
              <Label htmlFor="email" className="text-slate-800">Email</Label>
              <Input id="email" type="email" placeholder="m@exemplo.com" required className="bg-white/50 border-white/60 placeholder:text-slate-600" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-slate-800">Senha</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline text-slate-700 hover:text-slate-900">
                  Esqueceu sua senha?
                </Link>
              </div>
              <Input id="password" type="password" required className="bg-white/50 border-white/60" />
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
