# Plano de Implementação: Arpolar Connect

Este documento serve como um checklist e registro de todas as funcionalidades, estruturas e lógicas implementadas no sistema Arpolar Connect até o momento.

## 1. Estrutura e Tecnologias Base

- [x] **Framework Principal:** Next.js com App Router.
- [x] **Linguagem:** TypeScript para tipagem estática e segurança.
- [x] **Estilização:** Tailwind CSS para estilização utilitária.
- [x] **Componentes UI:** ShadCN/UI para um conjunto de componentes reusáveis e acessíveis.
- [x] **Inteligência Artificial:** Genkit para integração com modelos de linguagem do Google (Gemini).
- [x] **Armazenamento de Dados:** Utilização do `localStorage` do navegador como solução de persistência de dados no lado do cliente.

## 2. Layout e Navegação Principal

- [x] **Layout Consistente:** Criação de um layout principal (`(main)/layout.tsx`) com uma barra de navegação lateral (Sidebar) e um cabeçalho.
- [x] **Sidebar Dinâmica:** A barra lateral é expansível e retrátil, salvando o estado de preferência do usuário.
- [x] **Navegação Centralizada:** Links para todas as seções principais do sistema:
    - [x] Painel de Tickets
    - [x] Tickets por Responsável
    - [x] Organograma
    - [x] Diretório
    - [x] Contratos
    - [x] Avaliação
    - [x] DDS Info
    - [x] Suporte IA
- [x] **Menu de Usuário:** Dropdown no cabeçalho com acesso à página de "Configurações".

## 3. Funcionalidades Implementadas

### 3.1. Gestão de Contratos (`/contracts`)

- [x] **Visualização em Grid:** Exibição de todos os contratos em formato de cards.
- [x] **Adição de Contratos:** Modal para cadastrar novos contratos com nome, supervisor, endereço, região e imagem de fundo.
- [x] **Edição de Contratos:** Funcionalidade para editar as informações de um contrato existente.
- [x] **Exclusão de Contratos:** Botão para deletar um contrato com diálogo de confirmação, removendo-o também do organograma.

### 3.2. Organograma Dinâmico (`/organograma`)

- [x] **Visualização Hierárquica:** Representação visual da estrutura da empresa.
- [x] **Manipulação de Nós (Funcionários):**
    - [x] Adicionar, editar e remover funcionários diretamente na árvore.
    - [x] Sistema de drag-and-drop para reatribuir funcionários a diferentes supervisores.
- [x] **Integração de Contratos:**
    - [x] Contratos são adicionados como nós especiais sob o supervisor responsável.
    - [x] Permite visualizar a estrutura de gestão de contratos diretamente no organograma.
- [x] **Criação de Tickets:** Atalho em cada nó de funcionário para abrir um modal e criar um novo ticket de serviço.
- [x] **Atalhos de Comunicação:** Ícones para iniciar uma conversa por **E-mail** ou **WhatsApp** com um clique.
- [x] **Controle de Visibilidade:** Opção para mostrar ou ocultar supervisores na "Rede Neural de Supervisores" do dashboard.

### 3.3. Diretório de Funcionários (`/directory`)

- [x] **Listagem Completa:** Exibe todos os funcionários cadastrados, agrupados por supervisor.
- [x] **Busca e Filtragem:** Campo de pesquisa para encontrar funcionários por nome, cargo ou contrato.
- [x] **Gerenciamento Completo:** Funcionalidades para adicionar, editar e remover funcionários.

### 3.4. Painel de Tickets (`/dashboard`)

- [x] **Cards de Resumo:** Indicadores visuais para o total de tickets por status (Rotina, Alerta, Crítico, Finalizado).
- [x] **Rede Neural de Supervisores:** Visualização interativa e centralizada dos supervisores.
- [x] **Filtragem Dinâmica:** Filtra os contratos e tickets exibidos com base no supervisor selecionado na rede.
- [x] **Painel de Tickets Públicos:** Exibe todos os tickets que não são privados, com sistema de drag-and-drop para reordenar.

### 3.5. Tickets por Responsável (`/tickets`)

- [x] **Visualização Agrupada:** Exibe todos os tickets agrupados pelo funcionário que os criou.
- [x] **Limite de Visualização:** Mostra até 8 tickets por responsável, com um botão para futura expansão ("Ver Todos").
- [x] **Ações Rápidas:** Permite criar um novo ticket ou deletar tickets existentes diretamente da página.

### 3.6. Suporte com Inteligência Artificial (`/support`)

- [x] **Interface de Chat:** Página com um chat interativo para consultas técnicas.
- [x] **Fluxo de IA (Genkit):** Implementação de um fluxo de IA configurado para atuar como um engenheiro de suporte técnico sênior da Arpolar.
- [x] **Conexão com API:** Configuração segura da chave de API do Google para autenticar as chamadas ao modelo de linguagem.

### 3.7. Configurações da Conta (`/settings`)

- [x] **Gerenciamento de Perfil:** Campos para o usuário atualizar seu nome, e-mail e telefone.
- [x] **Troca de Foto de Perfil:** Funcionalidade para carregar e salvar uma nova imagem de avatar.
- [x] **Personalização de Tema:** Seleção de diferentes paletas de cores (Padrão, Oceano, Floresta, Grafite, Vibrante, Solar) para customizar a aparência do aplicativo.
- [x] **Sincronização em Tempo Real:** Alterações de foto e nome são refletidas instantaneamente no layout principal sem necessidade de recarregar a página.

### 3.8. Páginas Adicionais

- [x] **Avaliação de Qualificação (`/evaluation`):** Quiz interativo para avaliar o conhecimento técnico dos funcionários, com geração de certificado em caso de aprovação.
- [x] **DDS Info Center (`/dds-info`):** Central para gerenciamento de Diálogos Diários de Segurança, incluindo comunicados, controle de presença e repositório de arquivos.
- [x] **Login (`/`):** Página de entrada inicial do sistema.
- [x] **Registro de Presença (`/live-presence`):** Página pública para que os participantes de lives de DDS possam registrar sua presença.
