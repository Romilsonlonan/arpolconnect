
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { ArrowRight, AlertTriangle, XCircle, Clock, CheckCircle, CalendarIcon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PreventiveStatusCardData, PreventiveConsultation, PreventiveChartData } from '@/lib/data';


// --- Mock Data (ajustado para corresponder à imagem) ---
const statusCardsData: PreventiveStatusCardData[] = [
  { title: 'Atrasadas', value: '17.340', color: 'yellow', icon: <AlertTriangle /> },
  { title: 'Não Realizadas', value: '35.391', color: 'yellow', icon: <XCircle /> },
  { title: 'Pendentes', value: '0', color: 'yellow', icon: <Clock /> },
  { title: 'Realizadas', value: '210.213', color: 'yellow', icon: <CheckCircle /> },
];

const consultationData: PreventiveConsultation[] = [
  { contract: 'ICON ALPHAVILLE', monthYear: '03/2025', status: 'Ativo', overdue: 0, notDone: 4680, pending: 0, done: 1484 },
  { contract: 'ICON ALPHAVILLE', monthYear: '02/2025', status: 'Ativo', overdue: 0, notDone: 4040, pending: 0, done: 2124 },
  { contract: 'ICON ALPHAVILLE', monthYear: '01/2025', status: 'Ativo', overdue: 0, notDone: 3317, pending: 0, done: 5830 },
  { contract: 'RIVER ONE', monthYear: '03/2025', status: 'Ativo', overdue: 10483, notDone: 3258, pending: 0, done: 9091 },
  { contract: 'RIVER ONE', monthYear: '02/2025', status: 'Ativo', overdue: 6857, notDone: 2224, pending: 0, done: 7262 },
];

const consultationTotals = {
    overdue: 17340,
    notDone: 17519,
    pending: 0,
    done: 25791,
}

const chartData: PreventiveChartData[] = [
  { name: 'RIVER ONE', overdue: 10483, notDone: 3258, pending: 0, done: 71932 },
  { name: 'RIVERSIDE', overdue: 3366, notDone: 67, pending: 0, done: 33256 },
  { name: 'JATOBA', overdue: 1570, notDone: 1828, pending: 0, done: 16274 },
  { name: 'ICON ALPHAVILLE', overdue: 1318, notDone: 12037, pending: 0, done: 14373 },
];

const chartConfig: ChartConfig = {
  overdue: { label: 'Atrasadas', color: '#ff0000' },
  notDone: { label: 'Não Realizadas', color: '#ffa500' },
  pending: { label: 'Pendentes', color: '#0000ff' },
  done: { label: 'Realizadas', color: '#008000' },
};

const ArpolarIcon = ({ className }: { className?: string }) => (
    <Image src="https://i.ibb.co/ksM7sG9D/Logo.png" alt="Arpolar Icon" width={32} height={32} className={className} unoptimized/>
);

const StatusCard = ({ title, value, icon }: {title: string, value: string, icon: React.ReactNode}) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white border border-white/20">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm opacity-80">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
);


export default function ReportPage() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 7, 1),
  });

  return (
    <div className="grid grid-cols-12 gap-0 min-h-[calc(100vh-104px)] -m-6">
        {/* Left Sidebar */}
        <aside 
            className="col-span-2 p-6 flex flex-col gap-4"
            style={{background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)'}}
        >
            <div className="flex items-center gap-2">
                <div className="p-2 bg-black/10 rounded">
                    <ArpolarIcon />
                </div>
                 <div className="p-3 bg-black/10 rounded" />
            </div>

            <div className="flex flex-col gap-3 mt-8">
                 <Button className="w-full justify-between bg-blue-900 hover:bg-blue-800 text-white text-md py-6 shadow-md rounded-lg">Contratos <ArrowRight /></Button>
                 <Button className="w-full justify-between bg-white hover:bg-gray-100 text-blue-900 text-md py-6 shadow-md rounded-lg">Mensal <ArrowRight /></Button>
            </div>

             <div className="flex flex-col gap-2 mt-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="text-black justify-start text-left font-normal bg-white/50 border-black/20">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Data de início'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateRange.from} onSelect={(d) => setDateRange(prev => ({...prev, from: d}))} /></PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="text-black justify-start text-left font-normal bg-white/50 border-black/20">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Data de fim'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateRange.to} onSelect={(d) => setDateRange(prev => ({...prev, to: d}))} /></PopoverContent>
                    </Popover>
             </div>

            <div className="flex-1 relative mt-4">
                 <Image src="https://i.ibb.co/YyY2S54/tecnico-grafico.png" alt="Técnico com gráficos" fill className="object-contain" unoptimized/>
                 <p className="absolute bottom-0 left-0 text-xs text-black/50">Técnico com tablet</p>
            </div>
        </aside>

        {/* Main Content */}
        <main 
            className="col-span-10 p-6 flex flex-col gap-4"
            style={{background: 'linear-gradient(180deg, #3B82F6 0%, #1E3A8A 100%)'}}
        >
             {/* Header */}
            <header className="flex items-center justify-between text-white">
                <div className="w-10 h-10 bg-white/20 rounded-md" />
                <h1 className="text-xl font-bold">Supervisora Danielle - Gestão de Contratos</h1>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-md" />
                    <div className="w-8 h-8 bg-white/20 rounded-md" />
                    <div className="w-8 h-8 bg-white/20 rounded-md" />
                    <ArpolarIcon />
                    <Settings className="h-6 w-6" />
                </div>
            </header>
            
            {/* Status Cards */}
            <div className="grid grid-cols-5 gap-6 items-center">
                <Button variant="ghost" size="icon" className="h-16 w-16 text-white/50"><ArrowRight className="h-12 w-12 rotate-180" /></Button>
                {statusCardsData.map((card) => (
                    <StatusCard key={card.title} {...card} />
                ))}
                <Button variant="ghost" size="icon" className="h-16 w-16 text-white/50"><ArrowRight className="h-12 w-12" /></Button>
            </div>

            {/* Table */}
            <div className="bg-white/90 text-black rounded-lg overflow-hidden">
                 <div className="bg-blue-900 text-white p-2 text-center text-lg font-semibold">Consultas por Contratos</div>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-yellow-400 hover:bg-yellow-400">
                            <TableHead className="text-blue-900 font-bold">Contratos_Danielle</TableHead>
                            <TableHead className="text-blue-900 font-bold">Mês/Ano</TableHead>
                            <TableHead className="text-blue-900 font-bold">Status</TableHead>
                            <TableHead className="text-blue-900 font-bold">Atrasadas</TableHead>
                            <TableHead className="text-blue-900 font-bold">Não Realizadas</TableHead>
                            <TableHead className="text-blue-900 font-bold">Pendentes</TableHead>
                            <TableHead className="text-blue-900 font-bold">Realizadas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {consultationData.slice(0, 5).map((row, i) => (
                            <TableRow key={i}>
                                <TableCell>{row.contract}</TableCell>
                                <TableCell>{row.monthYear}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                <TableCell>{row.overdue}</TableCell>
                                <TableCell>{row.notDone}</TableCell>
                                <TableCell>{row.pending}</TableCell>
                                <TableCell>{row.done}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-bold bg-gray-200">
                            <TableCell colSpan={3}>Total</TableCell>
                            <TableCell>{consultationTotals.overdue}</TableCell>
                            <TableCell>{consultationTotals.notDone}</TableCell>
                            <TableCell>{consultationTotals.pending}</TableCell>
                            <TableCell>{consultationTotals.done}</TableCell>
                         </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Chart */}
            <div className="bg-white/90 text-black rounded-lg flex-1 flex flex-col">
                <div className="bg-blue-900 text-white p-2 text-center text-lg font-semibold">Preventivas por Contratos</div>
                <div className="flex-1 p-4">
                     <ChartContainer config={chartConfig} className="w-full h-full min-h-[250px]">
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-15} textAnchor="end" height={50} />
                            <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="done" stackId="a" fill="var(--color-done)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="overdue" stackId="a" fill="var(--color-overdue)" />
                            <Bar dataKey="notDone" stackId="a" fill="var(--color-notDone)" />
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>
        </main>
    </div>
  );
}
