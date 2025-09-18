
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Upload,
  ArrowRight,
  Users,
  Home,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReportCoverModal } from '@/components/report/report-cover-modal';
import type { User, ReportCover, SupervisorCardData } from '@/lib/data';
import { PreventiveDashboard } from '@/components/report/preventive-dashboard';


const USERS_STORAGE_KEY = 'arpolarUsers';
const REPORTS_STORAGE_KEY = 'arpolarReports';

const initialCovers: ReportCover[] = [
  {
    id: 'cover-initial-1',
    type: 'cover',
    title: 'Relatório Padrão',
    subtitle: 'Agosto',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04421cd696?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
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


export default function ReportPage() {
  const [covers, setCovers] = useState<ReportCover[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportCover | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = currentUser?.role === 'Administrador';

  const loadData = useCallback(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const allUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      const adminUser = allUsers.find((u) => u.role === 'Administrador');
      setCurrentUser(adminUser || null);

      const savedCovers = localStorage.getItem(REPORTS_STORAGE_KEY);
      const allCovers: ReportCover[] = savedCovers ? JSON.parse(savedCovers) : initialCovers;
      
      setCovers(allCovers);
      setSelectedReport(allCovers[0]);
      
      if(!savedCovers) {
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


  const handleOpenModal = (cover: ReportCover | null) => {
    if (!cover) return;
    setSelectedReport(cover);
    setIsModalOpen(true);
  };

  const handleSaveCover = (data: Omit<ReportCover, 'id'>, id?: string) => {
    if (!id) return;
    
    let updatedCovers: ReportCover[] = covers.map((c) => (c.id === id ? { ...c, ...data, id } : c));
    
    setCovers(updatedCovers);
    setSelectedReport(updatedCovers.find(c => c.id === id) || null);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedCovers));
    toast({ title: `Banner Atualizado!` });
    setIsModalOpen(false);
  };

  const handleNavigateToReport = () => {
    if (!selectedReport) return;
    
    const targetDashboard = covers.find(
      (c) =>
        c.type === 'preventive-dashboard' &&
        c.supervisorName?.toLowerCase().trim() === selectedReport.supervisorName?.toLowerCase().trim()
    );
      
    if (targetDashboard) {
      setSelectedReport(targetDashboard);
    } else {
       toast({
        title: 'Dashboard não encontrado',
        description: `O dashboard detalhado para ${selectedReport.title} ainda não foi criado.`,
        variant: 'default'
      });
    }
  }

  const handleGoBackToSupervisors = () => {
    const supervisorsPage = covers.find(c => c.type === 'supervisors');
    if (supervisorsPage) {
        setSelectedReport(supervisorsPage);
    } else {
        // Fallback to the very first page if supervisor page doesn't exist for some reason
        setSelectedReport(covers[0]);
    }
  }

  if (!isClient) return null;
  
  if (!selectedReport) {
    return (
        <div>
          <h1 className="text-lg font-semibold md:text-2xl font-headline">Indicadores de Planejamento</h1>
          <p className="text-muted-foreground">Nenhum relatório para exibir. Configure os relatórios no LocalStorage.</p>
        </div>
    )
  }
  
  const isSupervisorView = selectedReport.type === 'supervisor-report' || selectedReport.type === 'preventive-dashboard';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className='flex items-center gap-4'>
           {isSupervisorView && (
              <Button variant="outline" size="icon" onClick={handleGoBackToSupervisors}>
                <ArrowLeft />
              </Button>
            )}
            <div>
                <h1 className="text-lg font-semibold md:text-2xl font-headline">
                    {isSupervisorView ? selectedReport.title : 'Indicadores de Planejamento'}
                </h1>
                <p className="text-muted-foreground">
                    {isSupervisorView ? `Visualizando relatório para ${selectedReport.supervisorName}` : 'Escolha um relatório para visualizar os indicadores de desempenho.'}
                </p>
            </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Banner do Relatório</CardTitle>
            <CardDescription>Clique na imagem para navegar ou altere o banner.</CardDescription>
          </div>
          {isAdmin && (
              <Button variant="outline" onClick={() => handleOpenModal(selectedReport)}>
                  <Upload className="mr-2" />
                  Alterar Banner
              </Button>
          )}
        </CardHeader>
        <CardContent>
            <div className="relative w-full aspect-[16/9] bg-muted rounded-lg overflow-hidden cursor-pointer group">
              <Image
                src={selectedReport.imageUrl}
                alt={selectedReport.title}
                fill
                className={'object-cover'}
                priority
                unoptimized
                onClick={handleNavigateToReport}
              />
               <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-lg font-bold">Visualizar Detalhes</p>
               </div>
            </div>
        </CardContent>
      </Card>
      
      {!isSupervisorView && (
       <div className="flex justify-end">
            <Button onClick={handleNavigateToReport}>
                Visualizar Relatório
                <ArrowRight className="ml-2" />
            </Button>
       </div>
      )}

      {isAdmin && isModalOpen && (
        <ReportCoverModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCover}
          editingCover={selectedReport}
        />
      )}
    </div>
  );
}
