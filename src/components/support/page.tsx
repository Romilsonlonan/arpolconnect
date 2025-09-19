
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { technicalSupport } from '@/ai/flows/support-flow';
import { ScrollArea } from '@/components/ui/scroll-area';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function SupportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await technicalSupport(input);
      const assistantMessage: ChatMessage = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro ao contatar o assistente. Por favor, tente novamente mais tarde.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <Card className="flex flex-col flex-1">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 font-headline">
            <BrainCircuit className="w-6 h-6" />
            Suporte Técnico com IA
          </CardTitle>
          <CardDescription>
            Faça uma pergunta técnica sobre ar-condicionado e obtenha ajuda do nosso assistente virtual.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground pt-8">
                  <p>Nenhuma mensagem ainda. Comece a conversa!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={cn(
                    'flex items-start gap-4',
                    message.role === 'user' && 'justify-end'
                  )}>
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 border-2 border-primary">
                        <AvatarImage src="https://i.ibb.co/JR7Drmjj/aqc.png" unoptimized/>
                        <AvatarFallback>IA</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      'max-w-prose p-3 rounded-lg',
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>Você</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
               {isLoading && (
                  <div className="flex items-start gap-4">
                    <Avatar className="w-8 h-8 border-2 border-primary">
                        <AvatarImage src="https://i.ibb.co/JR7Drmjj/aqc.png" unoptimized/>
                        <AvatarFallback>IA</AvatarFallback>
                    </Avatar>
                    <div className="max-w-prose p-3 rounded-lg bg-muted flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm text-muted-foreground">Pensando...</span>
                    </div>
                  </div>
               )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua pergunta técnica aqui..."
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
