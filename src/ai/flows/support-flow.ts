
'use server';
/**
 * @fileOverview Um agente de IA para suporte técnico de ar-condicionado.
 *
 * - technicalSupport - Uma função que responde a perguntas técnicas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const prompt = `Você é um engenheiro de suporte técnico sênior da Arpolar, uma empresa líder em sistemas de refrigeração e ar-condicionado. Sua especialidade é diagnosticar problemas complexos, fornecer instruções passo a passo para reparos, explicar conceitos técnicos e recomendar as melhores práticas de manutenção.

Responda à seguinte pergunta do usuário de forma clara, precisa e profissional. Use uma linguagem técnica apropriada, mas explique termos complexos quando necessário. Se possível, estruture sua resposta com listas ou etapas para facilitar o entendimento.

Pergunta do Usuário: {{prompt}}
`;

export async function technicalSupport(input: string): Promise<string> {
  const response = await ai.generate({
    prompt: prompt,
    history: [],
    input: {
        prompt: input,
    }
  });

  return response.text;
}

