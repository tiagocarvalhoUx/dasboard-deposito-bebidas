import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  criarUsuarioAdmin, 
  popularCategorias, 
  popularProdutos, 
  criarVendaExemplo 
} from '@/utils/seedData';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, AlertTriangle, Database, UserPlus, Package, ShoppingCart } from 'lucide-react';

export function Configuracao() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [email, setEmail] = useState('admin@deposito.com');
  const [senha, setSenha] = useState('123456');
  const [nome, setNome] = useState('Administrador');

  const handleCriarAdmin = async () => {
    setLoading(true);
    setLogs(prev => [...prev, 'Criando usuário administrador...']);
    
    const result = await criarUsuarioAdmin(email, senha, nome);
    setLogs(prev => [...prev, result.message]);
    
    setLoading(false);
  };

  const handlePopularCategorias = async () => {
    setLoading(true);
    setLogs(prev => [...prev, 'Criando categorias...']);
    
    const result = await popularCategorias();
    setLogs(prev => [...prev, result.message]);
    
    setLoading(false);
  };

  const handlePopularProdutos = async () => {
    setLoading(true);
    setLogs(prev => [...prev, 'Criando produtos...']);
    
    const result = await popularProdutos();
    setLogs(prev => [...prev, result.message]);
    
    setLoading(false);
  };

  const handleCriarVendaExemplo = async () => {
    if (!user) {
      setLogs(prev => [...prev, 'Erro: Você precisa estar logado!']);
      return;
    }

    setLoading(true);
    setLogs(prev => [...prev, 'Criando venda de exemplo...']);
    
    const result = await criarVendaExemplo(user.id, user.nome);
    setLogs(prev => [...prev, result.message]);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Configuração Inicial</h1>
          <p className="text-slate-500 mt-2">
            Use esta página para configurar o Firebase e popular o banco de dados
          </p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Importante:</strong> Antes de usar esta página, certifique-se de que:
            <ul className="list-disc ml-5 mt-2">
              <li>O Firebase está configurado no arquivo <code>src/firebase/config.ts</code></li>
              <li>O Authentication e Firestore estão ativados no console do Firebase</li>
              <li>As regras de segurança permitem leitura/escrita</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Passo 1: Criar Usuário Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-500" />
              Passo 1: Criar Usuário Administrador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
            </div>
            <Button 
              onClick={handleCriarAdmin} 
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Criar Usuário Admin
            </Button>
          </CardContent>
        </Card>

        {/* Passo 2: Popular Categorias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              Passo 2: Criar Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Cria as categorias padrão: Cerveja, Refrigerante, Água, Vinho, Destilado, Energético, Suco e Outros.
            </p>
            <Button 
              onClick={handlePopularCategorias} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
              Criar Categorias
            </Button>
          </CardContent>
        </Card>

        {/* Passo 3: Popular Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              Passo 3: Criar Produtos de Exemplo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Cria 8 produtos de exemplo com preços e estoque para testar o sistema.
            </p>
            <Button 
              onClick={handlePopularProdutos} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
              Criar Produtos
            </Button>
          </CardContent>
        </Card>

        {/* Passo 4: Criar Venda Exemplo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-500" />
              Passo 4: Criar Venda de Exemplo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Cria uma venda de exemplo para visualizar no dashboard e relatórios.
            </p>
            <Button 
              onClick={handleCriarVendaExemplo} 
              disabled={loading || !user}
              variant="outline"
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
              Criar Venda de Exemplo
            </Button>
          </CardContent>
        </Card>

        {/* Logs */}
        {logs.length > 0 && (
          <Card className="bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Logs de Configuração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-slate-500">[{index + 1}]</span>
                    <span className={log.includes('Erro') ? 'text-red-400' : 'text-emerald-400'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Próximos Passos */}
        <Alert className="bg-emerald-50 border-emerald-200">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <AlertDescription className="text-emerald-800">
            <strong>Próximos passos:</strong>
            <ol className="list-decimal ml-5 mt-2">
              <li>Execute os passos acima na ordem</li>
              <li>Faça login com o usuário admin criado</li>
              <li>Acesse o Dashboard para ver os dados</li>
              <li>Personalize os produtos conforme sua necessidade</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
