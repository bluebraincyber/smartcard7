# Guia de Responsividade SmartCard7

Este guia descreve o sistema de responsividade implementado no SmartCard7, incluindo breakpoints, componentes e padrões recomendados.

## Breakpoints Padrão

| Prefixo | Largura Mínima | Uso Principal |
|---------|----------------|----------------|
| `xs`    | 360px          | Celulares pequenos |
| `sm`    | 640px          | Celulares grandes / Tablets pequenos |
| `md`    | 768px          | Tablets / Landscape |
| `lg`    | 1024px         | Desktops pequenos |
| `xl`    | 1280px         | Desktops médios |
| `2xl`   | 1536px         | Desktops grandes |

## Componentes de Layout

### 1. Page
Container principal com largura máxima e padding responsivo.

```tsx
import { Page } from '@/components/layout/LayoutPrimitives';

<Page>
  {/* Conteúdo da página */}
</Page>
```

### 2. Stack
Empilha itens verticalmente com espaçamento fluido.

```tsx
import { Stack } from '@/components/layout/LayoutPrimitives';

<Stack>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

### 3. Cluster
Agrupa itens em linha com wrap e espaçamento fluido.

```tsx
import { Cluster } from '@/components/layout/LayoutPrimitives';

<Cluster>
  <button>Botão 1</button>
  <button>Botão 2</button>
</Cluster>
```

### 4. AutoGrid
Grid responsivo com tamanho mínimo configurável.

```tsx
import { AutoGrid } from '@/components/layout/LayoutPrimitives';

<AutoGrid min={240}>
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</AutoGrid>
```

## Container Queries

Use a classe `cq` para habilitar container queries em um elemento pai, então estilize os filhos com `@container`.

```tsx
<div className="cq">
  <div className="block @md:flex gap-4">
    {/* Layout muda para flex quando o container tem pelo menos 768px */}
  </div>
</div>
```

## Tipografia Fluida

Use as classes de texto fluido para tipografia que se adapta ao tamanho da tela:

- `text-fluid-xs` a `text-fluid-3xl`

## Espaçamentos Fluidos

Use as classes de espaçamento fluido para margens e paddings responsivos:

- `gap-fluid-1` a `gap-fluid-6`
- `p-fluid-1` a `p-fluid-6`
- `m-fluid-1` a `m-fluid-6`

## Boas Práticas

1. **Mobile-first**: Sempre comece estilizando para mobile e use breakpoints para adicionar estilos para telas maiores.

2. **Use componentes de layout**: Prefira usar os componentes de layout (`Stack`, `Cluster`, `AutoGrid`) em vez de criar estilos personalizados.

3. **Teste em vários dispositivos**: Sempre teste em diferentes tamanhos de tela para garantir uma boa experiência do usuário.

4. **Evite larguras fixas**: Use unidades relativas como `%`, `vw`, `fr` em vez de pixels fixos quando possível.

5. **Otimize para toque**: Certifique-se de que os elementos interativos tenham pelo menos 44x44px em dispositivos móveis.

## Exemplo Completo

Veja um exemplo completo em `src/app/examples/responsive-example.tsx`.
