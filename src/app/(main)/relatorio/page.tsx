
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

export default function ReportPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Página de Relatórios</h1>
        <p className="text-muted-foreground">Visualize e exporte relatórios do sistema.</p>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Relatórios</CardTitle>
          <CardDescription>Esta área está em desenvolvimento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center bg-muted/50 rounded-lg p-8">
            <BarChart2 className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">
              A funcionalidade de relatórios será implementada aqui.
            </p>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Em breve, você poderá gerar relatórios personalizados sobre tickets, desempenho da equipe, status de contratos e muito mais.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
