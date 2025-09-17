
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Bell,
  Home,
  Menu,
  Search,
  Users,
  GitMerge,
  FileText,
  MessageSquare,
  BookUser,
  FileSignature,
  Presentation,
  ClipboardList,
  Settings,
  BrainCircuit,
  ShieldCheck,
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
import { useState, useEffect } from 'react';


const USER_AVATAR_STORAGE_KEY = 'userAvatar';
const USER_SETTINGS_STORAGE_KEY = 'userSettings';


function MainLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { open } = useSidebar();
    const [userAvatar, setUserAvatar] = useState('https://placehold.co/100x100');
    const [userName, setUserName] = useState('AC');


    useEffect(() => {
        const updateUserData = () => {
            const savedAvatar = localStorage.getItem(USER_AVATAR_STORAGE_KEY);
            const savedSettings = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
            if (savedAvatar) {
                setUserAvatar(savedAvatar);
            }
            if (savedSettings) {
                try {
                    const settings = JSON.parse(savedSettings);
                    setUserName(settings.name || 'AC');
                } catch(e) {
                    console.error("Failed to parse user settings", e);
                }
            }
        };

        updateUserData();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === USER_AVATAR_STORAGE_KEY || event.key === USER_SETTINGS_STORAGE_KEY) {
                updateUserData();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const navItems = [
      { href: '/dashboard', icon: <MessageSquare />, label: 'Painel de Tickets' },
      { href: '/tickets', icon: <ClipboardList />, label: 'Tickets por Responsável' },
      { href: '/organograma', icon: <GitMerge />, label: 'Organograma' },
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
                <Image src="https://i.ibb.co/ksM7sG9D/Logo.png" alt="Arpolar Connect Logo" width={36} height={36} className="h-9 w-9" />
                {open && <span>Arpolar Connect</span>}
              </Link>
          </SidebarHeader>
          <SidebarBody>
            <div className={cn("px-4 py-2 text-sm font-semibold text-primary-foreground/70", !open && "hidden")}>Menu</div>
             <SidebarNav>
                {navItems.map(item => (
                   <SidebarNavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname === item.href}/>
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
      <MainLayoutContent>{children}</MainLayoutContent>
    </SidebarProvider>
  );
}
