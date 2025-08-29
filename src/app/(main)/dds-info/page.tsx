
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Send, Phone, UserCheck, Users, Calendar, UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';


// --- Tipos e Dados Mock ---
type DdsFile = {
  name: string;
  date: string;
  size: string;
};

type DdsParticipant = {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
};

const mockFiles: DdsFile[] = [
  { name: 'DDS_Seguranca_Altura_Semana23.pdf', date: '2024-06-10', size: '1.2 MB' },
  { name: 'DDS_EPI_Semana22.pdf', date: '2024-06-03', size: '850 KB' },
  { name: 'DDS_Primeiros_Socorros_Semana21.pdf', date: '2024-05-27', size: '980 KB' },
];

const initialAttendance = {
  'Segunda-feira': 85,
  'Terça-feira': 92,
  'Quarta-feira': 78,
  'Quinta-feira': 95,
  'Sexta-feira': 88,
};

const DDS_PARTICIPANTS_STORAGE_KEY = 'ddsParticipants';

export default function DDSInfoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // --- Estados ---
  const [files, setFiles] = useState<DdsFile[]>(mockFiles);
  const [postContent, setPostContent] = useState('Lembrete: O DDS desta semana abordará os procedimentos de segurança para trabalhos em altura. A participação é obrigatória. Link para a live: [link]');
  const [attendance, setAttendance] = useState(initialAttendance);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  
  const [participants, setParticipants] = useState<DdsParticipant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantPhone, setNewParticipantPhone] = useState('');
  const [isClient, setIsClient] = useState(false);

  // --- Efeitos ---
  useEffect(() => {
    setIsClient(true);
    try {
      const savedParticipants = localStorage.getItem(DDS_PARTICIPANTS_STORAGE_KEY);
      if (savedParticipants) {
        setParticipants(JSON.parse(savedParticipants));
      }
    } catch (error) {
      console.error('Failed to load participants from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if(isClient) {
      try {
        localStorage.setItem(DDS_PARTICIPANTS_STORAGE_KEY, JSON.stringify(participants));
      } catch (error) {
        console.error('Failed to save participants to localStorage', error);
      }
    }
  }, [participants, isClient]);


  // --- Funções ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    setHasConfirmed(true);
    toast({
        title: 'Presença Confirmada!',
        description: 'Sua presença na live DDS foi registrada com sucesso.'
    })
  };

  const handleAddParticipant = () => {
    if (!newParticipantName.trim() || !newParticipantPhone.trim()) {
      toast({ title: 'Campos obrigatórios', description: 'Nome e telefone são necessários.', variant: 'destructive'});
      return;
    }
    const newParticipant: DdsParticipant = {
      id: `participant-${Date.now()}`,
      name: newParticipantName,
      phone: newParticipantPhone,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
    };
    setParticipants([...participants, newParticipant]);
    setNewParticipantName('');
    setNewParticipantPhone('');
    toast({ title: 'Participante Adicionado!', description: `${newParticipant.name} foi adicionado à lista.`});
  };

  const handleRemoveParticipant = (id: string) => {
    const participantToRemove = participants.find(p => p.id === id);
    setParticipants(participants.filter(p => p.id !== id));
    toast({ title: 'Participante Removido', description: `${participantToRemove?.name} foi removido da lista.`});
  };


  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">DDS Info Center</h1>
        <p className="text-muted-foreground">Gerencie os arquivos, comunicados e a participação da equipe no DDS.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        
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
                        {participants.slice(0, 7).map(p => ( // Show max 7 avatars
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

        {/* Participant Management Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Gerenciamento de Participantes
                </CardTitle>
                <CardDescription>Adicione ou remova participantes da lista de contatos do DDS.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="participant-name">Nome</Label>
                        <Input id="participant-name" placeholder="Nome do participante" value={newParticipantName} onChange={e => setNewParticipantName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="participant-phone">Telefone</Label>
                        <Input id="participant-phone" placeholder="(XX) XXXXX-XXXX" value={newParticipantPhone} onChange={e => setNewParticipantPhone(e.target.value)} />
                    </div>
                    <Button onClick={handleAddParticipant}>
                        <UserPlus className="mr-2"/>
                        Adicionar Participante
                    </Button>
                </div>
                <Separator className="my-4" />
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Lista de Participantes ({participants.length})</h3>
                <ScrollArea className="h-48">
                    <div className="space-y-3 pr-4">
                        {participants.length > 0 ? participants.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50">
                                <div>
                                    <p className="font-semibold">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.phone}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveParticipant(p.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground pt-4">Nenhum participante cadastrado.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>


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

        {/* Repository Section */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Repositório DDS
            </CardTitle>
            <CardDescription>Arquivos do Diálogo Diário de Segurança da semana.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
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

      </div>
    </div>
  );
}
