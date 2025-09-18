'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/data';
import { getAvatar } from '@/lib/avatar-storage';

const USERS_STORAGE_KEY = 'arpolarUsers';

const SupervisorCard = ({ supervisor }: { supervisor: User }) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const url = getAvatar(supervisor.id);
        setAvatarUrl(url);
        
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === `avatar_${supervisor.id}`) {
                setAvatarUrl(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);

    }, [supervisor.id]);

    const supervisorSlug = supervisor.name.toLowerCase().replace(/\s+/g, '-');

    return (
        <Link href={`/relatorio/${supervisorSlug}`}>
            <div className="bg-blue-800 rounded-lg shadow-lg text-white hover:scale-105 transition-transform duration-300">
                <div className="p-3 text-center">
                    <p className="text-sm">{supervisor.role}</p>
                    <p className="font-bold text-lg">{supervisor.name}</p>
                </div>
                <div className="bg-white p-2 rounded-b-lg">
                    <div className="relative w-full h-32">
                        <Image 
                            src={avatarUrl || 'https://picsum.photos/seed/avatar/200'} 
                            alt={`Foto de ${supervisor.name}`} 
                            fill
                            className="object-cover rounded-full border-4 border-white"
                        />
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default function ReportSupervisorSelectionPage() {
    const [supervisors, setSupervisors] = useState<User[]>([]);
    
    useEffect(() => {
        const loadData = () => {
            const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            if (savedUsers) {
                const allUsers: User[] = JSON.parse(savedUsers);
                const supervisorRoles = ['Supervisor', 'Coordenador', 'Administrador', 'Diretor', 'Gerente', 'Supervisor de Qualidade'];
                const filtered = allUsers.filter(user => 
                    supervisorRoles.includes(user.role) && 
                    user.status === 'Ativo' &&
                    user.showInReports !== false // Default to true if undefined
                );
                setSupervisors(filtered);
            }
        }
        loadData();

        window.addEventListener('storage', (e) => {
            if (e.key === USERS_STORAGE_KEY) {
                loadData();
            }
        });

    }, []);

    return (
        <div 
            className="flex flex-col gap-6 p-6 rounded-lg min-h-full bg-cover bg-center"
            style={{backgroundImage: "url('https://i.ibb.co/whGtbqCQ/Captura-de-tela-2025-09-11-172139.png')"}}
        >
            {/* Header */}
            <header className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                    <Link href="/motivacional">
                        <Button variant="outline" size="icon" className="bg-white/20 border-white/30 hover:bg-white/30 text-white">
                            <ArrowLeft />
                        </Button>
                    </Link>
                </div>
                <h1 className="text-xl md:text-2xl font-bold">Relatório de Atividades - Supervisores 2025</h1>
                <div className="w-10"> {/* Placeholder for spacing */} </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6 bg-black/10 backdrop-blur-sm rounded-lg">
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {supervisors.map(supervisor => (
                        <SupervisorCard key={supervisor.id} supervisor={supervisor} />
                    ))}
                </div>
            </div>
        </div>
    );
}
