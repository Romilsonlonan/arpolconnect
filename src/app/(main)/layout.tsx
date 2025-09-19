
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Menu,
  Search,
  MessageSquare,
  GitMerge,
  BarChart2,
  ListChecks,
  FileText,
  Presentation,
  BrainCircuit,
  ShieldCheck,
  ClipboardList,
  Settings,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarNav,
  SidebarNavItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState, useEffect, createContext, useContext } from 'react';
import type { User, Contract, Message, OrgNode } from '@/lib/data';
import { getAvatar as getAvatarFromStorage } from '@/lib/avatar-storage';
import { buildTreeFromUsersAndContracts } from '@/lib/tree-utils';

// --- STORAGE KEYS ---
const USER_AVATAR_STORAGE_KEY = 'userAvatar';
const USER_SETTINGS_STORAGE_KEY = 'userSettings';
const APP_THEME_STORAGE_KEY = 'appTheme';
const USERS_STORAGE_KEY = 'arpolarUsers';
const CONTRACTS_STORAGE_KEY = 'arpolarContracts';
const DASHBOARD_MESSAGES_KEY = 'dashboardMessages';
const ORG_CHART_STORAGE_KEY = 'orgChartTree';

// --- THEME DATA ---
const themes = [
    { name: 'Padrão', id: 'default', primary: '207 44% 49%', accent: '185 64% 69%', background: '208 100% 97.1%' },
    { name: 'Oceano', id: 'ocean', primary: '220 80% 50%', accent: '190 70% 60%', background: '210 40% 98%' },
    { name: 'Floresta', id: 'forest', primary: '120 40% 40%', accent: '90 50% 55%', background: '90 20% 96%' },
    { name: 'Grafite', id: 'graphite', primary: '240 10% 40%', accent: '240 5% 65%', background: '240 5% 97%' },
    { name: 'Vibrante', id: 'vibrant', primary: '340 80% 55%', accent: '45 90% 55%', background: '30 100% 97%' },
    { name: 'Solar', id: 'solar', primary: '45 90% 50%', accent: '50 100% 60%', background: '50 100% 97%' },
    { name: 'Marinho', id: 'navy', primary: '215 40% 30%', accent: '195 50% 50%', background: '210 30% 98%' },
];

function applyTheme(themeId: string) {
    const theme = themes.find(t => t.id === themeId) || themes[0];
    if (document?.documentElement) {
        document.documentElement.style.setProperty('--primary', theme.primary);
        document.documentElement.style.setProperty('--accent', theme.accent);
        document.documentElement.style.setProperty('--background', theme.background);
    }
}

// --- DATA CONTEXT ---
type AppDataContextType = {
    users: User[];
    contracts: Contract[];
    messages: Message[];
    orgTree: OrgNode | null;
    getAvatar: (userId: string) => string | null;
    currentUser: User | null;
    isDataLoading: boolean;
};

const AppDataContext = createContext<AppDataContextType | null>(null);

export function useAppData() {
    const context = useContext(AppDataContext);
    if (!context) {
        throw new Error('useAppData deve ser usado dentro de um AppDataProvider');
    }
    return context;
}

function AppDataProvider({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [orgTree, setOrgTree] = useState<OrgNode | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const loadAllData = () => {
        setIsDataLoading(true);
        try {
            const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            const loadedUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
            setUsers(loadedUsers);

            const savedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
            const loadedContracts: Contract[] = savedContracts ? JSON.parse(savedContracts) : [];
            setContracts(loadedContracts);

            const savedMessages = localStorage.getItem(DASHBOARD_MESSAGES_KEY);
            setMessages(savedMessages ? JSON.parse(savedMessages) : []);

            const finalTree = buildTreeFromUsersAndContracts(loadedUsers, loadedContracts);
            setOrgTree(finalTree);
            localStorage.setItem(ORG_CHART_STORAGE_KEY, JSON.stringify(finalTree));

            const adminUser = loadedUsers.find(u => u.role === 'Administrador');
            setCurrentUser(adminUser || null);

        } catch (error) {
            console.error("Falha ao carregar dados do localStorage", error);
        } finally {
            setIsDataLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
        window.addEventListener('storage', loadAllData);
        return () => {
            window.removeEventListener('storage', loadAllData);
        };
    }, []);

    const getAvatar = (userId: string) => getAvatarFromStorage(userId);

    const value = {
        users,
        contracts,
        messages,
        orgTree,
        getAvatar,
        currentUser,
        isDataLoading,
    };

    return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

// --- MAIN LAYOUT COMPONENTS ---
function MainLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { open } = useSidebar();
    const [userAvatar, setUserAvatar] = useState('https://placehold.co/100x100');
    const [userName, setUserName] = useState('AC');

    useEffect(() => {
        const updateUserData = () => {
            const savedAvatar = localStorage.getItem(USER_AVATAR_STORAGE_KEY);
            const savedSettings = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
            if (savedAvatar) setUserAvatar(savedAvatar);
            if (savedSettings) {
                try {
                    const settings = JSON.parse(savedSettings);
                    setUserName(settings.name || 'AC');
                } catch(e) {
                    console.error("Falha ao analisar configurações do usuário", e);
                }
            }
        };

        const loadAndApplyTheme = () => {
            const savedThemeId = localStorage.getItem(APP_THEME_STORAGE_KEY);
            applyTheme(savedThemeId || 'default');
        };

        updateUserData();
        loadAndApplyTheme();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === USER_AVATAR_STORAGE_KEY || event.key === USER_SETTINGS_STORAGE_KEY) {
                updateUserData();
            }
            if (event.key === APP_THEME_STORAGE_KEY) {
                loadAndApplyTheme();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const navItems = [
      { href: '/dashboard', icon: <MessageSquare />, label: 'Painel de Tickets' },
      { href: '/tickets', icon: <ClipboardList />, label: 'Tickets por Responsável' },
      { href: '/organograma', icon: <GitMerge />, label: 'Organograma' },
      { href: '/relatorio', icon: <BarChart2 />, label: 'Relatório' },
      { href: '/ocorrencias', icon: <ListChecks />, label: 'Ocorrências' },
      { href: '/evaluation', icon: <FileText />, label: 'Avaliação' },
      { href: '/dds-info', icon: <Presentation />, label: 'DDS Info' },
      { href: '/support', icon: <BrainCircuit />, label: 'Suporte IA' },
      { href: '/admin', icon: <ShieldCheck />, label: 'Admin' },
    ];

    return (
        <div className={cn(
            "grid min-h-screen w-full transition-[grid-template-columns]",
            open ? "md:grid-cols-[220px_1fr]" : "md:grid-cols-[64px_1fr]"
        )}>
            <Sidebar>
                <SidebarHeader>
                    <Link href="/" className={cn(
                        "flex items-center gap-2 font-semibold font-headline text-primary-foreground",
                        !open && "justify-center"
                    )}>
                        <Image src="https://i.ibb.co/jL2G9w9/Logo.png" alt="Arpolar Connect Logo" width={36} height={36} className="h-9 w-9" unoptimized />
                        {open && <span>Arpolar Connect</span>}
                    </Link>
                </SidebarHeader>
                <SidebarBody>
                    <div className={cn("px-4 py-2 text-sm font-semibold text-primary-foreground/70", !open && "hidden")}>Menu</div>
                    <SidebarNav>
                        {navItems.map(item => (
                           <SidebarNavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')} />
                        ))}
                    </SidebarNav>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b border-primary/20 bg-primary px-4 lg:h-[60px] lg:px-6">
                    <SidebarTrigger />
                    <div className="w-full flex-1 flex justify-center">
                        <form className="w-full max-w-md">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    className="w-full appearance-none bg-background/70 text-foreground pl-8 shadow-none text-sm"
                                />
                            </div>
                        </form>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={userAvatar} alt="@user" />
                                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Configurações</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Suporte</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Link href="/">Logout</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-2 sm:p-4 lg:gap-6 lg:p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppDataProvider>
                <MainLayoutContent>{children}</MainLayoutContent>
            </AppDataProvider>
        </SidebarProvider>
    );
}
