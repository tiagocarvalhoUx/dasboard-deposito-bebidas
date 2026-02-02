import * as XLSX from "xlsx";
import type { Venda, Produto, RelatorioFiltros } from "@/types";
import { convertFirestoreDate } from "./dateHelpers";

interface RelatorioData {
  vendas: Venda[];
  produtos?: Produto[];
}

export function exportarRelatorioExcel(
  data: RelatorioData,
  filtros: RelatorioFiltros,
  tipo: "vendas" | "estoque" | "completo",
): void {
  const wb = XLSX.utils.book_new();

  const dataGeracao = new Date().toLocaleDateString("pt-BR");
  const periodo = `${filtros.dataInicio.toLocaleDateString("pt-BR")} a ${filtros.dataFim.toLocaleDateString("pt-BR")}`;

  if (tipo === "vendas" || tipo === "completo") {
    const vendasSheet = criarAbaVendas(data.vendas, periodo, dataGeracao);
    XLSX.utils.book_append_sheet(wb, vendasSheet, "📊 Vendas");

    const resumoVendasSheet = criarAbaResumoVendas(
      data.vendas,
      periodo,
      dataGeracao,
    );
    XLSX.utils.book_append_sheet(wb, resumoVendasSheet, "📈 Dashboard");

    const produtosVendidosSheet = criarAbaProdutosMaisVendidos(data.vendas);
    XLSX.utils.book_append_sheet(wb, produtosVendidosSheet, "🏆 Top Produtos");
  }

  if (tipo === "estoque" || tipo === "completo") {
    const estoqueSheet = criarAbaEstoque(data.produtos || [], dataGeracao);
    XLSX.utils.book_append_sheet(wb, estoqueSheet, "📦 Estoque");

    const estoqueAlertasSheet = criarAbaAlertasEstoque(
      data.produtos || [],
      dataGeracao,
    );
    XLSX.utils.book_append_sheet(wb, estoqueAlertasSheet, "⚠️ Alertas");
  }

  const fileName = `Relatorio_${tipo}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function criarAbaVendas(
  vendas: Venda[],
  periodo: string,
  dataGeracao: string,
): XLSX.WorkSheet {
  const headers = [
    "ID Venda",
    "Número",
    "Data",
    "Cliente",
    "Telefone",
    "Vendedor",
    "Forma Pagamento",
    "Status",
    "Subtotal",
    "Desconto",
    "Total",
    "Observações",
  ];

  const startRow = 5; // Linha onde começam os dados
  const rows = vendas.map((venda) => {
    const dataVenda = convertFirestoreDate(venda.dataVenda);

    return [
      venda.id,
      venda.numero,
      dataVenda.toLocaleDateString("pt-BR"),
      venda.clienteNome,
      venda.clienteTelefone || "-",
      venda.vendedorNome,
      formatarFormaPagamento(venda.formaPagamento),
      formatarStatus(venda.status),
      venda.subtotal, // Valor numérico para fórmulas
      venda.desconto,
      venda.total,
      venda.observacoes || "-",
    ];
  });

  const totalRow = startRow + vendas.length + 1;
  const dataRows = [
    [
      "RELATÓRIO DE VENDAS DETALHADAS",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [`Período: ${periodo}`, "", "", "", "", "", "", "", "", "", "", ""],
    [
      `Data de Geração: ${dataGeracao}`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    headers,
    ...rows,
    [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "TOTAIS:",
      { f: `SUM(I${startRow + 1}:I${totalRow - 1})` },
      { f: `SUM(J${startRow + 1}:J${totalRow - 1})` },
      { f: `SUM(K${startRow + 1}:K${totalRow - 1})` },
      "",
    ],
    [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "TICKET MÉDIO:",
      "",
      "",
      { f: `K${totalRow}/COUNT(K${startRow + 1}:K${totalRow - 1})` },
      "",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(dataRows);

  // Formatação de largura das colunas
  ws["!cols"] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 30 },
  ];

  // Aplicar formato de moeda nas colunas de valores
  for (let R = startRow; R <= totalRow; R++) {
    [8, 9, 10].forEach((C) => {
      // Colunas I, J, K (Subtotal, Desconto, Total)
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (ws[cellAddress]) {
        ws[cellAddress].z = "R$ #,##0.00";
      }
    });
  }

  return ws;
}

function criarAbaResumoVendas(
  vendas: Venda[],
  periodo: string,
  dataGeracao: string,
): XLSX.WorkSheet {
  const vendasPorFormaPagamento = agruparPor(vendas, "formaPagamento");
  const vendasPorVendedor = agruparPor(vendas, "vendedorNome");
  const vendasPorDia = agruparPorData(vendas);

  const totalVendas = vendas.length;
  const valorTotal = vendas.reduce((sum, v) => sum + v.total, 0);
  const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;

  const rows: any[] = [
    ["═══════════════════════════════════════════════════════════", "", ""],
    ["                    📊 DASHBOARD DE VENDAS                   ", "", ""],
    ["═══════════════════════════════════════════════════════════", "", ""],
    [`📅 Período: ${periodo}`, "", ""],
    [`📆 Gerado em: ${dataGeracao}`, "", ""],
    ["", "", ""],
    ["═══════════════ INDICADORES PRINCIPAIS ═══════════════", "", ""],
    ["", "", ""],
    ["📈 Métrica", "Valor", ""],
    ["Total de Vendas", totalVendas, ""],
    ["Faturamento Total", valorTotal, ""],
    ["Ticket Médio", ticketMedio, ""],
    ["", "", ""],
    ["═══════════════ VENDAS POR FORMA DE PAGAMENTO ═══════════════", "", ""],
    ["", "", ""],
    ["💳 Forma de Pagamento", "Quantidade", "💰 Valor Total"],
  ];

  Object.entries(vendasPorFormaPagamento)
    .sort(
      ([, a], [, b]) =>
        b.reduce((s, v: Venda) => s + v.total, 0) -
        a.reduce((s, v: Venda) => s + v.total, 0),
    )
    .forEach(([forma, itens]) => {
      rows.push([
        formatarFormaPagamento(forma),
        itens.length,
        itens.reduce((sum, v: Venda) => sum + v.total, 0),
      ]);
    });

  rows.push(
    ["", "", ""],
    ["═══════════════ PERFORMANCE POR VENDEDOR ═══════════════", "", ""],
    ["", "", ""],
    ["👤 Vendedor", "Quantidade", "💰 Valor Total"],
  );

  Object.entries(vendasPorVendedor)
    .sort(
      ([, a], [, b]) =>
        b.reduce((s, v: Venda) => s + v.total, 0) -
        a.reduce((s, v: Venda) => s + v.total, 0),
    )
    .forEach(([vendedor, itens]) => {
      rows.push([
        vendedor,
        itens.length,
        itens.reduce((sum, v: Venda) => sum + v.total, 0),
      ]);
    });

  rows.push(
    ["", "", ""],
    ["═══════════════ VENDAS DIÁRIAS ═══════════════", "", ""],
    ["", "", ""],
    ["📅 Data", "Quantidade", "💰 Valor Total"],
  );

  Object.entries(vendasPorDia)
    .sort(([a], [b]) => b.localeCompare(a))
    .forEach(([dia, itens]) => {
      rows.push([
        dia,
        itens.length,
        itens.reduce((sum, v: Venda) => sum + v.total, 0),
      ]);
    });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws["!cols"] = [{ wch: 35 }, { wch: 15 }, { wch: 18 }];

  // Aplicar formato de moeda nas colunas de valores
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let R = 0; R <= range.e.r; R++) {
    const cellB = ws[XLSX.utils.encode_cell({ r: R, c: 1 })];
    const cellC = ws[XLSX.utils.encode_cell({ r: R, c: 2 })];

    if (cellB && typeof cellB.v === "number" && cellB.v > 1000) {
      cellB.z = "R$ #,##0.00";
    }
    if (cellC && typeof cellC.v === "number") {
      cellC.z = "R$ #,##0.00";
    }
  }

  return ws;
}

function criarAbaEstoque(
  produtos: Produto[],
  dataGeracao: string,
): XLSX.WorkSheet {
  const startRow = 4;
  const headers = [
    "Código",
    "Nome",
    "Categoria",
    "Fornecedor",
    "Preço Custo",
    "Preço Venda",
    "Margem %",
    "Estoque",
    "Mínimo",
    "Status",
    "Valor em Estoque",
  ];

  const rows = produtos.map((p, index) => {
    const rowNum = startRow + index + 1;
    const margemLucro =
      p.precoCusto > 0
        ? ((p.precoVenda - p.precoCusto) / p.precoCusto) * 100
        : 0;

    return [
      p.codigo,
      p.nome,
      p.categoria,
      p.fornecedor,
      p.precoCusto,
      p.precoVenda,
      margemLucro,
      p.quantidadeEstoque,
      p.quantidadeMinima,
      p.quantidadeEstoque <= p.quantidadeMinima ? "⚠️ BAIXO" : "✅ OK",
      { f: `F${rowNum}*H${rowNum}` }, // Preço Venda * Quantidade
    ];
  });

  const totalRow = startRow + produtos.length + 1;
  const dataRows = [
    [
      "═══════════════ 📦 RELATÓRIO DE ESTOQUE ═══════════════",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      `📆 Data de Geração: ${dataGeracao}`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", "", "", "", "", "", ""],
    headers,
    ...rows,
    [
      "",
      "",
      "",
      "TOTAIS:",
      { f: `SUM(E${startRow + 1}:E${totalRow - 1})` },
      "",
      "",
      { f: `SUM(H${startRow + 1}:H${totalRow - 1})` },
      "",
      "",
      { f: `SUM(K${startRow + 1}:K${totalRow - 1})` },
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(dataRows);

  ws["!cols"] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 15 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 18 },
  ];

  // Aplicar formato
  for (let R = startRow; R <= totalRow; R++) {
    // Preço Custo (E)
    const cellE = ws[XLSX.utils.encode_cell({ r: R, c: 4 })];
    if (cellE) cellE.z = "R$ #,##0.00";

    // Preço Venda (F)
    const cellF = ws[XLSX.utils.encode_cell({ r: R, c: 5 })];
    if (cellF) cellF.z = "R$ #,##0.00";

    // Margem % (G)
    const cellG = ws[XLSX.utils.encode_cell({ r: R, c: 6 })];
    if (cellG) cellG.z = "0.00%";

    // Valor em Estoque (K)
    const cellK = ws[XLSX.utils.encode_cell({ r: R, c: 10 })];
    if (cellK) cellK.z = "R$ #,##0.00";
  }

  return ws;
}

function criarAbaProdutosMaisVendidos(vendas: Venda[]): XLSX.WorkSheet {
  // Agrupar produtos vendidos
  const produtosVendidos: Record<
    string,
    { nome: string; quantidade: number; total: number }
  > = {};

  vendas.forEach((venda) => {
    venda.itens.forEach((item) => {
      if (!produtosVendidos[item.produtoNome]) {
        produtosVendidos[item.produtoNome] = {
          nome: item.produtoNome,
          quantidade: 0,
          total: 0,
        };
      }
      produtosVendidos[item.produtoNome].quantidade += item.quantidade;
      produtosVendidos[item.produtoNome].total += item.subtotal;
    });
  });

  // Ordenar por quantidade vendida
  const topProdutos = Object.values(produtosVendidos).sort(
    (a, b) => b.quantidade - a.quantidade,
  );

  const rows: any[] = [
    ["═══════════════════════════════════════", "", ""],
    ["      🏆 TOP PRODUTOS MAIS VENDIDOS      ", "", ""],
    ["═══════════════════════════════════════", "", ""],
    ["", "", ""],
    ["🥇 Ranking", "📦 Produto", "Quantidade", "💰 Total Vendido"],
  ];

  topProdutos.forEach((produto, index) => {
    const medalha =
      index === 0
        ? "🥇"
        : index === 1
          ? "🥈"
          : index === 2
            ? "🥉"
            : `${index + 1}º`;
    rows.push([medalha, produto.nome, produto.quantidade, produto.total]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 12 }, { wch: 35 }, { wch: 12 }, { wch: 18 }];

  // Aplicar formato de moeda
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let R = 5; R <= range.e.r; R++) {
    const cellD = ws[XLSX.utils.encode_cell({ r: R, c: 3 })];
    if (cellD && typeof cellD.v === "number") {
      cellD.z = "R$ #,##0.00";
    }
  }

  return ws;
}

function criarAbaAlertasEstoque(
  produtos: Produto[],
  dataGeracao: string,
): XLSX.WorkSheet {
  const produtosBaixoEstoque = produtos.filter(
    (p) => p.quantidadeEstoque <= p.quantidadeMinima,
  );
  const produtosEmFalta = produtos.filter((p) => p.quantidadeEstoque === 0);
  const produtosAlerta = produtos.filter(
    (p) =>
      p.quantidadeEstoque > 0 &&
      p.quantidadeEstoque <= p.quantidadeMinima * 1.5,
  );

  const rows: any[] = [
    ["═══════════════════════════════════════════", "", "", ""],
    ["         ⚠️ ALERTAS DE ESTOQUE         ", "", "", ""],
    ["═══════════════════════════════════════════", "", "", ""],
    [`📆 Gerado em: ${dataGeracao}`, "", "", ""],
    ["", "", "", ""],
    ["📊 RESUMO DOS ALERTAS", "", "", ""],
    ["", "", "", ""],
    ["Status", "Quantidade de Produtos", "", ""],
    ["🔴 Produtos em Falta", produtosEmFalta.length, "", ""],
    ["🟡 Estoque Baixo", produtosBaixoEstoque.length, "", ""],
    ["🟠 Atenção", produtosAlerta.length, "", ""],
    ["", "", "", ""],
    ["═══════════════ 🔴 PRODUTOS EM FALTA ═══════════════", "", "", ""],
    ["", "", "", ""],
  ];

  if (produtosEmFalta.length > 0) {
    rows.push(["Código", "Produto", "Categoria", "Fornecedor"]);
    produtosEmFalta.forEach((p) => {
      rows.push([p.codigo, p.nome, p.categoria, p.fornecedor]);
    });
  } else {
    rows.push(["✅ Nenhum produto em falta!", "", "", ""]);
  }

  rows.push(
    ["", "", "", ""],
    ["═══════════════ 🟡 ESTOQUE BAIXO ═══════════════", "", "", ""],
    ["", "", "", ""],
  );

  if (produtosBaixoEstoque.length > 0) {
    rows.push(["Código", "Produto", "Atual", "Mínimo", "Diferença"]);
    produtosBaixoEstoque.forEach((p) => {
      rows.push([
        p.codigo,
        p.nome,
        p.quantidadeEstoque,
        p.quantidadeMinima,
        p.quantidadeMinima - p.quantidadeEstoque,
      ]);
    });
  } else {
    rows.push(["✅ Todos os estoques estão adequados!", "", "", ""]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 12 },
    { wch: 35 },
    { wch: 12 },
    { wch: 20 },
    { wch: 12 },
  ];

  return ws;
}

function agruparPor<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

function agruparPorData(vendas: Venda[]): Record<string, Venda[]> {
  return vendas.reduce(
    (result, venda) => {
      const data = convertFirestoreDate(venda.dataVenda);
      const groupKey = data.toLocaleDateString("pt-BR");
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(venda);
      return result;
    },
    {} as Record<string, Venda[]>,
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

function formatarStatus(status: string): string {
  const map: Record<string, string> = {
    concluida: "Concluída",
    pendente: "Pendente",
    cancelada: "Cancelada",
  };
  return map[status] || status;
}
