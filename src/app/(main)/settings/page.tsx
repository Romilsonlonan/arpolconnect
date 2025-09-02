
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, Palette, Save } from 'lucide-react';
import { cn } from '@/lib/utils';


const USER_SETTINGS_STORAGE_KEY = 'userSettings';
const USER_AVATAR_STORAGE_KEY = 'userAvatar';
const APP_THEME_STORAGE_KEY = 'appTheme';


const themes = [
    { name: 'Padrão', id: 'default', primary: '207 44% 49%', accent: '185 64% 69%', background: '208 100% 97.1%' },
    { name: 'Oceano', id: 'ocean', primary: '220 80% 50%', accent: '190 70% 60%', background: '210 40% 98%' },
    { name: 'Floresta', id: 'forest', primary: '120 40% 40%', accent: '90 50% 55%', background: '90 20% 96%' },
    { name: 'Grafite', id: 'graphite', primary: '240 10% 40%', accent: '240 5% 65%', background: '240 5% 97%' },
    { name: 'Vibrante', id: 'vibrant', primary: '340 80% 55%', accent: '45 90% 55%', background: '30 100% 97%' },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('Usuário Arpolar');
  const [email, setEmail] =useState('usuario@arpolar.com');
  const [phone, setPhone] = useState('(11) 99999-8888');
  const [avatar, setAvatar] = useState('https://placehold.co/100x100');
  const [activeTheme, setActiveTheme] = useState('default');

   useEffect(() => {
    try {
        const savedSettings = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
        if (savedSettings) {
            const { name, email, phone } = JSON.parse(savedSettings);
            setName(name);
            setEmail(email);
            setPhone(phone);
        }

        const savedAvatar = localStorage.getItem(USER_AVATAR_STORAGE_KEY);
        if (savedAvatar) {
            setAvatar(savedAvatar);
        }

        const savedThemeId = localStorage.getItem(APP_THEME_STORAGE_KEY);
        const themeToApply = themes.find(t => t.id === savedThemeId) || themes[0];
        setActiveTheme(themeToApply.id);
        applyTheme(themeToApply);

    } catch (error) {
        console.error("Failed to load settings from localStorage", error);
    }
   }, []);


  const handleSaveSettings = () => {
    try {
        const settings = { name, email, phone };
        localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        
        toast({
            title: 'Configurações Salvas',
            description: 'Suas informações pessoais foram atualizadas.'
        });
    } catch (error) {
        toast({
            title: 'Erro ao Salvar',
            description: 'Não foi possível salvar suas configurações.',
            variant: 'destructive',
        })
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        try {
            localStorage.setItem(USER_AVATAR_STORAGE_KEY, result);
            setAvatar(result);
            toast({
                title: 'Avatar Atualizado',
                description: 'Sua nova foto de perfil foi salva.'
            })
        } catch (error) {
            toast({
                title: 'Erro ao Salvar Avatar',
                description: 'A imagem é muito grande para ser salva. Escolha um arquivo menor.',
                variant: 'destructive',
            })
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTheme = (theme: typeof themes[0]) => {
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--background', theme.background);
    try {
        localStorage.setItem(APP_THEME_STORAGE_KEY, theme.id);
        setActiveTheme(theme.id);
    } catch (error) {
        console.error("Failed to save theme to localStorage", error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Configurações da Conta</h1>
        <p className="text-muted-foreground">Gerencie suas informações de perfil, preferências e aparência do aplicativo.</p>
       </div>

       <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Atualize seu nome, e-mail e telefone de contato.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <Button onClick={handleSaveSettings}>
                        <Save className="mr-2" />
                        Salvar Informações
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Foto de Perfil</CardTitle>
                        <CardDescription>Altere sua imagem de avatar.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={avatar} />
                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2"/>
                            Alterar Foto
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette />
                            Tema da Aplicação
                        </CardTitle>
                        <CardDescription>Escolha uma paleta de cores para personalizar sua experiência.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {themes.map(theme => (
                                <div key={theme.id} className="flex flex-col items-center gap-2" onClick={() => applyTheme(theme)}>
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-full cursor-pointer border-4 flex items-center justify-center transition-all",
                                            activeTheme === theme.id ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
                                        )}
                                        style={{ backgroundColor: `hsl(${theme.primary})`}}
                                    >
                                        <div className="w-4 h-4 rounded-full" style={{backgroundColor: `hsl(${theme.accent})`}}></div>
                                    </div>
                                    <span className="text-xs font-medium">{theme.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
       </div>
    </div>
  )
}
