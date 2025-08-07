
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
  title: string;
  content: string;
  author: string;
  createdAt: string;
  status: 'new' | 'in_progress' | 'resolved';
};

export type OrgNode = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  children?: OrgNode[];
}

export const supervisors: Supervisor[] = [
  { id: 'sup1', name: 'Carlos Ferreira', email: 'carlos.f@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região A' },
  { id: 'sup2', name: 'Beatriz Costa', email: 'beatriz.c@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região A' },
  { id: 'sup3', name: 'Ricardo Almeida', email: 'ricardo.a@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região B' },
  { id: 'sup4', name: 'Mariana Gonçalves', email: 'mariana.g@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região C' },
  { id: 'sup5', name: 'Lucas Ribeiro', email: 'lucas.r@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região C' },
  { id: 'sup6', name: 'Júlia Castro', email: 'julia.c@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região D' },
  { id: 'sup7', name: 'Felipe Santos', email: 'felipe.s@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região D' },
  { id: 'sup8', name: 'Letícia Martins', email: 'leticia.m@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região E' },
  { id: 'sup9', name: 'Guilherme Nogueira', email: 'guilherme.n@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região E' },
  { id: 'sup10', name: 'Isabela Fernandes', email: 'isabela.f@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região F' },
  { id: 'sup11', name: 'Rafael Azevedo', email: 'rafael.a@arpolar.com', avatar: 'https://placehold.co/100x100', region: 'Região F' },
];

export const employees: Employee[] = [
  { id: 'emp1', name: 'João Silva', role: 'Mechanic', email: 'joao.silva@contractor.com', phone: '(11) 98765-4321', supervisorId: 'sup1', contract: 'Contract A', avatar: 'https://placehold.co/100x100' },
  { id: 'emp2', name: 'Maria Oliveira', role: 'Electrician', email: 'maria.o@contractor.com', phone: '(11) 98765-4322', supervisorId: 'sup1', contract: 'Contract A', avatar: 'https://placehold.co/100x100' },
  { id: 'emp3', name: 'Pedro Santos', role: 'Assistant', email: 'pedro.s@contractor.com', phone: '(11) 98765-4323', supervisorId: 'sup2', contract: 'Contract B', avatar: 'https://placehold.co/100x100' },
  { id: 'emp4', name: 'Ana Souza', role: 'Artificer', email: 'ana.s@contractor.com', phone: '(11) 98765-4324', supervisorId: 'sup3', contract: 'Contract C', avatar: 'https://placehold.co/100x100' },
  { id: 'emp5', name: 'Lucas Pereira', role: 'Mechanic', email: 'lucas.p@contractor.com', phone: '(11) 98765-4325', supervisorId: 'sup4', contract: 'Contract D', avatar: 'https://placehold.co/100x100' },
  { id: 'emp6', name: 'Juliana Lima', role: 'Half-Official', email: 'juliana.l@contractor.com', phone: '(11) 98765-4326', supervisorId: 'sup5', contract: 'Contract E', avatar: 'https://placehold.co/100x100' },
  { id: 'emp7', name: 'Bruno Alves', role: 'Mechanic', email: 'bruno.a@contractor.com', phone: '(11) 98765-4327', supervisorId: 'sup6', contract: 'Contract F', avatar: 'https://placehold.co/100x100' },
  { id: 'emp8', name: 'Carla Dias', role: 'Electrician', email: 'carla.d@contractor.com', phone: '(11) 98765-4328', supervisorId: 'sup7', contract: 'Contract G', avatar: 'https://placehold.co/100x100' },
  { id: 'emp9', name: 'Diego Rocha', role: 'Assistant', email: 'diego.r@contractor.com', phone: '(11) 98765-4329', supervisorId: 'sup8', contract: 'Contract H', avatar: 'https://placehold.co/100x100' },
  { id: 'emp10', name: 'Eduarda Cunha', role: 'Artificer', email: 'eduarda.c@contractor.com', phone: '(11) 98765-4330', supervisorId: 'sup9', contract: 'Contract I', avatar: 'https://placehold.co/100x100' },
  { id: 'emp11', name: 'Fernanda Barbosa', role: 'Mechanic', email: 'fernanda.b@contractor.com', phone: '(11) 98765-4331', supervisorId: 'sup10', contract: 'Contract J', avatar: 'https://placehold.co/100x100' },
  { id: 'emp12', name: 'Gustavo Gomes', role: 'Half-Official', email: 'gustavo.g@contractor.com', phone: '(11) 98765-4332', supervisorId: 'sup11', contract: 'Contract K', avatar: 'https://placehold.co/100x100' },
];


const now = new Date();
export const messages: Message[] = [
  { id: 'msg1', title: 'Urgent: AC Unit Failure at Site A', content: 'The main AC unit at Site A has failed. Need immediate dispatch of a senior mechanic.', author: 'Director A', createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), status: 'new' },
  { id: 'msg2', title: 'Preventive Maintenance Schedule', content: 'Please review and approve the Q3 preventive maintenance schedule for all contracts.', author: 'Coordinator B', createdAt: new Date(now.getTime() - 50 * 60 * 60 * 1000).toISOString(), status: 'in_progress' },
  { id: 'msg3', title: 'Electrical Wiring Issue - Site C', content: 'Reports of flickering lights at Site C. An electrician needs to investigate.', author: 'Supervisor C', createdAt: new Date(now.getTime() - 80 * 60 * 60 * 1000).toISOString(), status: 'in_progress' },
  { id: 'msg4', title: 'Resolved: Client Complaint', content: 'The issue with the thermostat at Contract B has been resolved and the client is satisfied.', author: 'Supervisor A', createdAt: new Date(now.getTime() - 100 * 60 * 60 * 1000).toISOString(), status: 'resolved' },
];

const getEmployeesForContract = (supervisorId: string, contractName: string): OrgNode[] => {
    return employees
        .filter(e => e.supervisorId === supervisorId && e.contract === contractName)
        .map(e => ({
            id: e.id,
            name: e.name,
            role: e.role,
            avatar: e.avatar,
        }));
};

const getContractsForSupervisor = (supervisorId: string): OrgNode[] => {
    const contracts = [...new Set(employees.filter(e => e.supervisorId === supervisorId).map(e => e.contract))];
    return contracts.map(contractName => ({
        id: `${supervisorId}-${contractName}`,
        name: contractName,
        role: 'Contract',
        avatar: 'https://placehold.co/100x100', // Placeholder for contract icon/logo
        children: getEmployeesForContract(supervisorId, contractName),
    }));
};

const getSupervisorsForRegion = (regionName: string): OrgNode[] => {
    return supervisors
        .filter(s => s.region === regionName)
        .map(s => ({
            id: s.id,
            name: s.name,
            role: 'Supervisor',
            avatar: s.avatar,
            children: getContractsForSupervisor(s.id),
        }));
};

const regions: OrgNode[] = [
    { id: 'regA', name: 'Região A', role: 'Region', avatar: 'https://placehold.co/100x100', children: getSupervisorsForRegion('Região A')},
    { id: 'regB', name: 'Região B', role: 'Region', avatar: 'https://placehold.co/100x100', children: getSupervisorsForRegion('Região B')},
    { id: 'regC', name: 'Região C', role: 'Region', avatar: 'https://placehold.co/100x100', children: getSupervisorsForRegion('Região C')},
    { id: 'regD', name: 'Região D', role: 'Region', avatar: 'https://placehold.co/100x100', children: getSupervisorsForRegion('Região D')},
    { id: 'regE', name: 'Região E', role: 'Region', avatar: 'https://placehold.co/100x100', children: getSupervisorsForRegion('Região E')},
    { id: 'regF', name: 'Região F', role: 'Region', avatar: 'https://placehold.co/100x100', children: getSupervisorsForRegion('Região F')},
];

export const organizationTree: OrgNode = {
  id: 'arpolar',
  name: 'Arpolar',
  role: 'Company',
  avatar: 'https://i.ibb.co/xK3VPgL/logo-arpolar.png',
  children: [
    {
      id: 'dirA',
      name: 'Diretor Chefe A',
      role: 'Director',
      avatar: 'https://placehold.co/100x100',
    },
    {
      id: 'dirB',
      name: 'Diretor Chefe B',
      role: 'Director',
      avatar: 'https://placehold.co/100x100',
    },
    {
      id: 'coordA',
      name: 'Coordenador A',
      role: 'Geral - Preventiva',
      avatar: 'https://placehold.co/100x100',
    },
    {
      id: 'coordB',
      name: 'Coordenador B',
      role: 'Contratos',
      avatar: 'https://placehold.co/100x100',
    },
    {
      id: 'coordC',
      name: 'Coordenador C',
      role: 'Corretiva',
      avatar: 'https://placehold.co/100x100',
    },
    {
      id: 'regionRoot',
      name: 'Regiões',
      role: 'Regions',
      avatar: 'https://placehold.co/100x100',
      children: regions,
    }
  ]
};

    