# 🔐 Guia de Primeiro Acesso

## Passo a Passo para Configuração Inicial

### 1️⃣ Configure o Firebase

Antes de começar, certifique-se de que:

1. **Firebase Authentication está ativado**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Vá em "Authentication" → "Sign-in method"
   - Ative o método "Email/Password"

2. **Firestore está configurado**
   - Vá em "Firestore Database"
   - Crie o banco de dados em modo de teste (ou configurado)

3. **Regras de Segurança (Temporárias para Setup)**
   
   Durante a configuração inicial, você pode usar estas regras:
   
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   
   ⚠️ **IMPORTANTE**: Após criar o usuário, altere as regras para produção!

### 2️⃣ Primeiro Acesso

1. **Execute o projeto**:
   ```bash
   npm run dev
   ```

2. **Acesse a aplicação**: `http://localhost:5173`

3. **Na tela de login, clique em "Criar Primeiro Usuário"**

4. **Na página de Configuração**:
   - Passo 1: Criar Usuário Administrador
     - Nome: Administrador (ou seu nome)
     - Email: admin@deposito.com (ou seu email)
     - Senha: 123456 (ou sua senha)
     - Clique em "Criar Usuário Admin"
   
   - Passo 2: Criar Categorias (opcional, mas recomendado)
     - Clique em "Criar Categorias"
   
   - Passo 3: Popular Produtos (opcional para testes)
     - Clique em "Popular Produtos"

5. **Volte para a tela de Login**:
   - Use o email e senha que você criou
   - Clique em "Entrar"

### 3️⃣ Credenciais Padrão

Se você usou as credenciais sugeridas:
- **Email**: admin@deposito.com
- **Senha**: 123456

### ❌ Problemas Comuns

#### "Email ou senha incorretos"
- Verifique se você criou o usuário na página de Configuração
- Confirme que está usando o email e senha corretos
- Verifique o console do navegador (F12) para erros detalhados

#### "Erro ao conectar com Firebase"
- Verifique se o arquivo `src/firebase/config.ts` está configurado
- Confirme que o Authentication está ativado no Firebase Console
- Verifique as regras de segurança do Firestore

#### "Permissão negada"
- Verifique as regras de segurança no Firestore
- Durante o setup inicial, use regras permissivas
- Depois configure regras adequadas para produção

### 🔒 Configurar Regras de Segurança (Produção)

Após criar o primeiro usuário, atualize as regras do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite apenas usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Regra específica para usuários (apenas admin pode criar)
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.perfil == 'admin');
    }
  }
}
```

### 📝 Próximos Passos

Após fazer login com sucesso:
1. Vá para "Estoque" e cadastre seus produtos
2. Configure usuários vendedores em "Usuários" (apenas admin)
3. Comece a registrar vendas em "Vendas"
4. Acompanhe o desempenho no "Dashboard"

### 💡 Dica

Mantenha as credenciais do administrador em local seguro!
