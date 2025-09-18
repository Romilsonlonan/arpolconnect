
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import {
  PlusCircle,
  Edit,
  Trash2,
  Home,
  BarChart2,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReportCoverModal } from '@/components/report/report-cover-modal';
import type { User, ReportCover, SupervisorCardData } from '@/lib/data';
import { PreventiveDashboard } from '@/components/report/preventive-dashboard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const USERS_STORAGE_KEY = 'arpolarUsers';
const REPORTS_STORAGE_KEY = 'arpolarReports';

const supervisorData: SupervisorCardData[] = [
  { id: 's0', name: 'Anthony', role: 'Coordenador', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's1', name: 'Danielle', role: 'Supervisora', avatarUrl: 'https://i.ibb.co/b3FhL7d/dani-bg.png' },
  { id: 's2', name: 'Joel', role: 'Supervisor', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's3', name: 'Lucas', role: 'Supervisor', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's4', name: 'Marcelo', role: 'Supervisor', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's5', name: 'Renato', role: 'Supervisor', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's6', name: 'Robson', role: 'Supervisor', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's7', name: 'Thiago', role: 'Supervisor', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's8', name: 'Wanderson', role: 'Supervisor', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's9', name: 'Marcus', role: 'Supervisor AQC', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's10', name: 'Mário', role: 'Supervisor', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's11', name: 'Everton', role: 'Supervisor', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' },
  { id: 's12', name: 'Rafael', role: 'Supervisor', avatarUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png' }
];

const initialCovers: ReportCover[] = [
  {
    id: 'cover-initial-1',
    type: 'cover',
    title: 'Relatório Arpolar 2025',
    subtitle: 'agosto',
    imageUrl: 'https://i.ibb.co/1nCg9m3/report-cover-example.png'
  },
  {
    id: 'cover-initial-2',
    type: 'motivational',
    title: 'Motivacional',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: 'Seja um padrão de qualidade. Algumas pessoas não estão acostumadas a um ambiente onde a excelência é esperada.',
    quoteAuthor: 'Steve Jobs',
    characterImageUrl: 'https://i.ibb.co/yYvyfB9/steve-jobs.png'
  },
  {
    id: 'cover-initial-3',
    type: 'supervisors',
    title: 'Relatório de Atividades - Supervisores 2025',
    subtitle: '',
    imageUrl: 'https://i.ibb.co/Kz2Xp2w/pattern.png',
    supervisors: supervisorData
  },
  {
      id: 'cover-s1',
      type: 'supervisor-report',
      title: `Relatório Danielle`,
      subtitle: '',
      imageUrl: 'https://i.ibb.co/zsgJpY0/fundo-dani.png',
      supervisorName: 'Danielle',
      supervisorImageUrl: 'https://i.ibb.co/b3FhL7d/dani-bg.png'
  },
  {
    id: 'cover-d1',
    type: 'preventive-dashboard',
    title: 'Supervisora Danielle - Gestão de Contratos',
    subtitle: '',
    imageUrl: 'https://i.ibb.co/mS6DBpD/fundo-gestao.png',
    supervisorName: 'Danielle',
  }
];

const ArpolarIcon = () => (
  <Image src="https://i.ibb.co/ksM7sG9D/Logo.png" alt="Arpolar Icon" width={32} height={32} />
);

export default function ReportPage() {
  const [covers, setCovers] = useState<ReportCover[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCover, setEditingCover] = useState<ReportCover | null>(null);

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const isAdmin = currentUser?.role === 'Administrador';

  const loadData = useCallback(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const allUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      const adminUser = allUsers.find((u) => u.role === 'Administrador');
      setCurrentUser(adminUser || null);

      const savedCovers = localStorage.getItem(REPORTS_STORAGE_KEY);
      let allCovers: ReportCover[] = savedCovers ? JSON.parse(savedCovers) : initialCovers;
      
      const coverIds = new Set(allCovers.map(c => c.id));
      const missingCovers = initialCovers.filter(c => !coverIds.has(c.id));
      if (missingCovers.length > 0) {
        allCovers = [...allCovers, ...missingCovers];
      }
      
      setCovers(allCovers);
      if(!savedCovers || allCovers.length !== initialCovers.length) {
          localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(allCovers));
      }

    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    setIsClient(true);
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [loadData]);

  useEffect(() => {
    if (!carouselApi) return;
    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap() + 1);

    carouselApi.on('select', () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    });
  }, [carouselApi, covers]);

  const handleOpenModal = (cover: ReportCover | null) => {
    setEditingCover(cover);
    setIsModalOpen(true);
  };

  const handleSaveCover = (data: Omit<ReportCover, 'id'>, id?: string) => {
    let updatedCovers: ReportCover[];
    if (id) {
      updatedCovers = covers.map((c) => (c.id === id ? { ...c, ...data, id } : c));
    } else {
      const newCover: ReportCover = { ...data, id: `cover-${Date.now()}` };
      updatedCovers = [...covers, newCover];
    }
    setCovers(updatedCovers);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedCovers));
    toast({ title: `Capa ${id ? 'Atualizada' : 'Adicionada'}!` });
    setIsModalOpen(false);
  };

  const handleDeleteCover = (id: string) => {
    if (covers.length <= 1) {
      toast({
        title: 'Ação não permitida',
        description: 'O relatório deve ter pelo menos uma capa.',
        variant: 'destructive'
      });
      return;
    }
    const updatedCovers = covers.filter((c) => c.id !== id);
    setCovers(updatedCovers);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedCovers));
    toast({ title: 'Capa Removida', variant: 'destructive' });
  };

  const handleSupervisorCardClick = (supervisorName: string) => {
    if (!carouselApi) return;

    const targetIndex = covers.findIndex(
      (c) =>
        c.type === 'supervisor-report' &&
        c.supervisorName?.toLowerCase().trim() === supervisorName.toLowerCase().trim()
    );

    if (targetIndex !== -1) {
      carouselApi.scrollTo(targetIndex);
    } else {
      toast({
        title: 'Relatório não encontrado',
        description: `A página de relatório para ${supervisorName} ainda não foi criada.`,
        variant: 'default'
      });
    }
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl font-headline">Apresentação de Relatório</h1>
          <p className="text-muted-foreground">Navegue pelas páginas do relatório.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2" />
            Adicionar Nova Página
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Carousel setApi={setCarouselApi} className="w-full">
            <CarouselContent>
              {covers.map((cover) => (
                <CarouselItem key={cover.id}>
                  <div className="relative w-full aspect-[16/9] bg-gray-800 group">
                    <Image
                      src={cover.imageUrl}
                      alt={cover.title}
                      fill
                      className={cn('object-cover', cover.type === 'cover' && 'opacity-30', cover.type === 'preventive-dashboard' && 'object-center')}
                      priority
                      unoptimized
                    />
                    <div className="absolute inset-0 flex flex-col">
                      {cover.type === 'cover' ? (
                        <div className="flex-1 flex items-center justify-center text-center text-white p-8">
                          <div>
                            <h2 className="text-5xl font-bold font-headline">{cover.title}</h2>
                            <p className="text-2xl mt-2">{cover.subtitle}</p>
                          </div>
                        </div>
                      ) : cover.type === 'motivational' ? (
                        <div className="flex-1 flex items-center justify-center text-center text-white p-8">
                          <Card className="bg-slate-200/90 text-slate-800 max-w-4xl w-full shadow-2xl rounded-2xl">
                            <CardContent className="p-8 md:p-12 text-center">
                              <blockquote className="text-2xl md:text-3xl font-semibold italic">
                                "{cover.quote}"
                              </blockquote>
                              <p className="text-xl md:text-2xl font-medium mt-6">- {cover.quoteAuthor}</p>
                              {cover.characterImageUrl && (
                                <div className="mt-8 flex justify-center">
                                  <Image
                                    src={cover.characterImageUrl}
                                    alt={cover.quoteAuthor || 'Personagem'}
                                    width={120}
                                    height={120}
                                    className="rounded-full object-cover w-24 h-24 md:w-32 md:h-32"
                                    unoptimized
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ) : cover.type === 'supervisors' ? (
                        <>
                          <header className="bg-blue-900 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <ArpolarIcon />
                              <Home className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold">{cover.title}</h2>
                            <div className="flex items-center gap-4">
                              <BarChart2 className="h-6 w-6" />
                              <ArpolarIcon />
                            </div>
                          </header>
                          <div className="flex-1 p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 items-center place-content-center">
                            {(cover.supervisors || []).map((s) => (
                              <Card
                                key={s.id}
                                onClick={() => handleSupervisorCardClick(s.name)}
                                className="bg-yellow-400 border-4 border-blue-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform"
                              >
                                <CardHeader className="bg-blue-900 text-white text-center p-2">
                                  <h3 className="font-bold text-sm">{s.role}</h3>
                                  <p className="text-xs">{s.name}</p>
                                </CardHeader>
                                <CardContent className="p-4 flex justify-center items-center">
                                  <Avatar className="w-24 h-24 border-4 border-blue-900">
                                    <AvatarImage src={s.avatarUrl} />
                                    <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </>
                      ) : cover.type === 'supervisor-report' ? (
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                          <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-center">
                            <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center shadow-2xl">
                              <Avatar className="w-60 h-60">
                                {cover.supervisorImageUrl && (
                                    <AvatarImage src={cover.supervisorImageUrl} alt={cover.supervisorName} />
                                )}
                                <AvatarFallback>{cover.supervisorName?.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                          <div className="absolute right-0 top-0 bottom-0 w-2/3 flex flex-col items-start justify-center text-blue-900 pl-20">
                            <ArpolarIcon />
                            <h1 className="text-6xl font-bold mt-4">Relatório</h1>
                            <h2 className="text-6xl font-bold">{cover.supervisorName}</h2>
                             <Button className="mt-8 bg-yellow-400 text-blue-900 hover:bg-yellow-500">
                                Clique aqui para Seguir <ArrowRight className="ml-2" />
                            </Button>
                          </div>
                           <div className="absolute bottom-4 right-4 flex gap-2">
                                <Button variant="outline" size="icon"><ChevronsLeft /></Button>
                                <Button variant="outline" size="icon"><ChevronsRight /></Button>
                           </div>
                        </div>
                      ) : cover.type === 'preventive-dashboard' ? (
                        <PreventiveDashboard />
                      ) : null}

                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="icon" onClick={() => handleOpenModal(cover)}>
                            <Edit />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita e removerá permanentemente esta página.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCover(cover.id)}>Deletar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </CardContent>
      </Card>
      <div className="py-2 text-center text-sm text-muted-foreground">
        Página {current} de {count}
      </div>

      {isAdmin && isModalOpen && (
        <ReportCoverModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCover}
          editingCover={editingCover}
        />
      )}
    </div>
  );
}
