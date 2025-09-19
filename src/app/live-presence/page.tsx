
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { CheckCircle, Loader2 } from 'lucide-react';

const LIVE_ATTENDEES_STORAGE_KEY = 'liveAttendees';

type LiveAttendee = {
    id: string;
    fullName: string;
    role: string;
    contractName: string;
    timestamp: string;
};

export default function LivePresencePage() {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [contractName, setContractName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fullName.trim() || !role.trim() || !contractName.trim()) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha todos os campos para registrar sua presença.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate server delay
    setTimeout(() => {
        try {
            const currentAttendees: LiveAttendee[] = JSON.parse(localStorage.getItem(LIVE_ATTENDEES_STORAGE_KEY) || '[]');
            
            const newAttendee: LiveAttendee = {
                id: `attendee-${Date.now()}`,
                fullName,
                role,
                contractName,
                timestamp: new Date().toISOString(),
            };
            
            const updatedAttendees = [...currentAttendees, newAttendee];
            localStorage.setItem(LIVE_ATTENDEES_STORAGE_KEY, JSON.stringify(updatedAttendees));
            
            window.dispatchEvent(new StorageEvent('storage', {
                key: LIVE_ATTENDEES_STORAGE_KEY,
                newValue: JSON.stringify(updatedAttendees),
            }));

            setIsSubmitted(true);
            setIsSubmitting(false);

        } catch (error) {
            console.error('Failed to save attendance:', error);
            toast({
                title: 'Erro ao Salvar',
                description: 'Não foi possível registrar sua presença. Tente novamente.',
                variant: 'destructive',
            });
            setIsSubmitting(false);
        }
    }, 4000);
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center p-4"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <Card className="mx-auto max-w-md w-full bg-white/50 backdrop-blur-lg border border-white/50 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center text-primary">
            <div className="w-20 h-20">
              <Image src="https://i.ibb.co/ksM7sG9/Logo.png" alt="Arpolar Connect Logo" width={80} height={80} />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-headline text-slate-800">Registro de Presença DDS</CardTitle>
            <CardDescription className="text-slate-700">
              {isSubmitted 
                ? "Obrigado por confirmar sua presença!" 
                : "Preencha seus dados para confirmar sua presença na live."
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center flex flex-col items-center gap-4 py-8">
                <CheckCircle className="w-24 h-24 text-green-500" />
                <p className="text-xl font-semibold text-slate-800">Presença Confirmada!</p>
                <p className="text-slate-700">Você já pode fechar esta página.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-slate-800">Nome Completo</Label>
                <Input 
                  id="fullName" 
                  type="text" 
                  placeholder="Seu nome completo" 
                  required 
                  className="bg-white/50 border-white/60 placeholder:text-slate-600"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-slate-800">Sua Função</Label>
                <Input 
                  id="role" 
                  type="text" 
                  placeholder="Ex: Mecânico, Supervisor" 
                  required 
                  className="bg-white/50 border-white/60 placeholder:text-slate-600"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="contractName" className="text-slate-800">Nome do Contrato</Label>
                <Input 
                  id="contractName" 
                  type="text" 
                  placeholder="O nome do contrato em que atua" 
                  required 
                  className="bg-white/50 border-white/60 placeholder:text-slate-600"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 animate-spin" />
                        Registrando...
                    </>
                ) : (
                    "Confirmar Presença"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
