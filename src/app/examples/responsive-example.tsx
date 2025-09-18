import { Page, Stack, Cluster, AutoGrid } from '@/components/layout/LayoutPrimitives';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ResponsiveExample = () => {
  const stats = [
    { title: 'Total de Vendas', value: 'R$ 12.540,00', change: '+12%' },
    { title: 'Novos Clientes', value: '84', change: '+8%' },
    { title: 'Pedidos Pendentes', value: '12', change: '-3%' },
    { title: 'Taxa de Conversão', value: '3.2%', change: '+0.5%' },
  ];

  return (
    <Page className="py-6">
      <Stack className="gap-6">
        <h1 className="text-fluid-2xl font-bold">Dashboard</h1>
        
        {/* Cards de Estatísticas */}
        <AutoGrid min={240} className="md:[grid-template-columns:repeat(2,minmax(0,1fr))] lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-fluid-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-fluid-xl font-bold">{stat.value}</span>
                  <span className="text-sm text-green-500">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </AutoGrid>

        {/* Gráfico de Exemplo */}
        <div className="cq rounded-xl border p-4">
          <h2 className="mb-4 text-fluid-lg font-semibold">Desempenho de Vendas</h2>
          <div className="h-64 w-full bg-muted/20 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Gráfico de vendas</p>
          </div>
        </div>

        {/* Tabela Responsiva */}
        <div className="overflow-x-auto">
          <div className="md:hidden space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-lg border p-4">
                <div className="flex justify-between">
                  <span className="font-medium">Produto {item}</span>
                  <span>R$ {item * 100},00</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Vendas: {item * 5}</span>
                  <span>Estoque: {20 - item * 5}</span>
                </div>
              </div>
            ))}
          </div>

          <table className="hidden md:table w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Produto</th>
                <th className="p-3">Preço</th>
                <th className="p-3">Vendas</th>
                <th className="p-3">Estoque</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((item) => (
                <tr key={item} className="border-b hover:bg-muted/10">
                  <td className="p-3">Produto {item}</td>
                  <td className="p-3">R$ {item * 100},00</td>
                  <td className="p-3">{item * 5}</td>
                  <td className="p-3">{20 - item * 5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Stack>
    </Page>
  );
};

export default ResponsiveExample;
