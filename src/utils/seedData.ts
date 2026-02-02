import { auth, db } from '@/firebase/config';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { collection, addDoc, Timestamp, doc, setDoc, getDoc } from 'firebase/firestore';

// Dados iniciais para popular o sistema
const categoriasIniciais = [
  { nome: 'Cerveja', descricao: 'Cervejas em geral' },
  { nome: 'Refrigerante', descricao: 'Refrigerantes e bebidas gasosas' },
  { nome: 'Água', descricao: 'Águas minerais e saborizadas' },
  { nome: 'Vinho', descricao: 'Vinhos tintos, brancos e rosés' },
  { nome: 'Destilado', descricao: 'Whisky, vodka, cachaça, etc' },
  { nome: 'Energético', descricao: 'Bebidas energéticas' },
  { nome: 'Suco', descricao: 'Sucos naturais e industrializados' },
  { nome: 'Outros', descricao: 'Outros produtos' }
];

const produtosExemplo = [
  {
    codigo: 'CERV001',
    nome: 'Cerveja Skol 350ml',
    categoria: 'Cerveja',
    fornecedor: 'Ambev',
    precoCusto: 2.50,
    precoVenda: 4.00,
    quantidadeEstoque: 120,
    quantidadeMinima: 30,
    unidade: 'Unidade',
    ativo: true
  },
  {
    codigo: 'CERV002',
    nome: 'Cerveja Brahma 350ml',
    categoria: 'Cerveja',
    fornecedor: 'Ambev',
    precoCusto: 2.60,
    precoVenda: 4.20,
    quantidadeEstoque: 100,
    quantidadeMinima: 30,
    unidade: 'Unidade',
    ativo: true
  },
  {
    codigo: 'CERV003',
    nome: 'Cerveja Heineken 330ml',
    categoria: 'Cerveja',
    fornecedor: 'Heineken',
    precoCusto: 4.00,
    precoVenda: 6.50,
    quantidadeEstoque: 80,
    quantidadeMinima: 20,
    unidade: 'Unidade',
    ativo: true
  },
  {
    codigo: 'REFR001',
    nome: 'Coca-Cola 2L',
    categoria: 'Refrigerante',
    fornecedor: 'Coca-Cola',
    precoCusto: 6.00,
    precoVenda: 9.00,
    quantidadeEstoque: 50,
    quantidadeMinima: 15,
    unidade: 'Unidade',
    ativo: true
  },
  {
    codigo: 'REFR002',
    nome: 'Guaraná Antarctica 2L',
    categoria: 'Refrigerante',
    fornecedor: 'Ambev',
    precoCusto: 5.50,
    precoVenda: 8.50,
    quantidadeEstoque: 45,
    quantidadeMinima: 15,
    unidade: 'Unidade',
    ativo: true
  },
  {
    codigo: 'AGUA001',
    nome: 'Água Mineral 500ml',
    categoria: 'Água',
    fornecedor: 'Indaia',
    precoCusto: 1.20,
    precoVenda: 2.50,
    quantidadeEstoque: 200,
    quantidadeMinima: 50,
    unidade: 'Unidade',
    ativo: true
  },
  {
    codigo: 'DEST001',
    nome: 'Cachaça 51 1L',
    categoria: 'Destilado',
    fornecedor: 'Cachaça 51',
    precoCusto: 15.00,
    precoVenda: 25.00,
    quantidadeEstoque: 30,
    quantidadeMinima: 10,
    unidade: 'Unidade',
    ativo: true
  },
  {
    codigo: 'ENER001',
    nome: 'Red Bull 250ml',
    categoria: 'Energético',
    fornecedor: 'Red Bull',
    precoCusto: 8.00,
    precoVenda: 12.00,
    quantidadeEstoque: 60,
    quantidadeMinima: 20,
    unidade: 'Unidade',
    ativo: true
  }
];

/**
 * Cria o usuário administrador inicial
 */
export async function criarUsuarioAdmin(
  email: string = 'admin@deposito.com',
  senha: string = '123456',
  nome: string = 'Administrador'
): Promise<{ success: boolean; message: string }> {
  try {
    // Verificar se o email já está em uso
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    
    let uid: string;
    
    if (signInMethods.length > 0) {
      // Email já existe no Authentication
      // Tentar obter o UID de algum usuário com esse email
      // Como não podemos obter diretamente, vamos criar apenas no Firestore com um ID customizado
      // Vamos usar um hash simples do email como ID
      uid = email.replace('@', '_').replace(/\./g, '_');
      
      // Verificar se já existe no Firestore
      const userDocRef = doc(db, 'usuarios', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return {
          success: false,
          message: `Usuário já existe! Use as credenciais: ${email} / ${senha}`
        };
      }
      
      // Criar apenas no Firestore
      await setDoc(userDocRef, {
        id: uid,
        email,
        nome,
        perfil: 'admin',
        ativo: true,
        createdAt: Timestamp.now()
      });
      
      return {
        success: true,
        message: `Usuário já existia no Authentication. Dados adicionados ao Firestore! Use: ${email} / ${senha}`
      };
    } else {
      // Email não existe, criar normalmente
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      uid = userCredential.user.uid;

      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'usuarios', uid), {
        id: uid,
        email,
        nome,
        perfil: 'admin',
        ativo: true,
        createdAt: Timestamp.now()
      });

      return {
        success: true,
        message: `Usuário admin criado com sucesso! Use: ${email} / ${senha}`
      };
    }
  } catch (error: any) {
    console.error('Erro detalhado:', error);
    return {
      success: false,
      message: `Erro ao criar usuário: ${error.message}`
    };
  }
}

/**
 * Popula o banco de dados com categorias iniciais
 */
export async function popularCategorias(): Promise<{ success: boolean; message: string }> {
  try {
    for (const categoria of categoriasIniciais) {
      await addDoc(collection(db, 'categorias'), {
        ...categoria,
        createdAt: Timestamp.now()
      });
    }

    return {
      success: true,
      message: `${categoriasIniciais.length} categorias criadas com sucesso!`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao criar categorias: ${error.message}`
    };
  }
}

/**
 * Popula o banco de dados com produtos de exemplo
 */
export async function popularProdutos(): Promise<{ success: boolean; message: string }> {
  try {
    for (const produto of produtosExemplo) {
      await addDoc(collection(db, 'produtos'), {
        ...produto,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    return {
      success: true,
      message: `${produtosExemplo.length} produtos criados com sucesso!`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao criar produtos: ${error.message}`
    };
  }
}

/**
 * Cria uma venda de exemplo
 */
export async function criarVendaExemplo(vendedorId: string, vendedorNome: string): Promise<{ success: boolean; message: string }> {
  try {
    const vendaExemplo = {
      numero: `V${Date.now().toString().slice(-6)}`,
      clienteNome: 'Cliente Exemplo',
      clienteTelefone: '(11) 99999-9999',
      itens: [
        {
          produtoId: 'produto_exemplo_1',
          produtoNome: 'Cerveja Skol 350ml',
          quantidade: 12,
          precoUnitario: 4.00,
          subtotal: 48.00
        },
        {
          produtoId: 'produto_exemplo_2',
          produtoNome: 'Coca-Cola 2L',
          quantidade: 2,
          precoUnitario: 9.00,
          subtotal: 18.00
        }
      ],
      subtotal: 66.00,
      desconto: 0,
      total: 66.00,
      formaPagamento: 'pix',
      status: 'concluida',
      vendedorId,
      vendedorNome,
      observacoes: 'Venda de exemplo',
      dataVenda: Timestamp.now(),
      createdAt: Timestamp.now()
    };

    await addDoc(collection(db, 'vendas'), vendaExemplo);

    return {
      success: true,
      message: 'Venda de exemplo criada com sucesso!'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao criar venda: ${error.message}`
    };
  }
}

/**
 * Executa toda a configuração inicial
 */
export async function configuracaoInicial(): Promise<{ success: boolean; logs: string[] }> {
  const logs: string[] = [];

  // 1. Criar usuário admin
  logs.push('Criando usuário administrador...');
  const resultAdmin = await criarUsuarioAdmin();
  logs.push(resultAdmin.message);

  if (!resultAdmin.success) {
    return { success: false, logs };
  }

  // 2. Popular categorias
  logs.push('Criando categorias...');
  const resultCategorias = await popularCategorias();
  logs.push(resultCategorias.message);

  // 3. Popular produtos
  logs.push('Criando produtos...');
  const resultProdutos = await popularProdutos();
  logs.push(resultProdutos.message);

  // 4. Criar venda de exemplo
  logs.push('Criando venda de exemplo...');
  const auth = (await import('@/firebase/config')).auth;
  const currentUser = auth.currentUser;
  if (currentUser) {
    const resultVenda = await criarVendaExemplo(currentUser.uid, 'Administrador');
    logs.push(resultVenda.message);
  }

  logs.push('Configuração inicial concluída!');
  return { success: true, logs };
}
