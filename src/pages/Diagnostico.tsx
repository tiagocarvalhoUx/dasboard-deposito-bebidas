import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { auth, db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export function Diagnostico() {
  const [status, setStatus] = useState({
    firebaseConfig: false,
    authentication: false,
    firestore: false,
    hasUsers: false,
    loading: true,
  });
  const [error, setError] = useState("");
  const [userCount, setUserCount] = useState(0);

  const verificarSistema = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    setError("");

    try {
      // 1. Verificar configuração do Firebase
      const firebaseConfig = auth.app.options;
      const hasConfig = !!(
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId
      );

      setStatus((prev) => ({ ...prev, firebaseConfig: hasConfig }));

      // 2. Verificar Authentication
      const authWorking = !!auth;
      setStatus((prev) => ({ ...prev, authentication: authWorking }));

      // 3. Verificar Firestore
      let firestoreWorking = false;
      let usersExist = false;
      let count = 0;

      try {
        const usersRef = collection(db, "usuarios");
        const snapshot = await getDocs(usersRef);
        firestoreWorking = true;
        count = snapshot.size;
        usersExist = count > 0;
      } catch (err: any) {
        console.error("Erro ao acessar Firestore:", err);
        setError(err.message || "Erro ao acessar Firestore");
      }

      setStatus({
        firebaseConfig: hasConfig,
        authentication: authWorking,
        firestore: firestoreWorking,
        hasUsers: usersExist,
        loading: false,
      });
      setUserCount(count);
    } catch (err: any) {
      console.error("Erro no diagnóstico:", err);
      setError(err.message || "Erro ao verificar sistema");
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    verificarSistema();
  }, []);

  const StatusItem = ({
    label,
    success,
    loading,
  }: {
    label: string;
    success: boolean;
    loading?: boolean;
  }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {loading ? (
        <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
      ) : success ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Diagnóstico do Sistema
          </h1>
          <p className="text-slate-500 mt-2">
            Verificando conexões e configurações
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-5 h-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Status das Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusItem
              label="Configuração do Firebase"
              success={status.firebaseConfig}
              loading={status.loading}
            />
            <StatusItem
              label="Firebase Authentication"
              success={status.authentication}
              loading={status.loading}
            />
            <StatusItem
              label="Firestore Database"
              success={status.firestore}
              loading={status.loading}
            />
            <StatusItem
              label={`Usuários Cadastrados (${userCount})`}
              success={status.hasUsers}
              loading={status.loading}
            />

            <Button
              onClick={verificarSistema}
              className="w-full mt-4"
              disabled={status.loading}
            >
              {status.loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar Novamente
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Firebase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-slate-500">Project ID:</span>
              <span className="font-mono text-xs">
                {auth.app.options.projectId || "Não configurado"}
              </span>

              <span className="text-slate-500">Auth Domain:</span>
              <span className="font-mono text-xs break-all">
                {auth.app.options.authDomain || "Não configurado"}
              </span>
            </div>
          </CardContent>
        </Card>

        {!status.hasUsers && !status.loading && status.firestore && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Nenhum usuário encontrado!</strong>
              <br />
              Você precisa criar o primeiro usuário na página de Configuração.
              <div className="mt-3">
                <a
                  href="/configuracao"
                  className="text-amber-700 underline hover:text-amber-900"
                >
                  Ir para Configuração →
                </a>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!status.firestore && !status.loading && (
          <Alert variant="destructive">
            <XCircle className="w-5 h-5" />
            <AlertDescription>
              <strong>Não foi possível conectar ao Firestore!</strong>
              <br />
              <br />
              Possíveis causas:
              <ul className="list-disc ml-5 mt-2">
                <li>Firestore não está ativado no Firebase Console</li>
                <li>Regras de segurança estão bloqueando o acesso</li>
                <li>Credenciais do Firebase estão incorretas</li>
              </ul>
              <br />
              <strong>Regras recomendadas para teste:</strong>
              <pre className="bg-slate-900 text-white p-3 rounded mt-2 text-xs overflow-x-auto">
                {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => (window.location.href = "/configuracao")}
          >
            Ir para Configuração
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => (window.location.href = "/login")}
          >
            Ir para Login
          </Button>
        </div>
      </div>
    </div>
  );
}
