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
  coordinatorId: string;
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
  { id: 'sup1', name: 'Carlos Ferreira', email: 'carlos.f@arpolar.com', avatar: 'https://placehold.co/100x100', coordinatorId: 'coord1' },
  { id: 'sup2', name: 'Beatriz Costa', email: 'beatriz.c@arpolar.com', avatar: 'https://placehold.co/100x100', coordinatorId: 'coord1' },
  { id: 'sup3', name: 'Ricardo Almeida', email: 'ricardo.a@arpolar.com', avatar: 'https://placehold.co/100x100', coordinatorId: 'coord2' },
];

export const employees: Employee[] = [
  { id: 'emp1', name: 'João Silva', role: 'Mechanic', email: 'joao.silva@contractor.com', phone: '(11) 98765-4321', supervisorId: 'sup1', contract: 'Contract A', avatar: 'https://placehold.co/100x100' },
  { id: 'emp2', name: 'Maria Oliveira', role: 'Electrician', email: 'maria.o@contractor.com', phone: '(11) 98765-4322', supervisorId: 'sup1', contract: 'Contract A', avatar: 'https://placehold.co/100x100' },
  { id: 'emp3', name: 'Pedro Santos', role: 'Assistant', email: 'pedro.s@contractor.com', phone: '(11) 98765-4323', supervisorId: 'sup2', contract: 'Contract B', avatar: 'https://placehold.co/100x100' },
  { id: 'emp4', name: 'Ana Souza', role: 'Artificer', email: 'ana.s@contractor.com', phone: '(11) 98765-4324', supervisorId: 'sup3', contract: 'Contract C', avatar: 'https://placehold.co/100x100' },
  { id: 'emp5', name: 'Lucas Pereira', role: 'Mechanic', email: 'lucas.p@contractor.com', phone: '(11) 98765-4325', supervisorId: 'sup1', contract: 'Contract A', avatar: 'https://placehold.co/100x100' },
  { id: 'emp6', name: 'Juliana Lima', role: 'Half-Official', email: 'juliana.l@contractor.com', phone: '(11) 98765-4326', supervisorId: 'sup2', contract: 'Contract B', avatar: 'https://placehold.co/100x100' },
];

const now = new Date();
export const messages: Message[] = [
  { id: 'msg1', title: 'Urgent: AC Unit Failure at Site A', content: 'The main AC unit at Site A has failed. Need immediate dispatch of a senior mechanic.', author: 'Director A', createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), status: 'new' },
  { id: 'msg2', title: 'Preventive Maintenance Schedule', content: 'Please review and approve the Q3 preventive maintenance schedule for all contracts.', author: 'Coordinator B', createdAt: new Date(now.getTime() - 50 * 60 * 60 * 1000).toISOString(), status: 'in_progress' },
  { id: 'msg3', title: 'Electrical Wiring Issue - Site C', content: 'Reports of flickering lights at Site C. An electrician needs to investigate.', author: 'Supervisor C', createdAt: new Date(now.getTime() - 80 * 60 * 60 * 1000).toISOString(), status: 'in_progress' },
  { id: 'msg4', title: 'Resolved: Client Complaint', content: 'The issue with the thermostat at Contract B has been resolved and the client is satisfied.', author: 'Supervisor A', createdAt: new Date(now.getTime() - 100 * 60 * 60 * 1000).toISOString(), status: 'resolved' },
];


export const organizationTree: OrgNode = {
  id: 'arpolar',
  name: 'Arpolar',
  role: 'Company',
  avatar: 'https://placehold.co/100x100',
  children: [
    {
      id: 'dir1',
      name: 'Diretor Chefe',
      role: 'Director',
      avatar: 'https://placehold.co/100x100',
      children: [
        {
          id: 'coord1',
          name: 'Fernanda Lima',
          role: 'Coordinator',
          avatar: 'https://placehold.co/100x100',
          children: supervisors.filter(s => s.coordinatorId === 'coord1').map(s => ({
            id: s.id,
            name: s.name,
            role: 'Supervisor',
            avatar: s.avatar,
            children: employees.filter(e => e.supervisorId === s.id).map(e => ({
                id: e.id,
                name: e.name,
                role: e.role,
                avatar: e.avatar,
            }))
          }))
        },
        {
          id: 'coord2',
          name: 'Gustavo Martins',
          role: 'Coordinator',
          avatar: 'https://placehold.co/100x100',
          children: supervisors.filter(s => s.coordinatorId === 'coord2').map(s => ({
            id: s.id,
            name: s.name,
            role: 'Supervisor',
            avatar: s.avatar,
            children: employees.filter(e => e.supervisorId === s.id).map(e => ({
                id: e.id,
                name: e.name,
                role: e.role,
                avatar: e.avatar,
            }))
          }))
        },
      ]
    }
  ]
};
