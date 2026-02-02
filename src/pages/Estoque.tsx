import { useState } from "react";
import { useCollection } from "@/hooks/useFirebase";
import type { Produto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Search, Trash2, Edit, AlertTriangle } from "lucide-react";

const categorias = [
  "Cerveja",
  "Refrigerante",
  "Água",
  "Vinho",
  "Destilado",
  "Energético",
  "Suco",
  "Outros",
];

const unidades = ["Unidade", "Pack", "Caixa", "Garrafa", "Lata", "Litro"];

export function Estoque() {
  const {
    data: produtos,
    add,
    update,
    remove,
  } = useCollection<Produto>("produtos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  // Form state
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [precoCusto, setPrecoCusto] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [quantidadeEstoque, setQuantidadeEstoque] = useState("");
  const [quantidadeMinima, setQuantidadeMinima] = useState("");
  const [unidade, setUnidade] = useState("Unidade");

  const filteredProdutos = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const produtosEstoqueBaixo = produtos.filter(
    (p) => p.quantidadeEstoque <= p.quantidadeMinima,
  );

  const resetForm = () => {
    setCodigo("");
    setNome("");
    setCategoria("");
    setFornecedor("");
    setPrecoCusto("");
    setPrecoVenda("");
    setQuantidadeEstoque("");
    setQuantidadeMinima("");
    setUnidade("Unidade");
    setEditingProduto(null);
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setCodigo(produto.codigo);
    setNome(produto.nome);
    setCategoria(produto.categoria);
    setFornecedor(produto.fornecedor);
    setPrecoCusto(produto.precoCusto.toString());
    setPrecoVenda(produto.precoVenda.toString());
    setQuantidadeEstoque(produto.quantidadeEstoque.toString());
    setQuantidadeMinima(produto.quantidadeMinima.toString());
    setUnidade(produto.unidade);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const produtoData = {
      codigo,
      nome,
      categoria,
      fornecedor,
      precoCusto: parseFloat(precoCusto) || 0,
      precoVenda: parseFloat(precoVenda) || 0,
      quantidadeEstoque: parseInt(quantidadeEstoque) || 0,
      quantidadeMinima: parseInt(quantidadeMinima) || 0,
      unidade,
      ativo: true,
    };

    if (editingProduto) {
      await update(editingProduto.id, produtoData);
    } else {
      await add(produtoData as Omit<Produto, "id">);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      await remove(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Estoque
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Gerencie os produtos do seu depósito
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingProduto ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Código</Label>
                  <Input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Código do produto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Nome</Label>
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do produto"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Unidade</Label>
                  <Select value={unidade} onValueChange={setUnidade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Fornecedor</Label>
                <Input
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço de Custo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precoCusto}
                    onChange={(e) => setPrecoCusto(e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço de Venda</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precoVenda}
                    onChange={(e) => setPrecoVenda(e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade em Estoque</Label>
                  <Input
                    type="number"
                    min="0"
                    value={quantidadeEstoque}
                    onChange={(e) => setQuantidadeEstoque(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade Mínima</Label>
                  <Input
                    type="number"
                    min="0"
                    value={quantidadeMinima}
                    onChange={(e) => setQuantidadeMinima(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  {editingProduto ? "Salvar Alterações" : "Cadastrar Produto"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de Estoque Baixo */}
      {produtosEstoqueBaixo.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3 p-3 sm:p-6">
            <CardTitle className="text-red-800 flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              Produtos com Estoque Baixo ({produtosEstoqueBaixo.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {produtosEstoqueBaixo.slice(0, 8).map((produto) => (
                <Badge
                  key={produto.id}
                  variant="destructive"
                  className="text-xs"
                >
                  {produto.nome}: {produto.quantidadeEstoque} un
                </Badge>
              ))}
              {produtosEstoqueBaixo.length > 8 && (
                <Badge variant="destructive" className="text-xs">
                  +{produtosEstoqueBaixo.length - 8} mais
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3 p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Código</TableHead>
                  <TableHead className="text-xs sm:text-sm">Nome</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">
                    Categoria
                  </TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">
                    Preço
                  </TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">
                    Estoque
                  </TableHead>
                  <TableHead className="text-center text-xs sm:text-sm hidden sm:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="w-16 sm:w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {produto.codigo}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                      {produto.nome}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {produto.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm whitespace-nowrap">
                      {formatCurrency(produto.precoVenda)}
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm">
                      <span
                        className={
                          produto.quantidadeEstoque <= produto.quantidadeMinima
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {produto.quantidadeEstoque}
                        <span className="hidden sm:inline">
                          {" "}
                          {produto.unidade.toLowerCase()}s
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      {produto.quantidadeEstoque <= produto.quantidadeMinima ? (
                        <Badge variant="destructive" className="text-xs">
                          Baixo
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs"
                        >
                          OK
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(produto)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(produto.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
