import { useDashboard } from '@/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { 
  ShoppingCart, 
  Package, 
  DollarSign,
  AlertTriangle,
  Calendar,
  ExternalLink,
  Plus,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { metrics, vendasRecentes, produtosBaixoEstoque, loading } = useDashboard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Métricas Principais - Cards Maiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Vendas Hoje
            </CardTitle>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-6 h-6 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold truncate">{metrics.vendasHoje}</div>
            <p className="text-sm text-slate-600 mt-2 font-medium truncate">
              {formatCurrency(metrics.totalVendasHoje)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Vendas do Mês
            </CardTitle>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold truncate">{metrics.vendasMes}</div>
            <p className="text-sm text-slate-600 mt-2 font-medium truncate">
              {formatCurrency(metrics.totalVendasMes)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 truncate">
              Total em Vendas (Mês)
            </CardTitle>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 truncate">
              {formatCurrency(metrics.totalVendasMes)}
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium truncate">
              Ticket médio: {metrics.vendasMes > 0 
                ? formatCurrency(metrics.totalVendasMes / metrics.vendasMes) 
                : formatCurrency(0)}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 hover:shadow-lg transition-shadow overflow-hidden ${metrics.produtosEstoqueBaixo > 0 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Estoque Baixo
            </CardTitle>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              metrics.produtosEstoqueBaixo > 0 ? 'bg-red-100' : 'bg-emerald-100'
            }`}>
              <Package className={`w-6 h-6 ${
                metrics.produtosEstoqueBaixo > 0 ? 'text-red-600' : 'text-emerald-600'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold truncate">{metrics.produtosEstoqueBaixo}</div>
            <p className="text-sm text-slate-600 mt-2 font-medium truncate">
              de {metrics.totalProdutos} produtos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Estoque */}
      {produtosBaixoEstoque.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {produtosBaixoEstoque.slice(0, 5).map((produto) => (
                <div 
                  key={produto.id} 
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100"
                >
                  <div>
                    <p className="font-medium text-slate-900">{produto.nome}</p>
                    <p className="text-sm text-slate-500">Código: {produto.codigo}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-1">
                      {produto.quantidadeEstoque} unidades
                    </Badge>
                    <p className="text-xs text-slate-500">
                      Mínimo: {produto.quantidadeMinima}
                    </p>
                  </div>
                </div>
              ))}
              {produtosBaixoEstoque.length > 5 && (
                <p className="text-sm text-red-600 text-center">
                  +{produtosBaixoEstoque.length - 5} produtos com estoque baixo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {vendasRecentes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma venda registrada recentemente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Nº</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Pagamento</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasRecentes.map((venda) => (
                    <tr key={venda.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm">{venda.numero}</td>
                      <td className="py-3 px-4 text-sm">{venda.clienteNome}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatarFormaPagamento(venda.formaPagamento)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium">
                        {formatCurrency(venda.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusBadgeClass(venda.status)}>
                          {formatarStatus(venda.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatarFormaPagamento(forma: string): string {
  const map: Record<string, string> = {
    'dinheiro': 'Dinheiro',
    'cartao_credito': 'Cartão Crédito',
    'cartao_debito': 'Cartão Débito',
    'pix': 'PIX',
    'prazo': 'A Prazo'
  };
  return map[forma] || forma;
}

function formatarStatus(status: string): string {
  const map: Record<string, string> = {
    'concluida': 'Concluída',
    'pendente': 'Pendente',
    'cancelada': 'Cancelada'
  };
  return map[status] || status;
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'concluida':
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
    case 'pendente':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    case 'cancelada':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}
