'use client';

import { useState, useMemo } from 'react';
import { refrigerationQuestions, type RefrigerationQuestion } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Award, RotateCcw, TrendingUp } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"
import { cn } from '@/lib/utils';
import Confetti from 'react-dom-confetti';

const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Componente para o Quiz
function QuizView({ questions, onComplete }: { questions: RefrigerationQuestion[], onComplete: (answers: Record<string, string>) => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(selectedAnswers);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className='mb-4'>
            <p className='text-sm text-muted-foreground'>Pergunta {currentQuestionIndex + 1} de {questions.length}</p>
            <Progress value={progress} className="w-full h-2 mt-2" />
        </div>
        <Image 
          src={currentQuestion.image} 
          alt="Tema da Pergunta" 
          width={800} 
          height={400} 
          className="rounded-lg object-cover aspect-[2/1] bg-muted"
          data-ai-hint={currentQuestion.imageHint}
        />
        <CardTitle className="pt-4 text-xl">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswers[currentQuestion.id] || ''}
          onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
          className="grid gap-4"
        >
          {currentQuestion.options.map((option, index) => (
            <Label
              key={index}
              className={cn(
                  "flex items-center gap-4 border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                  selectedAnswers[currentQuestion.id] === option && "bg-accent border-primary"
              )}
            >
              <RadioGroupItem value={option} id={`q${currentQuestion.id}-o${index}`} />
              <span>{option}</span>
            </Label>
          ))}
        </RadioGroup>
        <Button onClick={handleNext} className="w-full mt-6" disabled={!selectedAnswers[currentQuestion.id]}>
          {currentQuestionIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Avaliação'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Componente para o Certificado
function CertificateView({ score, total, onRestart }: { score: number; total: number; onRestart: () => void }) {
    const [isConfettiActive, setIsConfettiActive] = useState(false);

    useState(() => {
        setTimeout(() => setIsConfettiActive(true), 300);
    });
    
    return (
        <div className="w-full max-w-3xl mx-auto text-center relative">
            <div className='absolute top-1/2 left-1/2'>
                <Confetti active={isConfettiActive} config={{
                    angle: 90,
                    spread: 360,
                    startVelocity: 40,
                    elementCount: 100,
                    dragFriction: 0.12,
                    duration: 3000,
                    stagger: 3,
                    width: "10px",
                    height: "10px",
                    perspective: "500px",
                    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
                }} />
            </div>
            <Card className="bg-card border-2 border-primary shadow-lg overflow-hidden">
                <CardHeader className="bg-primary/10 p-8">
                    <Award className="w-20 h-20 mx-auto text-primary" />
                    <h1 className="text-4xl font-bold font-headline mt-4">Certificado de Conclusão</h1>
                    <p className="text-muted-foreground text-lg mt-2">Avaliação de Qualificação em Refrigeração</p>
                </CardHeader>
                <CardContent className="p-8">
                    <p className="text-xl">Este certificado é concedido a</p>
                    <p className="text-3xl font-bold my-4">Funcionário da Arpolar</p>
                    <p className="text-xl">por concluir com sucesso a avaliação, demonstrando proficiência e conhecimento em sistemas de refrigeração.</p>
                    <p className="font-semibold text-2xl mt-6">Pontuação: {score} / {total}</p>
                    <p className="text-muted-foreground mt-4">{new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
                </CardContent>
            </Card>
            <Button onClick={onRestart} className="mt-8">
                <RotateCcw className="mr-2" />
                Refazer Avaliação
            </Button>
        </div>
    );
}

// Componente para a Tela de Resultados (Reprovado)
function ResultsView({ score, total, onRestart }: { score: number; total: number; onRestart: () => void }) {
  const chartData = [
    { name: 'Acertos', value: score, fill: 'hsl(var(--status-resolved))' },
    { name: 'Erros', value: total - score, fill: 'hsl(var(--destructive))' },
  ];
  
  const chartConfig = {
      acertos: { label: "Acertos" },
      erros: { label: "Erros" },
  }

  return (
    <Card className="w-full max-w-3xl mx-auto text-center">
      <CardHeader>
        <TrendingUp className="w-16 h-16 mx-auto text-destructive" />
        <CardTitle className="text-3xl font-bold mt-4">Resultado da Avaliação</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-4">Você não atingiu a pontuação mínima de 80% para aprovação.</p>
        <p className="text-5xl font-bold mb-6">{score} <span className="text-3xl text-muted-foreground">/ {total}</span></p>

         <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                >
                </Pie>
                 <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-mt-2"
                />
            </PieChart>
        </ChartContainer>
        
        <p className="text-muted-foreground mt-6">Estude um pouco mais e tente novamente!</p>
        <Button onClick={onRestart} className="mt-6">
          <RotateCcw className="mr-2" />
          Tentar Novamente
        </Button>
      </CardContent>
    </Card>
  );
}


export default function EvaluationPage() {
  const [quizState, setQuizState] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [shuffledQuestions, setShuffledQuestions] = useState<RefrigerationQuestion[]>([]);

  const startQuiz = () => {
    setShuffledQuestions(shuffleArray(refrigerationQuestions).slice(0, 20));
    setUserAnswers({});
    setQuizState('in_progress');
  };
  
  const handleQuizComplete = (answers: Record<string, string>) => {
    setUserAnswers(answers);
    setQuizState('completed');
  };

  const score = useMemo(() => {
    return shuffledQuestions.reduce((correctCount, question) => {
      if (userAnswers[question.id] === question.correctAnswer) {
        return correctCount + 1;
      }
      return correctCount;
    }, 0);
  }, [userAnswers, shuffledQuestions]);

  const passingScore = shuffledQuestions.length * 0.8;
  const isApproved = score >= passingScore;

  if (quizState === 'not_started') {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Avaliação de Qualificação em Refrigeração</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Teste seus conhecimentos para garantir que você está afiado com as melhores práticas em refrigeração.
          Responda 20 perguntas e receba seu certificado de qualificação.
        </p>
        <Button size="lg" onClick={startQuiz}>
          Iniciar Avaliação
        </Button>
      </div>
    );
  }

  if (quizState === 'in_progress') {
    return <QuizView questions={shuffledQuestions} onComplete={handleQuizComplete} />;
  }

  if (quizState === 'completed') {
    if (isApproved) {
        return <CertificateView score={score} total={shuffledQuestions.length} onRestart={startQuiz} />;
    } else {
        return <ResultsView score={score} total={shuffledQuestions.length} onRestart={startQuiz} />;
    }
  }

  return null;
}
