import { useState } from "react";
import { useCollection } from "@/hooks/useFirebase";
import type { Venda, Produto, RelatorioFiltros } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileDown,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react";
import { exportarRelatorioExcel } from "@/utils/excelExport";
import { convertFirestoreDate, formatDate } from "@/utils/dateHelpers";

export function Relatorios() {
  const { data: vendas } = useCollection<Venda>("vendas");
  const { data: produtos } = useCollection<Produto>("produtos");

  const [dataInicio, setDataInicio] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [dataFim, setDataFim] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const filtros: RelatorioFiltros = {
    dataInicio: new Date(dataInicio),
    dataFim: new Date(dataFim + "T23:59:59"),
  };

  const vendasFiltradas = vendas.filter((v) => {
    const dataVenda = convertFirestoreDate(v.dataVenda);
    return dataVenda >= filtros.dataInicio && dataVenda <= filtros.dataFim;
  });

  const totalVendas = vendasFiltradas.reduce((sum, v) => sum + v.total, 0);
  const ticketMedio =
    vendasFiltradas.length > 0 ? totalVendas / vendasFiltradas.length : 0;

  const vendasPorFormaPagamento = vendasFiltradas.reduce(
    (acc, v) => {
      acc[v.formaPagamento] = (acc[v.formaPagamento] || 0) + v.total;
      return acc;
    },
    {} as Record<string, number>,
  );

  const vendasPorDia = vendasFiltradas.reduce(
    (acc, v) => {
      const dia = formatDate(v.dataVenda);
      if (!acc[dia]) acc[dia] = { count: 0, total: 0 };
      acc[dia].count++;
      acc[dia].total += v.total;
      return acc;
    },
    {} as Record<string, { count: number; total: number }>,
  );

  const handleExportExcel = (tipo: "vendas" | "estoque" | "completo") => {
    exportarRelatorioExcel(
      { vendas: vendasFiltradas, produtos },
      filtros,
      tipo,
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Relatórios
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Visualize e exporte relatórios do seu negócio
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Período do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-end">
            <div className="space-y-2 w-full sm:w-auto">
              <Label className="text-sm">Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2 w-full sm:w-auto">
              <Label className="text-sm">Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => handleExportExcel("vendas")}
                className="gap-2 text-xs sm:text-sm w-full sm:w-auto"
              >
                <FileDown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Exportar </span>Vendas
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportExcel("estoque")}
                className="gap-2 text-xs sm:text-sm w-full sm:w-auto"
              >
                <FileDown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Exportar </span>Estoque
              </Button>
              <Button
                onClick={() => handleExportExcel("completo")}
                className="gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs sm:text-sm w-full sm:w-auto"
              >
                <FileDown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Exportar </span>Completo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">
              Total de Vendas
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">{vendasFiltradas.length}</div>
            <p className="text-xs text-slate-500">vendas no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">
              Receita Total
            </CardTitle>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(totalVendas)}
            </div>
            <p className="text-xs text-slate-500">no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">
              Ticket Médio
            </CardTitle>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(ticketMedio)}
            </div>
            <p className="text-xs text-slate-500">por venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">
              Produtos em Estoque
            </CardTitle>
            <Package className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
            <p className="text-xs text-slate-500">produtos cadastrados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vendas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendas">Vendas Detalhadas</TabsTrigger>
          <TabsTrigger value="pagamento">Por Forma de Pagamento</TabsTrigger>
          <TabsTrigger value="diario">Vendas por Dia</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas">
          <Card>
            <CardHeader>
              <CardTitle>Vendas Detalhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendasFiltradas.map((venda) => (
                      <TableRow key={venda.id}>
                        <TableCell className="font-medium">
                          {venda.numero}
                        </TableCell>
                        <TableCell>
                          {new Date(venda.dataVenda).toLocaleDateString(
                            "pt-BR",
                          )}
                        </TableCell>
                        <TableCell>{venda.clienteNome}</TableCell>
                        <TableCell>{venda.vendedorNome}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {formatarFormaPagamento(venda.formaPagamento)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(venda.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamento">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(vendasPorFormaPagamento)
                      .sort((a, b) => b[1] - a[1])
                      .map(([forma, total]) => (
                        <TableRow key={forma}>
                          <TableCell>
                            <Badge variant="secondary">
                              {formatarFormaPagamento(forma)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(total)}
                          </TableCell>
                          <TableCell className="text-right">
                            {totalVendas > 0
                              ? ((total / totalVendas) * 100).toFixed(1)
                              : 0}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diario">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Qtd. Vendas</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(vendasPorDia)
                      .sort((a, b) => {
                        const dateA = new Date(
                          a[0].split("/").reverse().join("-"),
                        );
                        const dateB = new Date(
                          b[0].split("/").reverse().join("-"),
                        );
                        return dateB.getTime() - dateA.getTime();
                      })
                      .map(([dia, dados]) => (
                        <TableRow key={dia}>
                          <TableCell>{dia}</TableCell>
                          <TableCell className="text-right">
                            {dados.count}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(dados.total)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(dados.total / dados.count)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque">
          <Card>
            <CardHeader>
              <CardTitle>Situação do Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Preço Venda</TableHead>
                      <TableHead className="text-right">Estoque</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell className="font-medium">
                          {produto.codigo}
                        </TableCell>
                        <TableCell>{produto.nome}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{produto.categoria}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(produto.precoVenda)}
                        </TableCell>
                        <TableCell className="text-right">
                          {produto.quantidadeEstoque}{" "}
                          {produto.unidade.toLowerCase()}s
                        </TableCell>
                        <TableCell className="text-center">
                          {produto.quantidadeEstoque <=
                          produto.quantidadeMinima ? (
                            <Badge variant="destructive">Baixo</Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              OK
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatarFormaPagamento(forma: string): string {
  const map: Record<string, string> = {
    dinheiro: "Dinheiro",
    cartao_credito: "Cartão de Crédito",
    cartao_debito: "Cartão de Débito",
    pix: "PIX",
    prazo: "A Prazo",
  };
  return map[forma] || forma;
}
