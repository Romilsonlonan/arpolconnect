
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Home, Settings, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PreventiveStatusCardData, PreventiveConsultation, PreventiveChartData } from '@/lib/data';

// --- Mock Data ---
const statusCardsData: PreventiveStatusCardData[] = [
  { title: 'Atrasadas', value: '17.340', color: 'red' },
  { title: 'Não Realizadas', value: '35.391', color: 'orange' },
  { title: 'Pendentes', value: '0', color: 'blue' },
  { title: 'Realizadas', value: '210.213', color: 'green' },
];

const consultationData: PreventiveConsultation[] = [
  { contract: 'CAPITAL PLAZA', monthYear: '01/2025', status: 'Ativo', overdue: 0, notDone: 504, pending: 0, done: 2036 },
  { contract: 'CAPITAL PLAZA', monthYear: '02/2025', status: 'Ativo', overdue: 0, notDone: 0, pending: 0, done: 3781 },
  { contract: 'CAPITAL PLAZA', monthYear: '03/2025', status: 'Ativo', overdue: 0, notDone: 209, pending: 0, done: 2450 },
  { contract: 'CAPITAL PLAZA', monthYear: '04/2025', status: 'Ativo', overdue: 141, notDone: 0, pending: 0, done: 2486 },
];

const chartData: PreventiveChartData[] = [
  { name: 'RIVER ONE', overdue: 10483, notDone: 0, pending: 0, done: 71932 },
  { name: 'RIVERSIDE', overdue: 3366, notDone: 67, pending: 0, done: 33256 },
  { name: 'JATOBA', overdue: 1570, notDone: 1828, pending: 0, done: 16274 },
  { name: 'ICON ALPHAVILLE', overdue: 1318, notDone: 14, pending: 0, done: 14373 },
  { name: 'EVOLUTION CORPORATE', overdue: 462, notDone: 14, pending: 0, done: 9800 },
  { name: 'CAPITAL PLAZA', overdue: 141, notDone: 1699, pending: 0, done: 23520 },
  { name: 'SUL AMERICA', overdue: 0, notDone: 0, pending: 0, done: 11044 },
];

const chartConfig: ChartConfig = {
  overdue: { label: 'Atrasadas', color: 'hsl(0 63% 51%)' },
  notDone: { label: 'Não Realizadas', color: 'hsl(33 93% 53%)' },
  pending: { label: 'Pendentes', color: 'hsl(215 91% 52%)' },
  done: { label: 'Realizadas', color: 'hsl(142 71% 45%)' },
};


// --- Sub-components ---

const StatusCard = ({ title, value, color }: PreventiveStatusCardData) => {
  const colorClasses = {
    red: 'bg-red-600',
    orange: 'bg-orange-600',
    blue: 'bg-blue-700',
    green: 'bg-green-600',
  };

  return (
    <Card className={cn(colorClasses[color], 'text-white shadow-lg rounded-lg')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <div className="w-full h-1 bg-white/50 mt-1 rounded-full" />
      </CardHeader>
      <CardContent>
        <p className="text-5xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
};

const ArpolarIcon = ({ className }: { className?: string }) => (
    <Image src="https://i.ibb.co/ksM7sG9D/Logo.png" alt="Arpolar Icon" width={32} height={32} className={className} />
);

// --- Main Dashboard Component ---

export function PreventiveDashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 7, 1),
  });

  return (
    <div className="absolute inset-0 flex flex-col p-4 gap-4 text-white bg-transparent">
      {/* Header */}
      <header className="flex items-center justify-between p-2 bg-blue-900 rounded-lg shadow-md">
        <div className="flex items-center gap-2">
            <ArpolarIcon />
            <Home className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Supervisora Danielle - Gestão de Contratos</h1>
        <div className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            <ArpolarIcon />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-12 gap-4">
        {/* Left Sidebar */}
        <aside className="col-span-2 flex flex-col gap-4">
            <Button className="w-full justify-between bg-blue-800 hover:bg-blue-700 text-lg py-6 shadow-md">Contratos <ArrowRight /></Button>
            <Button className="w-full justify-between bg-gray-600 hover:bg-gray-500 text-lg py-6 shadow-md">Mensal <ArrowRight /></Button>
            <div className="flex-1 relative mt-4">
                 <Image src="https://i.ibb.co/YyY2S54/tecnico-grafico.png" alt="Técnico com gráficos" fill className="object-contain" unoptimized/>
            </div>
        </aside>

        {/* Right Content Area */}
        <div className="col-span-10 flex flex-col gap-4">
            {/* Status Cards */}
            <div className="grid grid-cols-5 gap-4 items-center">
                <Button variant="ghost" size="icon" className="h-16 w-16 text-blue-800"><ArrowRight className="h-12 w-12 rotate-180" /></Button>
                {statusCardsData.map((card) => (
                    <StatusCard key={card.title} {...card} />
                ))}
                 <Button variant="ghost" size="icon" className="h-16 w-16 text-blue-800"><ArrowRight className="h-12 w-12" /></Button>
            </div>
          
            {/* Date Pickers & Tables */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-end gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="text-black justify-start text-left font-normal w-[180px]">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Data de início'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateRange.from} onSelect={(d) => setDateRange(prev => ({...prev, from: d}))} /></PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="text-black justify-start text-left font-normal w-[180px]">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Data de fim'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateRange.to} onSelect={(d) => setDateRange(prev => ({...prev, to: d}))} /></PopoverContent>
                    </Popover>
                </div>

                <Card className="bg-white/90 text-black">
                     <CardHeader className="bg-blue-900 text-white p-2 rounded-t-lg">
                        <CardTitle className="text-center text-lg">Consultas por Contratos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-yellow-400 hover:bg-yellow-400">
                                    <TableHead className="text-blue-900 font-bold">Contratos_Danielle</TableHead>
                                    <TableHead className="text-blue-900 font-bold">Mês/Ano</TableHead>
                                    <TableHead className="text-blue-900 font-bold">Atrasadas</TableHead>
                                    <TableHead className="text-blue-900 font-bold">Não Realizadas</TableHead>
                                    <TableHead className="text-blue-900 font-bold">Realizadas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consultationData.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.contract}</TableCell>
                                        <TableCell>{row.monthYear}</TableCell>
                                        <TableCell>{row.overdue}</TableCell>
                                        <TableCell>{row.notDone}</TableCell>
                                        <TableCell>{row.done}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <Card className="bg-white/90 text-black flex-1 flex flex-col">
                <CardHeader className="bg-blue-900 text-white p-2">
                    <CardTitle className="text-center text-lg">Preventivas por Contratos</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4">
                     <ChartContainer config={chartConfig} className="w-full h-full">
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickFormatter={(value) => `${value / 1000} Mil`} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="overdue" stackId="a" fill="var(--color-overdue)" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="notDone" stackId="a" fill="var(--color-notDone)" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="done" stackId="a" fill="var(--color-done)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
