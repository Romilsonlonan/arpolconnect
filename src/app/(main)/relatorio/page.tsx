
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ComposedChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { AlertTriangle, XCircle, Clock, CheckCircle, CalendarIcon, Settings, ArrowLeft, ArrowRight, FilterX, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PreventiveStatusCardData, PreventiveConsultation, PreventiveChartData, MonthlyChartData } from '@/lib/data';
import { Calendar } from '@/components/ui/calendar';


// --- Mock Data ---
const consultationData: PreventiveConsultation[] = [
  { contract: 'ICON ALPHAVILLE', monthYear: '03/2025', status: 'Ativo', overdue: 0, notDone: 4680, pending: 0, done: 1484, monthly: [{ name: 'jan 2025', Atrasadas: 100, Realizadas: 1800, "Não Realizadas": 200, "Pendentes": 50 }, { name: 'fev 2025', Atrasadas: 50, Realizadas: 2000, "Não Realizadas": 100, "Pendentes": 20 }, { name: 'mar 2025', Atrasadas: 0, Realizadas: 1484, "Não Realizadas": 0, "Pendentes": 0 }] },
  { contract: 'ICON ALPHAVILLE', monthYear: '02/2025', status: 'Ativo', overdue: 0, notDone: 4040, pending: 0, done: 2124, monthly: [] },
  { contract: 'ICON ALPHAVILLE', monthYear: '01/2025', status: 'Ativo', overdue: 0, notDone: 3317, pending: 0, done: 5830, monthly: [] },
  { contract: 'RIVER ONE', monthYear: '03/2025', status: 'Ativo', overdue: 10483, notDone: 3258, pending: 0, done: 9091, monthly: [{ name: 'jan 2025', Atrasadas: 4000, Realizadas: 8000, "Não Realizadas": 1000, "Pendentes": 500 }, { name: 'fev 2025', Atrasadas: 3000, Realizadas: 8500, "Não Realizadas": 800, "Pendentes": 400 }, { name: 'mar 2025', Atrasadas: 3483, Realizadas: 9091, "Não Realizadas": 500, "Pendentes": 200 }] },
  { contract: 'RIVER ONE', monthYear: '02/2025', status: 'Ativo', overdue: 6857, notDone: 2224, pending: 0, done: 7262, monthly: [] },
  { contract: 'RIVERSIDE', monthYear: '03/2025', status: 'Ativo', overdue: 3366, notDone: 67, pending: 0, done: 8000, monthly: [{ name: 'jan 2025', Atrasadas: 1000, Realizadas: 7000, "Não Realizadas": 300, "Pendentes": 100 }, { name: 'fev 2025', Atrasadas: 1200, Realizadas: 7500, "Não Realizadas": 250, "Pendentes": 150 }, { name: 'mar 2025', Atrasadas: 1166, Realizadas: 8000, "Não Realizadas": 100, "Pendentes": 50 }] },
  { contract: 'JATOBA', monthYear: '03/2025', status: 'Ativo', overdue: 1570, notDone: 1828, pending: 0, done: 5000, monthly: [{ name: 'jan 2025', Atrasadas: 500, Realizadas: 4000, "Não Realizadas": 200, "Pendentes": 100 }, { name: 'fev 2025', Atrasadas: 400, Realizadas: 4500, "Não Realizadas": 150, "Pendentes": 50 }, { name: 'mar 2025', Atrasadas: 670, Realizadas: 5000, "Não Realizadas": 100, "Pendentes": 30 }] },
];

const consultationTotals = {
    overdue: 17340,
    notDone: 17519,
    pending: 0,
    done: 25791,
}

const contractsChartData: PreventiveChartData[] = [
  { name: 'RIVER ONE', overdue: 10483, notDone: 3258, pending: 0, done: 71932 },
  { name: 'RIVERSIDE', overdue: 3366, notDone: 67, pending: 0, done: 33256 },
  { name: 'JATOBA', overdue: 1570, notDone: 1828, pending: 0, done: 16274 },
  { name: 'ICON ALPHAVILLE', overdue: 1318, notDone: 12037, pending: 0, done: 14373 },
];

const totalMonthlyChartData: MonthlyChartData[] = [
    { name: 'jan 2025', Atrasadas: 8000, 'Não Realizadas': 2000, Pendentes: 500, Realizadas: 15500 },
    { name: 'fev 2025', Atrasadas: 6200, 'Não Realizadas': 1500, Pendentes: 400, Realizadas: 15500 },
    { name: 'mar 2025', Atrasadas: 9500, 'Não Realizadas': 1000, Pendentes: 200, Realizadas: 15500 },
    { name: 'abr 2025', Atrasadas: 4000, 'Não Realizadas': 1000, Pendentes: 300, Realizadas: 19500 },
    { name: 'mai 2025', Atrasadas: 7500, 'Não Realizadas': 2500, Pendentes: 800, Realizadas: 42000 },
    { name: 'jun 2025', Atrasadas: 3000, 'Não Realizadas': 500, Pendentes: 100, Realizadas: 25000 },
    { name: 'jul 2025', Atrasadas: 3500, 'Não Realizadas': 700, Pendentes: 200, Realizadas: 26000 },
    { name: 'ago 2025', Atrasadas: 5000, 'Não Realizadas': 1200, Pendentes: 300, Realizadas: 23000 },
];


const contractsChartConfig = {
  overdue: { label: 'Atrasadas', color: '#ff0000' },
  notDone: { label: 'Não Realizadas', color: '#ffa500' },
  pending: { label: 'Pendentes', color: '#0000ff' },
  done: { label: 'Realizadas', color: '#008000' },
} satisfies ChartConfig;

const monthlyChartConfig = {
    Atrasadas: { label: 'Atrasadas', color: '#990000' },
    'Não Realizadas': { label: 'Não Realizadas', color: '#ffa500' },
    Pendentes: { label: 'Pendentes', color: '#0000ff' },
    Realizadas: { label: 'Realizadas', color: '#006400' },
} satisfies ChartConfig;

const ArpolarIcon = ({ className }: { className?: string }) => (
    <Image src="https://i.ibb.co/ksM7sG9D/Logo.png" alt="Arpolar Icon" width={32} height={32} className={className} unoptimized/>
);

const StatusCard = ({ title, value, icon }: {title: string, value: string, icon: React.ReactNode}) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white border border-white/20 w-56">
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

// --- Custom Tooltip for Monthly Chart ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.Atrasadas + data.Realizadas + (data['Não Realizadas'] || 0) + (data['Pendentes'] || 0);
    const atrasadasPercent = total > 0 ? (data.Atrasadas / total) * 100 : 0;
    const realizadasPercent = total > 0 ? (data.Realizadas / total) * 100 : 0;
    const naoRealizadasPercent = total > 0 ? ((data['Não Realizadas'] || 0) / total) * 100 : 0;
    const pendentesPercent = total > 0 ? ((data['Pendentes'] || 0) / total) * 100 : 0;

    const pieData = [
      { name: 'Atrasadas', value: data.Atrasadas, color: monthlyChartConfig.Atrasadas.color },
      { name: 'Realizadas', value: data.Realizadas, color: monthlyChartConfig.Realizadas.color },
      { name: 'Não Realizadas', value: data['Não Realizadas'] || 0, color: monthlyChartConfig['Não Realizadas'].color },
      { name: 'Pendentes', value: data['Pendentes'] || 0, color: monthlyChartConfig.Pendentes.color },
    ].filter(item => item.value > 0);

    return (
      <Card className="w-64">
        <CardHeader>
            <p className="font-bold text-center">{label}</p>
        </CardHeader>
        <CardContent>
          <div className="w-full h-32">
             <ChartContainer config={monthlyChartConfig} className="w-full h-full">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
          </div>
          <div className="mt-4 text-sm space-y-1">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: monthlyChartConfig.Realizadas.color}}></div>
                    <span>Realizadas</span>
                </div>
                <span>{realizadasPercent.toFixed(1)}%</span>
             </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: monthlyChartConfig.Atrasadas.color}}></div>
                    <span>Atrasadas</span>
                </div>
                <span>{atrasadasPercent.toFixed(1)}%</span>
             </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: monthlyChartConfig['Não Realizadas'].color}}></div>
                    <span>Não Realizadas</span>
                </div>
                <span>{naoRealizadasPercent.toFixed(1)}%</span>
             </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: monthlyChartConfig.Pendentes.color}}></div>
                    <span>Pendentes</span>
                </div>
                <span>{pendentesPercent.toFixed(1)}%</span>
             </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};


// --- Main Page Component ---
export default function ReportPage() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 7, 1),
  });
  const [selectedContractName, setSelectedContractName] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<'contracts' | 'monthly' | null>(null);


  const filteredData = useMemo(() => {
    if (!selectedContractName) {
        return {
            statusCards: { overdue: '17.340', notDone: '35.391', pending: '0', done: '210.213' },
            monthlyChartData: totalMonthlyChartData,
        };
    }
    const contractRow = consultationData.find(c => c.contract === selectedContractName && c.monthYear === '03/2025');
    if (contractRow) {
        return {
            statusCards: {
                overdue: contractRow.overdue.toLocaleString('pt-BR'),
                notDone: contractRow.notDone.toLocaleString('pt-BR'),
                pending: contractRow.pending.toLocaleString('pt-BR'),
                done: contractRow.done.toLocaleString('pt-BR'),
            },
            monthlyChartData: contractRow.monthly?.map(m => ({ ...m, 'Não Realizadas': m['Não Realizadas'] || 0, Pendentes: m['Pendentes'] || 0 })) || [],
        };
    }
    return {
        statusCards: { overdue: '0', notDone: '0', pending: '0', done: '0' },
        monthlyChartData: [],
    };
  }, [selectedContractName]);

  const contractsChartDataWithHighlight = useMemo(() => {
    return contractsChartData.map(item => ({
      ...item,
      // @ts-ignore
      fillOpacity: selectedContractName === null || item.name === selectedContractName ? 1 : 0.3,
    }));
  }, [selectedContractName]);


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
             <header className="flex items-center justify-between text-white">
                <h1 className="text-xl font-bold">
                    {selectedContractName ? `Detalhes do Contrato: ${selectedContractName}` : "Supervisora Danielle - Gestão de Contratos"}
                </h1>
                <div className="flex items-center gap-4">
                    {selectedContractName && (
                        <Button variant="secondary" onClick={() => setSelectedContractName(null)}>
                            <FilterX className="mr-2 h-4 w-4" />
                            Limpar Filtro
                        </Button>
                    )}
                    <ArpolarIcon />
                    <Settings className="h-6 w-6" />
                </div>
            </header>
            
            <div className="flex justify-center items-center gap-6">
                <StatusCard title="Atrasadas" value={filteredData.statusCards.overdue} icon={<AlertTriangle />} />
                <StatusCard title="Não Realizadas" value={filteredData.statusCards.notDone} icon={<XCircle />} />
                <Button variant="ghost" size="icon" className="h-16 w-16 text-white/50"><ArrowLeft className="h-12 w-12" /></Button>
                <Button variant="ghost" size="icon" className="h-16 w-16 text-white/50"><ArrowRight className="h-12 w-12" /></Button>
                <StatusCard title="Pendentes" value={filteredData.statusCards.pending} icon={<Clock />} />
                <StatusCard title="Realizadas" value={filteredData.statusCards.done} icon={<CheckCircle />} />
            </div>

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
                            <TableRow 
                                key={i} 
                                onClick={() => setSelectedContractName(row.contract === selectedContractName ? null : row.contract)}
                                className={cn("cursor-pointer", selectedContractName === row.contract && "bg-yellow-200")}
                            >
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

            <div className="grid grid-cols-2 gap-4 flex-1">
                <div 
                    className={cn(
                        "bg-white/90 text-black rounded-lg flex flex-col relative cursor-pointer group",
                        expandedChart && expandedChart !== 'contracts' && 'hidden',
                        expandedChart === 'contracts' && 'col-span-2'
                    )}
                    onClick={() => setExpandedChart(expandedChart === 'contracts' ? null : 'contracts')}
                >
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon">
                            {expandedChart === 'contracts' ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </Button>
                    </div>
                    <div className="bg-blue-900 text-white p-2 text-center text-lg font-semibold">Preventivas por Contratos</div>
                    <div className="flex-1 p-4">
                         <ChartContainer config={contractsChartConfig} className="w-full h-full">
                            <BarChart data={contractsChartDataWithHighlight} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-25} textAnchor="end" height={60} interval={0} />
                                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="done" stackId="a" fill="var(--color-done)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="overdue" stackId="a" fill="var(--color-overdue)" />
                                <Bar dataKey="notDone" stackId="a" fill="var(--color-notDone)" />
                                <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </div>

                 <div 
                    className={cn(
                        "bg-white/90 text-black rounded-lg flex flex-col relative cursor-pointer group",
                        expandedChart && expandedChart !== 'monthly' && 'hidden',
                        expandedChart === 'monthly' && 'col-span-2'
                    )}
                     onClick={() => setExpandedChart(expandedChart === 'monthly' ? null : 'monthly')}
                >
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon">
                           {expandedChart === 'monthly' ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </Button>
                    </div>
                    <header className="bg-blue-900 text-white p-2 text-center text-lg font-semibold">
                        Total Preventivas Mensais {selectedContractName && `- ${selectedContractName}`}
                    </header>
                    <div className="flex-1 p-4">
                        <ChartContainer config={monthlyChartConfig} className="w-full h-full">
                            <ComposedChart data={filteredData.monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
                                <YAxis domain={[0, 'dataMax']} />
                                <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                                <ChartLegend wrapperStyle={{ paddingTop: '30px' }} />
                                
                                <Bar dataKey="Realizadas" fill="var(--color-Realizadas)" barSize={20} />
                                <Bar dataKey="Atrasadas" fill="var(--color-Atrasadas)" barSize={20} />
                                <Bar dataKey="Não Realizadas" fill="var(--color-Não Realizadas)" barSize={20} />
                                <Bar dataKey="Pendentes" fill="var(--color-Pendentes)" barSize={20} />
                                <Line type="monotone" dataKey="Realizadas" stroke="var(--color-Realizadas)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Atrasadas" stroke="var(--color-Atrasadas)" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ChartContainer>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}

    