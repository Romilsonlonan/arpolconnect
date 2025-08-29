
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Send, Phone, UserCheck, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data
const mockFiles = [
  { name: 'DDS_Seguranca_Altura_Semana23.pdf', date: '2024-06-10', size: '1.2 MB' },
  { name: 'DDS_EPI_Semana22.pdf', date: '2024-06-03', size: '850 KB' },
  { name: 'DDS_Primeiros_Socorros_Semana21.pdf', date: '2024-05-27', size: '980 KB' },
];

const mockParticipants = [
  { id: 1, name: 'Carlos Ferreira', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 2, name: 'Beatriz Costa', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
  { id: 3, name: 'Ricardo Almeida', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
  { id: 4, name: 'Mariana Gonçalves', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
  { id: 5, name: 'Lucas Ribeiro', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d' },
  { id: 6, name: 'Júlia Castro', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026709d' },
];

const initialAttendance = {
  'Segunda-feira': 85,
  'Terça-feira': 92,
  'Quarta-feira': 78,
  'Quinta-feira': 95,
  'Sexta-feira': 88,
};

export default function DDSInfoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [files, setFiles] = useState(mockFiles);
  const [postContent, setPostContent] = useState('Lembrete: O DDS desta semana abordará os procedimentos de segurança para trabalhos em altura. A participação é obrigatória. Link para a live: [link]');
  const [participants, setParticipants] = useState(mockParticipants.slice(0, 4));
  const [attendance, setAttendance] = useState(initialAttendance);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload this file to a server.
      // Here, we'll just add it to our mock list.
      const newFile = {
        name: file.name,
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024).toFixed(2)} KB`,
      };
      setFiles([newFile, ...files]);

      toast({
        title: 'Upload Concluído',
        description: `O arquivo "${file.name}" foi carregado com sucesso.`,
      });
    }
  };
  
  const sendPost = () => {
    // In a real app, this would call an API to send the post.
    if (!postContent.trim()) {
        toast({ title: 'Erro', description: 'O conteúdo do post não pode estar vazio.', variant: 'destructive' });
        return;
    }
    toast({
        title: 'Post Enviado!',
        description: 'A mensagem do DDS foi enviada para os celulares da equipe.',
    });
  };

  const confirmPresence = () => {
    // Logic to confirm presence
    setHasConfirmed(true);
    toast({
        title: 'Presença Confirmada!',
        description: 'Sua presença na live DDS foi registrada com sucesso.'
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">DDS Info Center</h1>
        <p className="text-muted-foreground">Gerencie os arquivos, comunicados e a participação da equipe no DDS.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Repository Section */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Repositório DDS
            </CardTitle>
            <CardDescription>Arquivos do Diálogo Diário de Segurança da semana.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
                <div className="space-y-4">
                {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                        <p className="font-semibold text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.date} - {file.size}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileText className="h-4 w-4" />
                    </Button>
                    </div>
                ))}
                </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <Button className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2" />
              Carregar Arquivo
            </Button>
          </CardFooter>
        </Card>

        {/* Combined Live Call & Post Section */}
        <div className="flex flex-col gap-6">
            {/* Live Call Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Chamada DDS Ao Vivo
                    </CardTitle>
                    <CardDescription>Confirme sua presença e veja quem está online.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-green-500">
                        <Users className="h-5 w-5" />
                        <span className="font-bold">{participants.length} Participantes Online</span>
                    </div>
                    <div className="flex -space-x-2 overflow-hidden">
                        {participants.map(p => (
                            <Avatar key={p.id} className="inline-block h-10 w-10 rounded-full ring-2 ring-background">
                                <AvatarImage src={p.avatar} alt={p.name} />
                                <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={confirmPresence} disabled={hasConfirmed}>
                        <UserCheck className="mr-2"/>
                        {hasConfirmed ? 'Presença Confirmada' : 'Confirmar Presença'}
                    </Button>
                </CardFooter>
            </Card>

             {/* Post Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Enviar Post Semanal
                    </CardTitle>
                    <CardDescription>Envie um lembrete ou post sobre o DDS para a equipe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        placeholder="Escreva a mensagem aqui..." 
                        className="min-h-[100px]"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                    />
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={sendPost}>
                    <Send className="mr-2" />
                    Enviar para Celular
                    </Button>
                </CardFooter>
            </Card>
        </div>


        {/* Attendance Dashboard Section */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dashboard de Presença
            </CardTitle>
            <CardDescription>Comparecimento da equipe nos DDS da semana.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(attendance).map(([day, value]) => (
              <div key={day}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">{day}</p>
                  <p className="text-sm font-bold">{value}%</p>
                </div>
                <Progress value={value} className="h-3" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
