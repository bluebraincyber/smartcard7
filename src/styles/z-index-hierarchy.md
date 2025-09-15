# Hierarquia de Z-Index - SmartCard7

## Padrão de Z-Index

Para evitar conflitos de sobreposição, seguimos esta hierarquia:

### Níveis Definidos

| Elemento | Z-Index | Uso |
|----------|---------|-----|
| **Base** | `z-0` a `z-10` | Elementos normais da página |
| **Dropdowns** | `z-20` a `z-30` | Menus dropdown, tooltips |
| **Sidebar Mobile** | `z-40` | Sidebar mobile do dashboard |
| **Headers/NavBars** | `z-50` | Headers sticky, navigation bars |
| **Modals/Overlays** | `z-[60]` | Modal do carrinho |
| **Dialog Modals** | `z-[70]` | Modais de confirmação, criação, edição |
| **Toast/Alerts** | `z-[80]` | Notificações, alertas |
| **Debug/Dev** | `z-[90]` | Ferramentas de desenvolvimento |

### Implementação

#### ✅ Correto
```tsx
// Header sticky
<header className="sticky top-0 z-50">

// Modal do carrinho
<div className="fixed inset-0 bg-black bg-opacity-50 z-[60]">

// Modal de confirmação
<Dialog className="relative z-[70]">
```

#### ❌ Evitar
```tsx
// Não usar o mesmo z-index para elementos diferentes
<header className="z-50">
<modal className="z-50"> {/* Conflito! */}
```

### Arquivos Atualizados

- ✅ `PublicStorePage.tsx` - Cart Modal: `z-[60]`
- ✅ `ConfirmationModal.tsx` - Dialog: `z-[70]`
- ✅ `ProductCreateModal.tsx` - Dialog: `z-[70]`
- ✅ `ProductEditModal.tsx` - Dialog: `z-[70]`

### Regras

1. **Sempre usar valores específicos** da tabela acima
2. **Documentar novos z-index** neste arquivo
3. **Testar sobreposições** em diferentes breakpoints
4. **Usar `z-[valor]`** para valores customizados (Tailwind arbitrary values)

### Debugging

Para debugar problemas de z-index:

```css
/* Adicionar temporariamente para visualizar camadas */
* {
  outline: 1px solid red;
}
```

Ou usar as DevTools do navegador para inspecionar a propriedade `z-index` dos elementos.