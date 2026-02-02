import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { DashboardMetrics, Venda, Produto } from '@/types';

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    vendasHoje: 0,
    vendasMes: 0,
    totalVendasHoje: 0,
    totalVendasMes: 0,
    produtosEstoqueBaixo: 0,
    totalProdutos: 0
  });
  const [vendasRecentes, setVendasRecentes] = useState<Venda[]>([]);
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const vendasQuery = query(
      collection(db, 'vendas'),
      where('dataVenda', '>=', Timestamp.fromDate(inicioMes)),
      where('status', '==', 'concluida')
    );

    const produtosQuery = query(collection(db, 'produtos'));

    const unsubscribeVendas = onSnapshot(vendasQuery, (snapshot) => {
      const vendas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Venda[];

      const vendasHoje = vendas.filter(v => {
        const dataVenda = v.dataVenda instanceof Timestamp ? v.dataVenda.toDate() : new Date(v.dataVenda);
        return dataVenda >= hoje;
      });

      const totalVendasHoje = vendasHoje.reduce((sum, v) => sum + v.total, 0);
      const totalVendasMes = vendas.reduce((sum, v) => sum + v.total, 0);

      setMetrics(prev => ({
        ...prev,
        vendasHoje: vendasHoje.length,
        vendasMes: vendas.length,
        totalVendasHoje,
        totalVendasMes
      }));

      setVendasRecentes(vendas.slice(0, 5));
    });

    const unsubscribeProdutos = onSnapshot(produtosQuery, (snapshot) => {
      const produtos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Produto[];

      const baixoEstoque = produtos.filter(p => 
        p.quantidadeEstoque <= p.quantidadeMinima
      );

      setMetrics(prev => ({
        ...prev,
        produtosEstoqueBaixo: baixoEstoque.length,
        totalProdutos: produtos.length
      }));

      setProdutosBaixoEstoque(baixoEstoque);
    });

    setLoading(false);

    return () => {
      unsubscribeVendas();
      unsubscribeProdutos();
    };
  }, []);

  return { metrics, vendasRecentes, produtosBaixoEstoque, loading };
}
