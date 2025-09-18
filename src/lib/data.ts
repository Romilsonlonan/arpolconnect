
export type Employee = {
  id: string;
  name: string;
  role: 'Mechanic' | 'Electrician' | 'Assistant' | 'Artificer' | 'Half-Official';
  email: string;
  phone: string;
  supervisorId: string;
  contract: string;
  avatar: string;
};

export type Supervisor = {
  id: string;
  name:string;
  email: string;
  avatar: string;
  region?: string;
};

export type Message = {
  id: string;
  contractName: string;
  supervisor: string;
  contact: string;
  message: string;
  urgency: 'Rotina' | 'Atenção' | 'Crítico';
  status: 'Em andamento' | 'Finalizado';
  author: string;
  createdAt: string;
  visibility: 'publico' | 'privado';
  recipientId?: string;

  // Optional technical fields
  equipmentName?: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  cause?: string;
};


export type OrgNode = {
  id: string;
  name: string;
  role: 'Empresa' | 'Diretor' | 'Gerente' | 'Coordenador' | 'Supervisor' | string;
  contact?: string;
  contract?: string;
  avatar: string;
  showInNeuralNet?: boolean;
  children?: OrgNode[];
}

export type ContractDocument = {
    id: string;
    name: string;
    description: string;
    fileUrl: string; // Could be a data URL or a path to a stored file
    fileName: string;
    fileType: string;
    uploadedAt: string;
    revisedAt?: string;
}

export type Contract = {
    id: string;
    name: string;
    supervisorId: string;
    supervisorName: string;
    address: string;
    region: string;
    backgroundImage: string;
    status: 'Ativo' | 'Inativo';
    documents?: ContractDocument[];
    documentType?: string;
    docStartDate?: string;
    docEndDate?: string;
}

export type RefrigerationQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  image: string;
  imageHint: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Supervisor' | 'Mecânico' | 'Visualizador';
  status: 'Ativo' | 'Inativo';
  permissions: {
    canViewAllContracts: boolean;
    allowedContractIds: string[];
  };
};

export type SupervisorCardData = {
    id: string;
    name: string;
    role: string;
    avatarUrl: string;
}

export type ReportCover = {
    id: string;
    type: 'cover' | 'motivational' | 'supervisors' | 'supervisor-report';
    title: string;
    subtitle: string;
    imageUrl: string;
    // Motivational fields
    quote?: string;
    quoteAuthor?: string;
    characterImageUrl?: string;
    // Supervisors page fields
    supervisors?: SupervisorCardData[];
    // Supervisor-report fields
    supervisorName?: string;
    supervisorImageUrl?: string;
};

export const initialUsers: User[] = [
    {
        id: 'admin-1',
        name: 'Romilson Luis',
        email: 'romilson@arpolar.com.br',
        role: 'Administrador',
        status: 'Ativo',
        permissions: {
            canViewAllContracts: true,
            allowedContractIds: [],
        },
    },
];

export const initialOrgTree: OrgNode = {
  id: 'arpolar',
  name: 'Arpolar',
  role: 'Empresa',
  avatar: 'https://i.ibb.co/zVzbGGgD/fundoaqc.jpg',
  showInNeuralNet: false,
  children: []
};


const now = new Date();
export const messages: Message[] = [];

export const refrigerationQuestions: RefrigerationQuestion[] = [
    { id: 'q1', question: 'Qual é a função principal do compressor em um ciclo de refrigeração?', options: ['Evaporar o refrigerante', 'Condensar o refrigerante', 'Comprimir o vapor do refrigerante', 'Expandir o refrigerante líquido'], correctAnswer: 'Comprimir o vapor do refrigerante', image: 'https://picsum.photos/800/400?random=1', imageHint: 'refrigeration compressor' },
    { id: 'q2', question: 'O que a válvula de expansão controla?', options: ['A temperatura do compressor', 'O fluxo de refrigerante para o evaporador', 'A pressão no condensador', 'A velocidade do ventilador'], correctAnswer: 'O fluxo de refrigerante para o evaporador', image: 'https://picsum.photos/800/400?random=2', imageHint: 'expansion valve' },
    { id: 'q3', question: 'Em qual componente do ciclo de refrigeração o refrigerante muda de gás para líquido?', options: ['Evaporador', 'Compressor', 'Condensador', 'Válvula de expansão'], correctAnswer: 'Condensador', image: 'https://picsum.photos/800/400?random=3', imageHint: 'condenser coils' },
    { id: 'q4', question: 'Qual é o propósito do evaporador?', options: ['Liberar calor para o ambiente', 'Absorver calor do ambiente a ser resfriado', 'Aumentar a pressão do refrigerante', 'Filtrar o refrigerante'], correctAnswer: 'Absorver calor do ambiente a ser resfriado', image: 'https://picsum.photos/800/400?random=4', imageHint: 'evaporator unit' },
    { id: 'q5', question: 'O que significa a sigla PMOC?', options: ['Plano de Manutenção, Operação e Controle', 'Procedimento de Montagem e Operação de Compressores', 'Plano Mestre de Obras e Construção', 'Programa de Melhoria contínua'], correctAnswer: 'Plano de Manutenção, Operação e Controle', image: 'https://picsum.photos/800/400?random=5', imageHint: 'air conditioning maintenance' },
    { id: 'q6', question: 'Qual dos seguintes refrigerantes tem o menor Potencial de Aquecimento Global (GWP)?', options: ['R-22', 'R-410A', 'R-32', 'R-290 (Propano)'], correctAnswer: 'R-290 (Propano)', image: 'https://picsum.photos/800/400?random=6', imageHint: 'eco friendly' },
    { id: 'q7', question: 'O que é "superaquecimento" em um sistema de refrigeração?', options: ['O aquecimento do compressor acima do normal', 'A temperatura do vapor na saída do evaporador acima da sua temperatura de saturação', 'O superaquecimento do ambiente', 'A temperatura do líquido na entrada da válvula de expansão'], correctAnswer: 'A temperatura do vapor na saída do evaporador acima da sua temperatura de saturação', image: 'https://picsum.photos/800/400?random=7', imageHint: 'temperature gauge' },
    { id: 'q8', question: 'O que é "sub-resfriamento"?', options: ['Resfriar o ambiente abaixo de zero', 'Resfriar o compressor', 'A temperatura do líquido na saída do condensador abaixo da sua temperatura de saturação', 'A baixa temperatura do evaporador'], correctAnswer: 'A temperatura do líquido na saída do condensador abaixo da sua temperatura de saturação', image: 'https://picsum.photos/800/400?random=8', imageHint: 'refrigerant lines' },
    { id: 'q9', question: 'Qual ferramenta é usada para medir a pressão em um sistema de refrigeração?', options: ['Termômetro', 'Manifold', 'Anemômetro', 'Multímetro'], correctAnswer: 'Manifold', image: 'https://picsum.photos/800/400?random=9', imageHint: 'hvac manifold gauge' },
    { id: 'q10', question: 'A falta de refrigerante em um sistema tipicamente causa:', options: ['Alta pressão de sucção', 'Baixo superaquecimento', 'Congelamento do evaporador', 'Baixa pressão de sucção e alto superaquecimento'], correctAnswer: 'Baixa pressão de sucção e alto superaquecimento', image: 'https://picsum.photos/800/400?random=10', imageHint: 'ice frozen pipes' },
    { id: 'q11', question: 'Qual é a função do filtro secador?', options: ['Aumentar a pressão do sistema', 'Remover umidade e impurezas do refrigerante', 'Resfriar o óleo do compressor', 'Aquecer o refrigerante'], correctAnswer: 'Remover umidade e impurezas do refrigerante', image: 'https://picsum.photos/800/400?random=11', imageHint: 'filter drier' },
    { id: 'q12', question: 'Em um sistema de ar condicionado, onde o filtro de ar é geralmente localizado?', options: ['Na unidade condensadora (externa)', 'Na tubulação de descarga', 'No retorno de ar da unidade evaporadora (interna)', 'Junto ao termostato'], correctAnswer: 'No retorno de ar da unidade evaporadora (interna)', image: 'https://picsum.photos/800/400?random=12', imageHint: 'air filter' },
    { id: 'q13', question: 'O que é um sistema "Inverter"?', options: ['Um sistema que inverte o fluxo de ar', 'Um sistema que usa um compressor de velocidade variável', 'Um sistema que só funciona no modo de aquecimento', 'Um sistema sem unidade externa'], correctAnswer: 'Um sistema que usa um compressor de velocidade variável', image: 'https://picsum.photos/800/400?random=13', imageHint: 'inverter technology board' },
    { id: 'q14', question: 'Qual procedimento deve ser feito antes de adicionar carga de refrigerante a um sistema?', options: ['Desligar o disjuntor', 'Fazer vácuo no sistema', 'Limpar o condensador', 'Verificar o termostato'], correctAnswer: 'Fazer vácuo no sistema', image: 'https://picsum.photos/800/400?random=14', imageHint: 'vacuum pump' },
    { id: 'q15', question: 'O que o ciclo de degelo em uma bomba de calor faz?', options: ['Aquece o ambiente interno', 'Remove o gelo acumulado na unidade externa', 'Resfria o compressor', 'Limpa os filtros de ar'], correctAnswer: 'Remove o gelo acumulado na unidade externa', image: 'https://picsum.photos/800/400?random=15', imageHint: 'heat pump defrost' },
    { id: 'q16', question: 'Qual a principal causa de um compressor "queimar"?', options: ['Falta de limpeza do filtro', 'Termostato desregulado', 'Retorno de refrigerante líquido ao compressor', 'Baixa tensão elétrica'], correctAnswer: 'Retorno de refrigerante líquido ao compressor', image: 'https://picsum.photos/800/400?random=16', imageHint: 'damaged compressor' },
    { id: 'q17', question: 'Para que serve a "bomba de vácuo" na manutenção de refrigeração?', options: ['Para limpar a tubulação com água', 'Para testar a pressão do sistema', 'Para remover ar e umidade do sistema', 'Para injetar óleo no compressor'], correctAnswer: 'Para remover ar e umidade do sistema', image: 'https://picsum.photos/800/400?random=17', imageHint: 'hvac vacuum' },
    { id: 'q18', question: 'Qual a unidade de medida para capacidade de refrigeração, comumente usada no Brasil?', options: ['Watts', 'Cavalos de Potência (HP)', 'BTU/h (Unidade Térmica Britânica por hora)', 'Joules'], correctAnswer: 'BTU/h (Unidade Térmica Britânica por hora)', image: 'https://picsum.photos/800/400?random=18', imageHint: 'air conditioner unit' },
    { id: 'q19', question: 'Um ventilador do condensador que não funciona pode causar:', options: ['Baixa pressão de descarga', 'Alta pressão de descarga e superaquecimento do compressor', 'Congelamento da linha de sucção', 'Operação normal do sistema'], correctAnswer: 'Alta pressão de descarga e superaquecimento do compressor', image: 'https://picsum.photos/800/400?random=19', imageHint: 'fan motor' },
    { id: 'q20', question: 'O que indica a presença de óleo nas conexões da tubulação?', options: ['Operação normal', 'Excesso de óleo no sistema', 'Um vazamento de refrigerante', 'Filtro secador saturado'], correctAnswer: 'Um vazamento de refrigerante', image: 'https://picsum.photos/800/400?random=20', imageHint: 'oil leak pipe' },
];



    
