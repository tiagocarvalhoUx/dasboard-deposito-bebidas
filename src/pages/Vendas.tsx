import { useState, useRef, useEffect } from "react";
import { useCollection } from "@/hooks/useFirebase";
import { useAuth } from "@/contexts/AuthContext";
import type { Venda, Produto, ItemVenda } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Trash2, Eye, ShoppingCart, Wallet, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate, formatDateTime } from "@/utils/dateHelpers";

export function Vendas() {
  const { data: vendas, add } = useCollection<Venda>("vendas");
  const { data: produtos, update: updateProduto } =
    useCollection<Produto>("produtos");
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [produtoSearch, setProdutoSearch] = useState("");
  const [openProdutoCombobox, setOpenProdutoCombobox] = useState(false);
  const quantidadeInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [formaPagamento, setFormaPagamento] =
    useState<Venda["formaPagamento"]>("dinheiro");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [selectedProduto, setSelectedProduto] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [valorPago, setValorPago] = useState("");

  // Auto-focus quantidade input after product selection
  useEffect(() => {
    if (selectedProduto && quantidadeInputRef.current) {
      quantidadeInputRef.current.focus();
      quantidadeInputRef.current.select();
    }
  }, [selectedProduto]);

  const filteredVendas = vendas.filter(
    (v) =>
      v.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.numero.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal;
  const troco = valorPago ? parseFloat(valorPago) - total : 0;

  const produtosFiltrados = produtos
    .filter(p => p.ativo && p.quantidadeEstoque > 0)
    .filter(p => 
      produtoSearch === "" || 
      p.nome.toLowerCase().includes(produtoSearch.toLowerCase()) ||
      p.codigoBarras?.toLowerCase().includes(produtoSearch.toLowerCase())
    );

  const addItem = () => {
    if (!selectedProduto || quantidade <= 0) return;

    const produto = produtos.find((p) => p.id === selectedProduto);
    if (!produto) return;

    if (quantidade > produto.quantidadeEstoque) {
      alert(`Estoque insuficiente! Disponível: ${produto.quantidadeEstoque}`);
      return;
    }

    const existingItem = itens.find((i) => i.produtoId === selectedProduto);
    if (existingItem) {
      const novaQuantidade = existingItem.quantidade + quantidade;
      if (novaQuantidade > produto.quantidadeEstoque) {
        alert(`Estoque insuficiente! Disponível: ${produto.quantidadeEstoque}`);
        return;
      }
      setItens(
        itens.map((i) =>
          i.produtoId === selectedProduto
            ? {
                ...i,
                quantidade: novaQuantidade,
                subtotal: novaQuantidade * i.precoUnitario,
              }
            : i,
        ),
      );
    } else {
      setItens([
        ...itens,
        {
          produtoId: produto.id,
          produtoNome: produto.nome,
          quantidade,
          precoUnitario: produto.precoVenda,
          subtotal: quantidade * produto.precoVenda,
        },
      ]);
    }

    setSelectedProduto("");
    setProdutoSearch("");
    setQuantidade(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && selectedProduto && quantidade > 0) {
      e.preventDefault();
      addItem();
    }
  };

  const removeItem = (produtoId: string) => {
    setItens(itens.filter((i) => i.produtoId !== produtoId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itens.length === 0) return;

    const novaVenda: Omit<Venda, "id"> = {
      numero: `V${Date.now().toString().slice(-6)}`,
      clienteNome,
      clienteTelefone,
      itens,
      subtotal,
      desconto: 0,
      total,
      formaPagamento,
      status: "concluida",
      vendedorId: user?.id || "",
      vendedorNome: user?.nome || "",
      observacoes,
      dataVenda: new Date(),
      createdAt: new Date(),
    };

    await add(novaVenda);

    // Atualizar estoque
    for (const item of itens) {
      const produto = produtos.find((p) => p.id === item.produtoId);
      if (produto) {
        await updateProduto(item.produtoId, {
          quantidadeEstoque: produto.quantidadeEstoque - item.quantidade,
        } as Partial<Produto>);
      }
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setClienteNome("");
    setClienteTelefone("");
    setFormaPagamento("dinheiro");
    setObservacoes("");
    setItens([]);
    setSelectedProduto("");
    setProdutoSearch("");
    setQuantidade(1);
    setValorPago("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vendas</h1>
          <p className="text-slate-500 mt-1">
            Gerencie as vendas do seu depósito
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <ShoppingCart className="w-6 h-6 text-amber-500" />
                Nova Venda
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {/* Cliente Info - Compacto */}
                <Card className="bg-slate-50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <Label className="text-xs font-semibold text-slate-600">Cliente</Label>
                        <Input
                          value={clienteNome}
                          onChange={(e) => setClienteNome(e.target.value)}
                          placeholder="Nome do cliente"
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-600">Telefone</Label>
                        <Input
                          value={clienteTelefone}
                          onChange={(e) => setClienteTelefone(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Adicionar Produto - Busca Inteligente */}
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                  <CardContent className="pt-4">
                    <Label className="text-sm font-semibold text-amber-900 mb-2 block">
                      Adicionar Produto
                    </Label>
                    <div className="flex gap-2">
                      <Popover open={openProdutoCombobox} onOpenChange={setOpenProdutoCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="flex-1 justify-between bg-white hover:bg-slate-50"
                          >
                            {selectedProduto
                              ? produtos.find((p) => p.id === selectedProduto)?.nome
                              : "🔍 Buscar produto..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Digite nome ou código..." 
                              value={produtoSearch}
                              onValueChange={setProdutoSearch}
                            />
                            <CommandList>
                              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                              <CommandGroup>
                                {produtosFiltrados.map((produto) => (
                                  <CommandItem
                                    key={produto.id}
                                    value={produto.id}
                                    onSelect={() => {
                                      setSelectedProduto(produto.id);
                                      setOpenProdutoCombobox(false);
                                    }}
                                    className="flex justify-between"
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium">{produto.nome}</div>
                                      <div className="text-xs text-slate-500">
                                        Estoque: {produto.quantidadeEstoque}un
                                      </div>
                                    </div>
                                    <div className="font-bold text-amber-600">
                                      {formatCurrency(produto.precoVenda)}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      <div className="flex items-center gap-2">
                        <Input
                          ref={quantidadeInputRef}
                          type="number"
                          min={1}
                          value={quantidade}
                          onChange={(e) =>
                            setQuantidade(parseInt(e.target.value) || 1)
                          }
                          onKeyPress={handleKeyPress}
                          placeholder="Qtd"
                          className="w-20 text-center font-semibold"
                        />
                        <Button 
                          type="button" 
                          onClick={addItem} 
                          className="bg-amber-500 hover:bg-amber-600"
                          disabled={!selectedProduto}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Itens */}
                {itens.length > 0 && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        {itens.map((item) => (
                          <div
                            key={item.produtoId}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-slate-900">{item.produtoNome}</div>
                              <div className="text-sm text-slate-500">
                                {item.quantidade}x {formatCurrency(item.precoUnitario)}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-lg font-bold text-amber-600">
                                {formatCurrency(item.subtotal)}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.produtoId)}
                                className="hover:bg-red-100 hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pagamento e Total */}
                <Card className="bg-slate-900 text-white">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-400 text-xs">Forma de Pagamento</Label>
                        <Select 
                          value={formaPagamento} 
                          onValueChange={(v) => setFormaPagamento(v as Venda["formaPagamento"])}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                            <SelectItem value="cartao_credito">💳 Cartão Crédito</SelectItem>
                            <SelectItem value="cartao_debito">💳 Cartão Débito</SelectItem>
                            <SelectItem value="pix">📱 PIX</SelectItem>
                            <SelectItem value="prazo">📝 A Prazo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {formaPagamento === "dinheiro" && (
                        <div>
                          <Label className="text-slate-400 text-xs">Valor Pago</Label>
                          <div className="relative mt-1">
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                              type="number"
                              step="0.01"
                              value={valorPago}
                              onChange={(e) => setValorPago(e.target.value)}
                              placeholder="0,00"
                              className="bg-slate-800 border-slate-700 pl-10"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-700 pt-3 space-y-2">
                      <div className="flex justify-between text-lg">
                        <span className="text-slate-400">Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-2xl font-bold">
                        <span className="text-amber-400">TOTAL:</span>
                        <span className="text-amber-400">{formatCurrency(total)}</span>
                      </div>
                      {formaPagamento === "dinheiro" && parseFloat(valorPago || "0") > 0 && (
                        <div className="flex justify-between text-lg border-t border-slate-700 pt-2">
                          <span className="text-emerald-400">Troco:</span>
                          <span className="text-emerald-400 font-bold">
                            {formatCurrency(Math.max(0, troco))}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Observações */}
                <div>
                  <Label className="text-sm text-slate-600">Observações (opcional)</Label>
                  <Input
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Informações adicionais..."
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Botões de Ação - Fixos no Bottom */}
              <div className="flex gap-3 pt-4 border-t mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg py-6" 
                  disabled={itens.length === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Finalizar Venda
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar vendas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell className="font-medium">{venda.numero}</TableCell>
                  <TableCell>{venda.clienteNome}</TableCell>
                  <TableCell>
                    {formatDate(venda.dataVenda)}
                  </TableCell>
                  <TableCell>{venda.vendedorNome}</TableCell>
                  <TableCell>
                    {formatarFormaPagamento(venda.formaPagamento)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(venda.total)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getStatusBadgeClass(venda.status)}>
                      {formatarStatus(venda.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Detalhes da Venda {venda.numero}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Cliente:</span>
                              <p className="font-medium">{venda.clienteNome}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">Telefone:</span>
                              <p className="font-medium">
                                {venda.clienteTelefone || "-"}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-500">Data:</span>
                              <p className="font-medium">
                                {formatDateTime(venda.dataVenda)}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-500">Vendedor:</span>
                              <p className="font-medium">
                                {venda.vendedorNome}
                              </p>
                            </div>
                          </div>

                          <div className="border rounded-lg">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Produto</TableHead>
                                  <TableHead className="text-right">
                                    Qtd
                                  </TableHead>
                                  <TableHead className="text-right">
                                    Preço
                                  </TableHead>
                                  <TableHead className="text-right">
                                    Subtotal
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {venda.itens.map((item, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{item.produtoNome}</TableCell>
                                    <TableCell className="text-right">
                                      {item.quantidade}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(item.precoUnitario)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(item.subtotal)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t">
                            <div>
                              <span className="text-slate-500">
                                Forma de Pagamento:
                              </span>
                              <p className="font-medium">
                                {formatarFormaPagamento(venda.formaPagamento)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500">Total:</span>
                              <p className="text-2xl font-bold text-amber-600">
                                {formatCurrency(venda.total)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatarFormaPagamento(forma: string): string {
  const map: Record<string, string> = {
    dinheiro: "Dinheiro",
    cartao_credito: "Cartão Crédito",
    cartao_debito: "Cartão Débito",
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

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "concluida":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "pendente":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "cancelada":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-slate-100 text-slate-800";
  }
}
