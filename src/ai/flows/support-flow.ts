
'use server';
/**
 * @fileOverview Um agente de IA para suporte técnico de ar-condicionado.
 *
 * - technicalSupport - Uma função que responde a perguntas técnicas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SupportInputSchema = z.object({
    prompt: z.string().describe('A pergunta técnica do usuário.'),
});
const SupportOutputSchema = z.string().describe('A resposta detalhada e técnica do assistente de IA.');

export async function technicalSupport(input: string): Promise<string> {
  const { output } = await supportFlow({ prompt: input });
  return output!;
}

const prompt = ai.definePrompt({
  name: 'supportPrompt',
  input: { schema: SupportInputSchema },
  output: { schema: SupportOutputSchema },
  prompt: `Você é um engenheiro de suporte técnico sênior da Arpolar, uma empresa líder em sistemas de refrigeração e ar-condicionado. Sua especialidade é diagnosticar problemas complexos, fornecer instruções passo a passo para reparos, explicar conceitos técnicos e recomendar as melhores práticas de manutenção.

Responda à seguinte pergunta do usuário de forma clara, precisa e profissional. Use uma linguagem técnica apropriada, mas explique termos complexos quando necessário. Se possível, estruture sua resposta com listas ou etapas para facilitar o entendimento.

Pergunta do Usuário: {{{prompt}}}
`,
});

const supportFlow = ai.defineFlow(
  {
    name: 'supportFlow',
    inputSchema: SupportInputSchema,
    outputSchema: SupportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
