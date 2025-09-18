
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Helper Components ---

const ArpolarIcons = () => (
  <div className="flex items-center gap-2">
    <div className="p-1 bg-yellow-400 rounded-sm">
        <Image src="https://i.ibb.co/9brN9s1/arpolar-alt-logo.png" alt="Arpolar Icon" width={24} height={24} unoptimized />
    </div>
    <div className="p-1.5 bg-white rounded-sm">
        <Image src="https://i.ibb.co/3s8sCV5/home-icon.png" alt="Home Icon" width={20} height={20} unoptimized />
    </div>
  </div>
);

const SummaryCard = ({ title, value }: { title: string, value: string }) => (
  <Card className="bg-blue-800 text-white border-blue-700 shadow-lg flex-1">
    <CardHeader className="pb-2 items-center">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="items-center text-center">
      <p className="text-3xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

const GaugeChart = ({ value, maxValue, label, color, timeValue }: { value: number; maxValue: number; label: string, color: string, timeValue: string }) => {
    const percentage = (value / maxValue) * 100;
    const data = [{ value: percentage }, { value: 100 - percentage }];

    return (
        <Card className="bg-yellow-100 border-blue-800 border-2">
            <CardHeader className="p-2 bg-blue-800 text-white rounded-t-md">
                <CardTitle className="text-sm text-center font-semibold">{label}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 relative flex flex-col items-center justify-center">
                <ChartContainer config={{}} className="w-full h-24">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                            data={data}
                            dataKey="value"
                            startAngle={180}
                            endAngle={0}
                            innerRadius="70%"
                            outerRadius="100%"
                            cy="100%"
                            paddingAngle={2}
                        >
                            <Cell fill={color} />
                            <Cell fill="#e0e0e0" />
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="absolute bottom-[4.5rem] flex flex-col items-center">
                    <span className="text-2xl font-bold text-gray-800">{timeValue}</span>
                    <div className="text-xs text-gray-500 flex justify-between w-[150%]">
                        <span>00:00:00</span>
                        <span>{new Date(maxValue * 1000).toISOString().substr(11, 8)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const QtdGaugeChart = ({ value, maxValue, label, color }: { value: number; maxValue: number; label: string, color: string }) => {
    const percentage = (value / maxValue) * 100;
    const data = [{ value: percentage }, { value: 100 - percentage }];

    return (
        <Card className="bg-yellow-100 border-blue-800 border-2">
            <CardHeader className="p-2 bg-blue-800 text-white rounded-t-md">
                <CardTitle className="text-sm text-center font-semibold">{label}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 relative flex flex-col items-center justify-center">
                <ChartContainer config={{}} className="w-full h-24">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                         <Pie
                            data={data}
                            dataKey="value"
                            startAngle={180}
                            endAngle={0}
                            innerRadius="70%"
                            outerRadius="100%"
                            cy="100%"
                            paddingAngle={2}
                        >
                            <Cell fill={color} />
                            <Cell fill="#e0e0e0" />
                        </Pie>
                    </PieChart>
                </ChartContainer>
                 <div className="absolute bottom-[4.5rem] flex flex-col items-center">
                    <span className="text-2xl font-bold text-gray-800">{value}</span>
                     <div className="text-xs text-gray-500 flex justify-between w-[150%]">
                        <span>0</span>
                        <span>{maxValue}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


const performanceData = [
    { name: 'Julio César dos Santos França', monthYear: '08/2025', occurrences: 110, hrsOccurrences: '61:04:00', hrsActivities: '88:72:00', totalHrs: '149:36:00'},
    { name: 'Denis Lima', monthYear: '08/2025', occurrences: 36, hrsOccurrences: '75:31:00', hrsActivities: '83:31:00', totalHrs: '159:03:00'},
    { name: 'Adriano de Carvalho', monthYear: '08/2025', occurrences: 31, hrsOccurrences: '71:06:00', hrsActivities: '85:24:00', totalHrs: '156:30:00'},
];

// --- Main Page Component ---
export default function OcorrenciasPage() {
  const totalOccurrences = performanceData.reduce((acc, item) => acc + item.occurrences, 0);

  return (
    <div 
        className="flex flex-col gap-4 p-6 rounded-lg"
        style={{background: 'linear-gradient(180deg, #3B82F6 0%, #1E3A8A 100%)'}}
    >
        {/* Header */}
        <header className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
                <ArpolarIcons />
                <h1 className="text-xl font-bold">Supervisora Danielle - Gestão de Equipes</h1>
            </div>
        </header>

        {/* Summary Cards */}
        <div className="flex items-center gap-4">
            <Link href="/relatorio">
                <Button variant="ghost" size="icon" className="text-white"><ArrowLeft className="h-8 w-8"/></Button>
            </Link>
            <SummaryCard title="Qtd de Ocorrências" value="264" />
            <SummaryCard title="Hrs Trab Ocorrências" value="345:23:60" />
            <SummaryCard title="Total Hrs Atividades" value="1180:33:00" />
            <SummaryCard title="Total Hrs Trabalhadas" value="00:28:00" />
            <Button variant="ghost" size="icon" className="text-white"><ArrowRight className="h-8 w-8"/></Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6 items-start p-6 bg-yellow-300 rounded-lg">
           
            {/* Left Section with Image */}
            <div className="col-span-2 flex flex-col gap-4 items-center">
                 <Image src="https://i.ibb.co/n6k8wVw/tecnico-ocorrencias.png" alt="Técnico com prancheta" width={150} height={300} className="object-contain" />
                 <div className="w-full">
                    <p className="text-sm font-semibold mb-1 text-gray-700">Mês/Ano</p>
                    <Select defaultValue="08/2025">
                        <SelectTrigger className="bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="08/2025">08/2025</SelectItem>
                            <SelectItem value="07/2025">07/2025</SelectItem>
                            <SelectItem value="06/2025">06/2025</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            {/* Right Section with Gauges and Table */}
            <div className="col-span-10 flex flex-col gap-6">

                {/* Gauge Charts */}
                <div className="grid grid-cols-4 gap-4">
                    <QtdGaugeChart label="Qtd de Ocorrências" value={264} maxValue={300} color="#22c55e" />
                    <GaugeChart label="Hrs Trab Ocorrências" value={124356} maxValue={1080000} timeValue="345:23:60" color="#facc15" />
                    <GaugeChart label="Total Hrs Atividades" value={424980} maxValue={1080000} timeValue="1180:33:00" color="#facc15" />
                    <GaugeChart label="Total Hrs Trabalhadas" value={541098} maxValue={1080000} timeValue="1525:18:60" color="#facc15" />
                </div>

                {/* Performance Table */}
                <div className="bg-white/90 text-black rounded-lg overflow-hidden border-2 border-blue-800">
                    <div className="bg-blue-800 text-white p-2 text-center text-lg font-semibold">Desempenho de Horas</div>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-yellow-400 hover:bg-yellow-400">
                                <TableHead className="text-blue-900 font-bold w-[250px]">Danielle_Horas</TableHead>
                                <TableHead className="text-blue-900 font-bold">Mês/Ano</TableHead>
                                <TableHead className="text-blue-900 font-bold">Qtd de Ocorrências</TableHead>
                                <TableHead className="text-blue-900 font-bold">Hrs Trab Ocorrências</TableHead>
                                <TableHead className="text-blue-900 font-bold">Hrs Trab Atividades</TableHead>
                                <TableHead className="text-blue-900 font-bold">Total Hrs Trab</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {performanceData.map((row, i) => (
                                <TableRow key={i} className={cn(i % 2 === 0 ? 'bg-white' : 'bg-yellow-100', "hover:bg-yellow-200")}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.monthYear}</TableCell>
                                    <TableCell>{row.occurrences}</TableCell>
                                    <TableCell>{row.hrsOccurrences}</TableCell>
                                    <TableCell>{row.hrsActivities}</TableCell>
                                    <TableCell>{row.totalHrs}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="font-bold bg-gray-200">
                                <TableCell colSpan={2}>Total</TableCell>
                                <TableCell>{totalOccurrences}</TableCell>
                                <TableCell colSpan={3}></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    </div>
  );
}
