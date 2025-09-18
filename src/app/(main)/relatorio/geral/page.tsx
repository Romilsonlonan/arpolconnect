
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
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

const SummaryCard = ({ title, value, className }: { title: string, value: string, className?: string }) => (
  <Card className={cn("text-white shadow-lg flex-1", className)}>
    <CardHeader className="pb-2 items-center">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="w-full h-px bg-white/50 mt-1"></div>
    </CardHeader>
    <CardContent className="items-center text-center">
      <p className="text-4xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

const preventivasData = [
    { name: 'Realizadas', value: 304923, percentage: 79.48, color: '#22c55e' },
    { name: 'Não Realizadas', value: 54787, percentage: 14.28, color: '#f97316' },
    { name: 'Atrasadas', value: 23798, percentage: 6.2, color: '#dc2626' },
    { name: 'Pendentes', value: 121, percentage: 0.03, color: '#3b82f6' },
];

const ocorrenciasData = [
  { name: 'Solucionadas', value: 1982, percentage: 88.1, color: '#16a34a' },
  { name: 'Analisadas', value: 82, percentage: 3.6, color: '#ef4444' },
  { name: 'Não Analisadas', value: 185, percentage: 8.2, color: '#f97316' },
];

const months = ['01/2025', '02/2025', '03/2025', '04/2025', '05/2025', '06/2025', '07/2025', '08/2025'];

// --- Main Page Component ---
export default function PerformanceGeralPage() {
    const [selectedMonth, setSelectedMonth] = useState('08/2025');

  return (
    <div 
        className="flex flex-col gap-8 p-6 rounded-lg min-h-full"
        style={{background: 'linear-gradient(180deg, #3B82F6 0%, #1E3A8A 100%)'}}
    >
        {/* Header */}
        <header className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
                <ArpolarIcons />
            </div>
            <h1 className="text-2xl font-bold">Análise Geral de Desempenho Mensal</h1>
            <div className="flex items-center gap-2">
                 <ArpolarIcons />
            </div>
        </header>

        {/* Summary Cards */}
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white"><ArrowLeft className="h-8 w-8"/></Button>
            <SummaryCard title="Atrasadas" value="23.798" className="bg-red-700 border-red-600" />
            <SummaryCard title="Não Realizadas" value="54.787" className="bg-orange-600 border-orange-500" />
            <SummaryCard title="Pendentes" value="121" className="bg-blue-600 border-blue-500" />
            <SummaryCard title="Realizadas" value="304.923" className="bg-green-600 border-green-500" />
            <Button variant="ghost" size="icon" className="text-white"><ArrowRight className="h-8 w-8"/></Button>
        </div>

        {/* Month Selector */}
        <div className="flex justify-center gap-2 flex-wrap py-2">
            {months.map(month => (
                <Button 
                    key={month}
                    variant={selectedMonth === month ? 'default' : 'secondary'}
                    className={cn(
                        'rounded-full text-xs h-7',
                        selectedMonth === month ? 'bg-slate-800' : 'bg-blue-900/70 text-white'
                    )}
                    onClick={() => setSelectedMonth(month)}
                >
                    {month}
                </Button>
            ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6 items-stretch p-6 bg-yellow-300 rounded-lg flex-1">
           
            {/* Left Section with Chart and Image */}
            <div className="col-span-6 flex flex-col h-full">
                <div className="bg-blue-800 text-white p-2 text-center text-lg font-semibold rounded-t-md">Fechamento do mês - Preventivas</div>
                <div className="flex items-end bg-white/80 p-4 rounded-b-md flex-1">
                     <div className="relative w-[200px] h-[300px] self-end -mb-4 -ml-4">
                         <Image src="https://i.ibb.co/YyY2S54/tecnico-grafico.png" alt="Técnico com gráficos" layout="fill" className="object-contain" unoptimized />
                    </div>
                    <div className="flex-1 -mt-8">
                         <ChartContainer config={{}} className="w-full h-64">
                            <PieChart>
                                <Tooltip formatter={(value, name, props) => [`${props.payload.value.toLocaleString('pt-BR')} (${props.payload.percentage}%)`, name]} />
                                <Pie
                                    data={preventivasData}
                                    dataKey="percentage"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    labelLine={false}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return (
                                            <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
                                                {`${(percent * 100).toFixed(2)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                    {preventivasData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend iconType="circle" />
                            </PieChart>
                         </ChartContainer>
                    </div>
                </div>
            </div>

            {/* Right Section with Chart */}
            <div className="col-span-6 flex flex-col h-full">
                 <div className="bg-blue-800 text-white p-2 text-center text-lg font-semibold rounded-t-md">Fechamento do mês - Ocorrências</div>
                <div className="bg-white/80 p-4 rounded-b-md flex-1">
                     <ChartContainer config={{}} className="w-full h-64">
                         <PieChart>
                            <Tooltip formatter={(value, name, props) => [`${props.payload.value.toLocaleString('pt-BR')} (${props.payload.percentage}%)`, name]} />
                            <Pie
                                data={ocorrenciasData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={2}
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return (
                                            <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
                                                {`${value.toLocaleString('pt-BR')} (${(value / 2249 * 100).toFixed(1)}%)`}
                                            </text>
                                        );
                                    }}
                            >
                                {ocorrenciasData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend iconType="circle"/>
                         </PieChart>
                     </ChartContainer>
                </div>
            </div>
        </div>
    </div>
  );
}
