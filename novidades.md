Bora destravar isso, Carilo. Três vilões clássicos fazem item “sumir” no App Router: **cache**, **filtro de flags (isactive/isarchived)** e **preço/string**. Segue o playbook direto ao ponto com patches prontos.

# 1) Mate o cache do Server Component

Garanta que a página pública **não** seja servida de cache. No `src/app/[slug]/page.tsx`:

```tsx
// src/app/[slug]/page.tsx
import { unstable_noStore as noStore } from "next/cache";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { slug: string } }) {
  noStore(); // sem cache
  const store = await getStore(params.slug);
  return <PublicStorePage store={store} />;
}
```

Se você chama `getStore` de outro arquivo, pode reforçar lá também (próximo passo).

# 2) Garanta que o `getStore` não “cai” em cache e não filtra item novo por NULL

Use `noStore()` e trate `NULL` nos filtros com `COALESCE`. Exemplo (ajuste ao seu driver/SQL):

```ts
// getStore.ts (ou onde estiver)
// ...
import { unstable_noStore as noStore } from "next/cache";

export async function getStore(slug: string) {
  noStore();

  const { rows: [store] } = await db.query(
    `SELECT id, name, slug FROM stores WHERE slug = $1 LIMIT 1`,
    [slug]
  );

  const { rows: categories } = await db.query(
    `SELECT id, name, position
       FROM categories
      WHERE store_id = $1
      ORDER BY position ASC, name ASC`,
    [store.id]
  );

  const enriched = [];
  for (const c of categories) {
    const { rows: items } = await db.query(
      `SELECT id, name, description,
              -- se price vier DECIMAL como string, tudo bem; o UI converte
              price, 
              COALESCE(isactive, TRUE)   AS isactive,
              COALESCE(isarchived, FALSE) AS isarchived
         FROM items
        WHERE category_id = $1
          AND COALESCE(isarchived, FALSE) = FALSE
          AND COALESCE(isactive, TRUE) = TRUE
        ORDER BY name ASC`,
      [c.id]
    );

    enriched.push({ ...c, items });
  }

  return { ...store, categories: enriched };
}
```

> Moral da história: se o INSERT estiver deixando `isactive`/`isarchived` como `NULL`, o `COALESCE` salva seu render.

# 3) Após criar item, **revalide o caminho** (ou a tag)

No `src/app/api/items/route.ts` (App Router), após o INSERT, chame `revalidatePath` do slug público; opcionalmente use tags.

```ts
// src/app/api/items/route.ts
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    storeId, categoryId, name, description, price: rawPrice, slug,
    isactive, isarchived,
  } = body;

  // preço robusto contra vírgula
  const price = Number(String(rawPrice).replace(",", "."));

  // defaults sólidos
  const active   = isactive   === false ? false : true;
  const archived = isarchived === true  ? true  : false;

  const { rows: [item] } = await db.query(
    `INSERT INTO items (store_id, category_id, name, description, price, isactive, isarchived)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [storeId, categoryId, name, description ?? "", price, active, archived]
  );

  // invalida página pública
  if (slug) revalidatePath(`/${slug}`);
  // se você usar fetch com tag: revalidateTag(`store:${storeId}`);

  return NextResponse.json({ item }, { status: 201 });
}
```

Se a criação é **Server Action** (não API), faça o `revalidatePath` ali mesmo, antes do `redirect`.

# 4) Defaults no banco (para não depender do app)

Se for **Postgres**, rode uma migration/SQL para normalizar legacy:

```sql
ALTER TABLE items ALTER COLUMN isactive   SET DEFAULT TRUE;
ALTER TABLE items ALTER COLUMN isarchived SET DEFAULT FALSE;

UPDATE items SET isactive   = TRUE  WHERE isactive   IS NULL;
UPDATE items SET isarchived = FALSE WHERE isarchived IS NULL;
```

> Em **SQLite**, recrie a tabela com os defaults (limitação do ALTER), ou garanta os defaults via camadas de aplicação.

# 5) Preço: string → número no UI (e form)

Se `price` vier como string do driver, formate só na borda do UI:

```tsx
// onde renderiza:
const p = Number(item.price); // seguro se vier "12.34"
<span>{p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
```

No form (client), normalize antes do POST:

```ts
const payload = {
  // ...
  price: String(formData.get("price")).replace(",", "."),
};
```

# 6) Left join sem transformar em inner join

Se você monta categorias com um único SELECT agregado, lembre de filtrar no **JOIN**, não no `WHERE`, para manter categorias sem itens:

```sql
SELECT c.id, c.name,
       COALESCE(
         JSON_AGG(i.*) FILTER (WHERE i.id IS NOT NULL),
         '[]'
       ) AS items
  FROM categories c
  LEFT JOIN items i
    ON i.category_id = c.id
   AND COALESCE(i.isarchived, FALSE) = FALSE
   AND COALESCE(i.isactive,   TRUE)  = TRUE
 WHERE c.store_id = $1
 GROUP BY c.id
 ORDER BY c.position, c.name;
```

# 7) UI não renderiza? Cheque shape e arrays vazias

O `PublicStorePage` pode estar esperando `categories[].items` sempre como array. Garanta shape estável:

```ts
// no getStore, ao montar:
enriched.push({ ...c, items: items ?? [] });
```

E no componente, proteja:

```tsx
{store.categories?.map(c => (
  <Category key={c.id} {...c} items={c.items ?? []} />
))}
```

# 8) Pós-criação no cliente

Se, após criar, você navega para a página pública, dá um `router.refresh()` antes/ao redirecionar:

```tsx
import { useRouter } from "next/navigation";
const router = useRouter();
// depois do POST OK:
router.refresh();
router.push(`/${slug}`);
```

---

**Checklist de validação agora:**

1. Crie um item com `price` contendo vírgula (ex.: `12,90`) e confirme renderização com moeda.
2. Confirme que `revalidatePath("/[slug]")` disparou no terminal após o POST.
3. Confira no log do servidor que o `getStore` roda a cada hit (sem cache).
4. Verifique que o item novo aparece sem reiniciar o dev server.

Se sumiu, é sintoma de cache; se não renderizou mas aparece no log SQL, é shape/filtro; se quebrou no JSON, pode ser tipo inválido (converta `price`).

Quando tudo isso estiver em produção, você ganha **SLA de visibilidade** nível sênior: criou → aparece. Sem drama, sem F5 maroto. Quer escalar o stack pra `revalidateTag` com granularidade por loja/categoria na sequência? É só puxar que eu já te deixo com governance de cache fininha.
