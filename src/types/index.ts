export interface Usuario {
  id: string;
  email: string;
  nome: string;
  perfil: 'admin' | 'vendedor';
  ativo: boolean;
  createdAt: Date;
}

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque: number;
  quantidadeMinima: number;
  unidade: string;
  fornecedor: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemVenda {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Venda {
  id: string;
  numero: string;
  clienteNome: string;
  clienteTelefone?: string;
  itens: ItemVenda[];
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'prazo';
  status: 'concluida' | 'pendente' | 'cancelada';
  vendedorId: string;
  vendedorNome: string;
  observacoes?: string;
  dataVenda: Date;
  createdAt: Date;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
}

export interface DashboardMetrics {
  vendasHoje: number;
  vendasMes: number;
  totalVendasHoje: number;
  totalVendasMes: number;
  produtosEstoqueBaixo: number;
  totalProdutos: number;
}

export interface RelatorioFiltros {
  dataInicio: Date;
  dataFim: Date;
  categoria?: string;
  vendedor?: string;
  formaPagamento?: string;
}
