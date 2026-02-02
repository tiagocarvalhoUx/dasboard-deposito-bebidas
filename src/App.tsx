import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/auth/PrivateRoute";
import { Layout } from "@/components/dashboard/Layout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Vendas } from "@/pages/Vendas";
import { Estoque } from "@/pages/Estoque";
import { Relatorios } from "@/pages/Relatorios";
import { Usuarios } from "@/pages/Usuarios";
import { Configuracao } from "@/pages/Configuracao";
import { Diagnostico } from "@/pages/Diagnostico";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/configuracao" element={<Configuracao />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vendas" element={<Vendas />} />
            <Route path="estoque" element={<Estoque />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route
              path="usuarios"
              element={
                <PrivateRoute requireAdmin>
                  <Usuarios />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
