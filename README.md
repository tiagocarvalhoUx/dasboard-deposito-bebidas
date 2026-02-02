# 🍺 Dashboard Depósito de Bebidas

Sistema completo de gestão para depósitos de bebidas, com controle de vendas, estoque, relatórios e gerenciamento de usuários.

## 📋 Sobre o Projeto

O **Dashboard Depósito de Bebidas** é uma aplicação web moderna desenvolvida para facilitar a gestão completa de depósitos e distribuidoras de bebidas. O sistema oferece uma interface intuitiva e responsiva para controle de vendas, gerenciamento de estoque, emissão de relatórios detalhados e administração de usuários.

### ✨ Principais Funcionalidades

#### 🏠 Dashboard Principal

- Visão geral do negócio em tempo real
- Métricas de vendas do dia e do mês
- Cards informativos com totais e estatísticas
- Lista de vendas recentes
- Alertas de produtos com estoque baixo
- Indicadores visuais de desempenho

#### 💰 Gestão de Vendas

- Registro rápido de vendas com busca inteligente de produtos
- Suporte a múltiplas formas de pagamento (Dinheiro, Cartão de Crédito/Débito, PIX, À Prazo)
- Cálculo automático de subtotais, totais e troco
- Registro de informações do cliente (nome e telefone)
- Histórico completo de vendas
- Visualização detalhada de cada venda
- Sistema de numeração automática de vendas
- Campo para observações adicionais

#### 📦 Controle de Estoque

- Cadastro completo de produtos
- Categorização de produtos (Cerveja, Refrigerante, Água, Vinho, Destilado, Energético, Suco, Outros)
- Controle de estoque mínimo com alertas visuais
- Gestão de múltiplas unidades de medida (Unidade, Pack, Caixa, Garrafa, Lata, Litro)
- Registro de preço de custo e preço de venda
- Informações de fornecedores
- Ativação/desativação de produtos
- Busca e filtros avançados
- Atualização automática de estoque após vendas

#### 📊 Relatórios e Análises

- Filtros por período (data início e fim)
- Relatório de vendas detalhado
- Análise de vendas por forma de pagamento
- Vendas por dia com totais e quantidades
- Produtos mais vendidos com rankings
- Relatório de estoque completo
- Exportação para Excel com múltiplos formatos:
  - Relatório de vendas
  - Relatório de estoque
  - Relatório completo (vendas + estoque)
- Métricas de ticket médio
- Indicadores de desempenho

#### 👥 Gerenciamento de Usuários

- Criação e edição de usuários
- Dois níveis de acesso:
  - **Admin**: Acesso completo ao sistema
  - **Vendedor**: Acesso às funcionalidades de venda
- Ativação/desativação de usuários
- Integração com Firebase Authentication
- Controle de permissões por rota

#### 🔐 Segurança e Autenticação

- Sistema de login seguro com Firebase Authentication
- Rotas protegidas por autenticação
- Controle de acesso baseado em perfis
- Página de configuração inicial para primeiro acesso

## 🚀 Tecnologias Utilizadas

### Core

- **React 19.2.0** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.9.3** - Superset do JavaScript com tipagem estática
- **Vite 7.2.4** - Build tool e dev server ultrarrápido

### UI e Estilização

- **Tailwind CSS 3.4.19** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e sem estilo
- **Lucide React** - Ícones modernos e consistentes
- **Recharts 2.15.4** - Biblioteca de gráficos para React
- **Sonner** - Notificações toast elegantes
- **class-variance-authority** - Gerenciamento de variantes de componentes

### Backend e Banco de Dados

- **Firebase 12.8.0** - Plataforma completa de desenvolvimento
  - Firebase Authentication - Autenticação de usuários
  - Cloud Firestore - Banco de dados NoSQL em tempo real
  - Firebase Storage - Armazenamento de arquivos
  - Firebase Analytics - Análise de uso

### Roteamento e Navegação

- **React Router DOM 7.13.0** - Roteamento declarativo para React

### Formulários e Validação

- **React Hook Form 7.70.0** - Gerenciamento de formulários performático
- **Zod 4.3.5** - Validação de schemas TypeScript-first
- **@hookform/resolvers** - Integrações de validação para React Hook Form

### Utilitários

- **date-fns 4.1.0** - Manipulação de datas moderna
- **xlsx 0.18.5** - Leitura e escrita de arquivos Excel
- **clsx** - Utilitário para construção de className condicionais
- **tailwind-merge** - Merge inteligente de classes do Tailwind

### Desenvolvimento

- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** - Ferramenta para transformar CSS
- **Autoprefixer** - Plugin PostCSS para adicionar vendor prefixes

## 📁 Estrutura do Projeto

```
Dashboard-Deposito-Bebidas/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── auth/           # Componentes de autenticação
│   │   │   └── PrivateRoute.tsx
│   │   ├── dashboard/      # Componentes do dashboard
│   │   │   └── Layout.tsx
│   │   └── ui/             # Componentes de interface (Radix UI)
│   ├── contexts/           # Contexts do React
│   │   └── AuthContext.tsx # Gerenciamento de autenticação
│   ├── firebase/           # Configuração do Firebase
│   │   └── config.ts
│   ├── hooks/              # Custom hooks
│   │   ├── useDashboard.ts # Hook para métricas do dashboard
│   │   ├── useFirebase.ts  # Hook para operações do Firestore
│   │   └── use-mobile.ts   # Hook para detecção mobile
│   ├── lib/                # Bibliotecas e utilitários
│   │   └── utils.ts        # Funções utilitárias
│   ├── pages/              # Páginas da aplicação
│   │   ├── Dashboard.tsx   # Página principal
│   │   ├── Vendas.tsx      # Gestão de vendas
│   │   ├── Estoque.tsx     # Controle de estoque
│   │   ├── Relatorios.tsx  # Relatórios e análises
│   │   ├── Usuarios.tsx    # Gerenciamento de usuários
│   │   ├── Login.tsx       # Tela de login
│   │   └── Configuracao.tsx # Configuração inicial
│   ├── types/              # Definições de tipos TypeScript
│   │   └── index.ts
│   ├── utils/              # Funções utilitárias
│   │   ├── dateHelpers.ts  # Helpers para datas
│   │   ├── excelExport.ts  # Exportação para Excel
│   │   └── seedData.ts     # Dados iniciais
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Ponto de entrada
├── components.json         # Configuração de componentes
├── tailwind.config.js      # Configuração Tailwind CSS
├── vite.config.ts          # Configuração Vite
├── tsconfig.json           # Configuração TypeScript
└── package.json            # Dependências do projeto
```

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Firebase

### Passo a Passo

1. **Clone o repositório**

```bash
git clone [url-do-repositorio]
cd Dashboard-Deposito-Bebidas
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative o Authentication (Email/Password)
   - Ative o Cloud Firestore
   - Copie as credenciais do Firebase
   - Atualize o arquivo `src/firebase/config.ts` com suas credenciais

4. **Execute o projeto**

```bash
npm run dev
```

5. **Acesse a aplicação**
   - Abra o navegador em `http://localhost:5173`
   - Na primeira execução, acesse `/configuracao` para criar o usuário administrador

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:

- 💻 Desktop (1920px+)
- 💻 Laptop (1366px - 1920px)
- 📱 Tablet (768px - 1366px)
- 📱 Mobile (320px - 768px)

## 🔑 Credenciais Padrão

Após a configuração inicial, você pode criar usuários através da página de gerenciamento de usuários.

**Importante**: O primeiro usuário deve ser criado através da página `/configuracao` e será automaticamente definido como administrador.

## 📊 Estrutura de Dados

### Coleções no Firestore

**usuarios**

- id, email, nome, perfil (admin/vendedor), ativo, createdAt

**produtos**

- id, codigo, nome, categoria, precoCusto, precoVenda, quantidadeEstoque, quantidadeMinima, unidade, fornecedor, ativo, createdAt, updatedAt

**vendas**

- id, numero, clienteNome, clienteTelefone, itens[], subtotal, desconto, total, formaPagamento, status, vendedorId, vendedorNome, observacoes, dataVenda, createdAt

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Sinta-se à vontade para:

1. Fazer um Fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar a gestão de depósitos de bebidas.

---

**Nota**: Este é um sistema completo de gestão. Certifique-se de configurar corretamente as regras de segurança do Firebase antes de colocar em produção.
