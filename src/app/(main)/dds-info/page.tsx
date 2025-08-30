
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Send, Phone, UserCheck, Users, Calendar, UserPlus, Trash2, Loader2, Link, Download } from 'lucide-react';
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

type LiveAttendee = {
    id: string;
    fullName: string;
    role: string;
    contractName: string;
    timestamp: string;
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
const LIVE_ATTENDEES_STORAGE_KEY = 'liveAttendees';


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
  
  const [liveAttendees, setLiveAttendees] = useState<LiveAttendee[]>([]);

  const [isClient, setIsClient] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // --- Efeitos ---
  useEffect(() => {
    setIsClient(true);
    
    const loadInitialData = () => {
        try {
            const savedParticipants = localStorage.getItem(DDS_PARTICIPANTS_STORAGE_KEY);
            setParticipants(savedParticipants ? JSON.parse(savedParticipants) : []);
            
            const savedAttendees = localStorage.getItem(LIVE_ATTENDEES_STORAGE_KEY);
            setLiveAttendees(savedAttendees ? JSON.parse(savedAttendees) : []);
        } catch (error) {
            console.error('Failed to load data from localStorage on mount', error);
        }
    };
    
    loadInitialData();
    
    // Listen for storage changes to update live attendees in real-time
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LIVE_ATTENDEES_STORAGE_KEY && event.newValue) {
        try {
            setLiveAttendees(JSON.parse(event.newValue));
        } catch (error) {
            console.error('Failed to parse live attendees from storage change', error);
        }
      }
      if (event.key === DDS_PARTICIPANTS_STORAGE_KEY && event.newValue) {
         try {
            setParticipants(JSON.parse(event.newValue));
        } catch (error) {
            console.error('Failed to parse participants from storage change', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

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
  
  const sendPost = async () => {
    if (!postContent.trim()) {
        toast({ title: 'Erro', description: 'O conteúdo do post não pode estar vazio.', variant: 'destructive' });
        return;
    }
    if (participants.length === 0) {
        toast({ title: 'Nenhum participante', description: 'Adicione participantes para enviar a mensagem.', variant: 'destructive'});
        return;
    }

    setIsSending(true);

    const webhookUrl = 'https://seu-webhook-n8n.com/placeholder'; 
    
    const payload = {
        message: postContent,
        phones: participants.map(p => p.phone)
    };

    try {
        console.log("Simulando envio para o webhook:", webhookUrl);
        console.log("Payload:", JSON.stringify(payload, null, 2));

        // Comente a chamada de rede para evitar erros de CORS/rede com o placeholder
        // const response = await fetch(webhookUrl, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(payload)
        // });
        // if (!response.ok) {
        //   throw new Error('Network response was not ok');
        // }
        
        // Simulação de sucesso
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
            title: 'Post Enviado com Sucesso! (Simulação)',
            description: 'A mensagem foi enviada para a fila de automação.',
        });

    } catch (error) {
        console.error("Falha ao enviar para o webhook:", error);
        toast({
            title: 'Falha no Envio',
            description: 'Não foi possível se conectar com o serviço de automação. Verifique o URL do webhook e tente novamente.',
            variant: 'destructive',
        });
    } finally {
        setIsSending(false);
    }
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
    if (participantToRemove) {
      toast({ title: 'Participante Removido', description: `${participantToRemove.name} foi removido da lista.`});
    }
  };

  const generatePresenceLink = () => {
    const link = `${window.location.origin}/live-presence`;
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link Copiado!",
        description: "O link de presença foi copiado para sua área de transferência."
      });
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      toast({
        title: "Falha ao Copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    });
  };

  const downloadPresenceReport = (period: 'daily' | 'weekly' | 'monthly') => {
    if (liveAttendees.length === 0) {
      toast({ title: 'Nenhum registro', description: 'Não há registros de presença para gerar um relatório.', variant: 'destructive' });
      return;
    }

    const now = new Date();
    const filteredAttendees = liveAttendees.filter(attendee => {
        const attendeeDate = new Date(attendee.timestamp);
        if (period === 'daily') {
            return attendeeDate.toDateString() === now.toDateString();
        }
        if (period === 'weekly') {
            const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            return attendeeDate >= oneWeekAgo;
        }
        if (period === 'monthly') {
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return attendeeDate >= oneMonthAgo;
        }
        return false;
    });

    if (filteredAttendees.length === 0) {
      toast({ title: 'Nenhum registro no período', description: `Nenhum registro de presença para o período selecionado.`, variant: 'destructive' });
      return;
    }

    let csvContent = 'Nome Completo,Função,Contrato,Data e Hora do Registro\n';
    filteredAttendees.forEach(p => {
        csvContent += `"${p.fullName}","${p.role}","${p.contractName}","${new Date(p.timestamp).toLocaleString('pt-BR')}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_presenca_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      
      <div className="flex justify-end">
        <Button onClick={generatePresenceLink}>
          <Link className="mr-2" />
          Gerar Link de Presença
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        
        {/* Live Presence List */}
        <Card className="lg:col-span-1 xl:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Presença da Live
                </CardTitle>
                <CardDescription>Participantes que registraram presença através do link.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-80">
                    <div className="space-y-3 pr-4">
                        {liveAttendees.length > 0 ? [...liveAttendees].reverse().map(p => (
                            <div key={p.id} className="flex items-start justify-between text-sm p-2 rounded-lg hover:bg-muted/50">
                                <div>
                                    <p className="font-semibold">{p.fullName}</p>
                                    <p className="text-xs text-muted-foreground">{p.role} - {p.contractName}</p>
                                    <p className="text-xs text-muted-foreground">Registrado em: {new Date(p.timestamp).toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground pt-4">Nenhum participante registrou presença ainda.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
             <CardFooter>
                <div className="text-sm text-muted-foreground w-full text-center">Total de Registros: {liveAttendees.length}</div>
            </CardFooter>
        </Card>

        {/* Presence Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dashboard de Presença
            </CardTitle>
            <CardDescription>Exporte relatórios de presença da equipe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Clique para fazer o download da lista de presença em formato CSV, compatível com Excel.</p>
             <div className="flex flex-col gap-2">
                <Button onClick={() => downloadPresenceReport('daily')}>
                    <Download className="mr-2"/>
                    Download Diário
                </Button>
                <Button onClick={() => downloadPresenceReport('weekly')} variant="secondary">
                    <Download className="mr-2"/>
                    Download Semanal
                </Button>
                <Button onClick={() => downloadPresenceReport('monthly')} variant="outline">
                    <Download className="mr-2"/>
                    Download Mensal
                </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">Os relatórios são baseados na data e hora do registro de presença.</p>
          </CardFooter>
        </Card>

        {/* Post Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Enviar Post Semanal
                </CardTitle>
                <CardDescription>Envie um lembrete ou post sobre o DDS para os contatos de automação.</CardDescription>
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
                <Button className="w-full" onClick={sendPost} disabled={isSending}>
                    {isSending ? (
                        <>
                            <Loader2 className="mr-2 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2" />
                            Enviar para Celular
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
        
        {/* Participant Management Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Gerenciamento de Contatos (Automação)
                </CardTitle>
                <CardDescription>Adicione ou remova participantes da lista de contatos para envio de mensagens via n8n.</CardDescription>
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
                        Adicionar Contato
                    </Button>
                </div>
                <Separator className="my-4" />
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Lista de Contatos ({participants.length})</h3>
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
                            <p className="text-center text-muted-foreground pt-4">Nenhum contato cadastrado.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>

        {/* Repository Section */}
        <Card className="lg:col-span-2 xl:col-span-2">
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

    

    
