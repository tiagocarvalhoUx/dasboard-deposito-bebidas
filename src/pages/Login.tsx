import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Wine, Eye, EyeOff } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Erro ao fazer login:", err);

      let errorMessage = "Erro ao fazer login. Tente novamente.";

      if (err.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado. Verifique o email.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta. Tente novamente.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Email inválido.";
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = "Email ou senha incorretos.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Wine className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Depósito de Bebidas
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Sistema de Vendas
              </p>
            </div>
          </div>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-white text-center">
              Login
            </CardTitle>
            <CardDescription className="text-slate-400 text-center text-sm">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-red-900/50 border-red-800"
                >
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                disabled={loading}
              >
                {loading ? <Spinner className="w-4 h-4" /> : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-slate-400">
                    Primeiro acesso?
                  </span>
                </div>
              </div>

              <Link to="/configuracao">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Criar Primeiro Usuário
                </Button>
              </Link>

              <Link to="/diagnostico">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 text-xs"
                >
                  🔍 Verificar Conexão com Firebase
                </Button>
              </Link>

              <div className="text-center text-xs text-slate-500 mt-2">
                <p>Credenciais padrão após configuração:</p>
                <p className="text-slate-400 mt-1">
                  admin@deposito.com / 123456
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
