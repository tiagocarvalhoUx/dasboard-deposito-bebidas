import { useState } from 'react';
import { useCollection } from '@/hooks/useFirebase';
import type { Usuario } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2, Edit, UserCheck, UserX } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';

export function Usuarios() {
  const { data: usuarios, add, update, remove } = useCollection<Usuario>('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<'admin' | 'vendedor'>('vendedor');

  const filteredUsuarios = usuarios.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setNome('');
    setEmail('');
    setSenha('');
    setPerfil('vendedor');
    setEditingUsuario(null);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setPerfil(usuario.perfil);
    setSenha('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUsuario) {
      await update(editingUsuario.id, {
        nome,
        perfil
      });
    } else {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      
      // Adicionar dados do usuário no Firestore
      await add({
        id: userCredential.user.uid,
        nome,
        email,
        perfil,
        ativo: true,
        createdAt: new Date()
      } as Usuario);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    await update(usuario.id, { ativo: !usuario.ativo });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      await remove(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Usuários</h1>
          <p className="text-slate-500 mt-1">Gerencie os usuários do sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do usuário"
                  required
                />
              </div>

              {!editingUsuario && (
                <>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={perfil} onValueChange={(v) => setPerfil(v as 'admin' | 'vendedor')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                  {editingUsuario ? 'Salvar Alterações' : 'Cadastrar Usuário'}
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
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge className={usuario.perfil === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                        {usuario.perfil === 'admin' ? 'Administrador' : 'Vendedor'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={usuario.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(usuario)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleStatus(usuario)}
                          title={usuario.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {usuario.ativo ? <UserX className="w-4 h-4 text-amber-500" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(usuario.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
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
