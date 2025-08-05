
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Home,
  Menu,
  Search,
  Users,
  GitMerge,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarNav,
  SidebarNavItem,
  SidebarTrigger,
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
import { Logo } from '@/components/icons/logo';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/organization', icon: GitMerge, label: 'Organization' },
    { href: '/directory', icon: Users, label: 'Directory' },
  ];

  return (
    <SidebarProvider>
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar>
        <SidebarHeader>
           <Link href="/" className="flex items-center gap-2 font-semibold font-headline text-primary-foreground">
              <Logo className="h-6 w-6" />
              <span>Arpolar Connect</span>
            </Link>
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
        </SidebarHeader>
        <SidebarBody>
           <SidebarNav>
              {navItems.map(item => (
                 <SidebarNavItem key={item.href} href={item.href} label={item.label} icon={<item.icon />} active={pathname === item.href}/>
              ))}
            </SidebarNav>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger />
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="https://placehold.co/100x100" alt="@user" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
    </SidebarProvider>
  );
}
