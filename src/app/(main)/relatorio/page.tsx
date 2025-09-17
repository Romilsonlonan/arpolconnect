'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReportCoverModal } from '@/components/report/report-cover-modal';
import type { User, ReportCover } from '@/lib/data';
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


const USERS_STORAGE_KEY = 'arpolarUsers';
const REPORTS_STORAGE_KEY = 'arpolarReports';

const initialCovers: ReportCover[] = [
    {
        id: 'cover-initial-1',
        title: 'Relatório Arpolar 2025',
        subtitle: 'agosto',
        imageUrl: 'https://i.ibb.co/1nCg9m3/report-cover-example.png',
        characterUrl: 'https://i.ibb.co/yBNt1b1/char.png'
    }
];

export default function ReportPage() {
    const [covers, setCovers] = useState<ReportCover[]>(initialCovers);
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
            const adminUser = allUsers.find(u => u.role === 'Administrador');
            setCurrentUser(adminUser || null);

            const savedCovers = localStorage.getItem(REPORTS_STORAGE_KEY);
            const allCovers: ReportCover[] = savedCovers ? JSON.parse(savedCovers) : [];
            if (allCovers.length > 0) {
                 setCovers(allCovers);
            } else {
                 setCovers(initialCovers);
                 localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(initialCovers));
            }
           
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            toast({ title: "Erro ao carregar dados", variant: "destructive" });
        }
    }, [toast]);

    useEffect(() => {
        setIsClient(true);
        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, [loadData]);

    useEffect(() => {
        if (!carouselApi) {
            return;
        }
        setCount(carouselApi.scrollSnapList().length);
        setCurrent(carouselApi.selectedScrollSnap() + 1);

        carouselApi.on("select", () => {
            setCurrent(carouselApi.selectedScrollSnap() + 1);
        });
    }, [carouselApi]);

    const handleOpenModal = (cover: ReportCover | null) => {
        setEditingCover(cover);
        setIsModalOpen(true);
    };

    const handleSaveCover = (data: Omit<ReportCover, 'id'>, id?: string) => {
        let updatedCovers: ReportCover[];
        if (id) {
            updatedCovers = covers.map(c => c.id === id ? { ...c, ...data, id } : c);
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
            toast({ title: 'Ação não permitida', description: 'O relatório deve ter pelo menos uma capa.', variant: 'destructive' });
            return;
        }
        const updatedCovers = covers.filter(c => c.id !== id);
        setCovers(updatedCovers);
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedCovers));
        toast({ title: 'Capa Removida', variant: 'destructive' });
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
                        Adicionar Nova Capa
                    </Button>
                )}
            </div>

            <Card className='overflow-hidden'>
                <CardContent className="p-0">
                    <Carousel setApi={setCarouselApi} className="w-full">
                        <CarouselContent>
                            {covers.map((cover) => (
                                <CarouselItem key={cover.id}>
                                    <div className="relative w-full aspect-[16/9] bg-gray-200">
                                        <Image
                                            src={cover.imageUrl}
                                            alt={cover.title}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-white p-8">
                                            {/* Content can be placed here if needed over the image */}
                                        </div>
                                         {isAdmin && (
                                            <div className="absolute top-4 right-4 flex gap-2 z-10">
                                                <Button size="icon" onClick={() => handleOpenModal(cover)}>
                                                    <Edit />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="destructive" disabled={covers.length <= 1}>
                                                            <Trash2 />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação não pode ser desfeita. A capa será removida permanentemente.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteCover(cover.id)}>
                                                            Deletar
                                                        </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                    </Carousel>
                     <div className="py-2 text-center text-sm text-muted-foreground">
                        Página {current} de {count}
                    </div>
                </CardContent>
            </Card>
            {isAdmin && (
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
