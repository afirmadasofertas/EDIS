# EDIS Gerador — Spec de Produto

## Visão Geral

**EDIS Gerador** automatiza a criação de 40 anúncios estáticos profissionais para qualquer marca em 5 fases sequenciais.

```
Briefing → DNA Brand → Templates → Geração → Galeria
```

---

## Stack & Convenções

- **Framework**: Next.js (este projeto) — nada de backend separado
- **UI**: shadcn/ui + Tailwind + design system EDIS (dark-first, sempre)
- **Icons**: Hugeicons free tier — `@hugeicons/core-free-icons` via `<Icon />`
- **Backend**: Next.js API Routes (`/api/*`) ou Server Actions
- **Progresso em tempo real**: SSE via API Route (`/api/generate/stream`)
- **Armazenamento de estado**: a definir (Zustand ou React context por enquanto, persistência futura)
- **Geração de imagens**: API externa (FAL / OpenAI Images) chamada pelo servidor Next.js
- **Pesquisa de marca**: API Route que faz scraping/busca server-side

---

## Rota no App

`/swipe-files` → renomear para `/gerador` (ou manter a rota e trocar label/ícone no sidebar)

Subpáginas sugeridas:
```
/gerador                        → lista de projetos salvos
/gerador/novo                   → wizard (5 fases)
/gerador/[id]                   → projeto existente (retoma de onde parou)
/gerador/[id]/galeria           → galeria de anúncios gerados
```

---

## Fase 1 — Briefing

### Input Method (3 opções)

Radio buttons com visual tab-like (padrão EDIS):
- **Com URL** — campo único, botão "Analisar Marca" → API Route faz scraping
- **Manual** — formulário completo (ver abaixo)
- **Híbrido** — URL + override manual dos campos detectados

### Campos (modo Manual / Híbrido)

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome da marca | text input | sim |
| Descrição do negócio | textarea (20–100 palavras) | sim |
| Cores principais | color picker + hex input, add/remove | sim |
| Tipografia preferida | text input ou select | não |
| Estilo visual | select: Minimalista / Luxury / Playful / Industrial / Bold | sim |
| Público-alvo | textarea | sim |

### Upload de Imagens

- Drag & drop + input file
- Preview thumbnails com botão remover
- Formatos: JPG, PNG, WebP
- Mínimo 0, recomendado 3 (frontal, ângulo, lifestyle)
- Upload via `/api/upload` → retorna URLs temporárias

### Estado ao Salvar

Estrutura JSON persistida no projeto:

```ts
type Briefing = {
  method: "url" | "manual" | "hybrid"
  brandName: string
  url?: string
  colors: string[]           // hex codes
  typography?: string
  visualStyle: string
  targetAudience: string
  imageUrls: string[]
}
```

---

## Fase 2 — DNA Brand

### Processo

- **Com URL**: API Route faz scraping → extrai cores, fontes, estilo fotográfico, CTAs
- **Sem URL**: usa dados do briefing manual, normaliza hex, infere tom visual

### Estrutura do DNA

```ts
type BrandDNA = {
  brandInfo: {
    name: string
    description: string
    targetAudience: string
    positioning: string
  }
  visualSystem: {
    primaryColor: string      // hex
    secondaryColor: string
    accentColor: string
    headlineFont: string
    bodyFont: string
    ctaStyle: string
  }
  photographyDirection: {
    lighting: string          // "Natural", "Studio", "Golden hour"
    colorGrading: string      // "Warm", "Cool", "Saturated"
    composition: string       // "Centered", "Lifestyle"
    mood: string
  }
  productDetails: {
    physicalDescription: string
    labelPlacement: string
    distinctiveFeatures: string
    packagingColors: string[]
  }
  imageGenerationModifier: string   // 50–75 palavras, prepend em todo prompt
  source: "url" | "manual"
}
```

### UI — Review do DNA

Cards organizados em seções:
1. **Brand Info** — nome, descrição, audiência
2. **Visual System** — circles de cor com hex, tipografia em preview, CTA style
3. **Photography Direction** — texto descritivo por campo
4. **Image Generation Modifier** — bloco de texto com botão copy

Cada campo editável inline (click to edit). Botão "Confirmar DNA" avança pra Fase 3.

---

## Fase 3 — Templates

40 templates organizados em 4 categorias:

| Categoria | Qty | Cor do badge |
|---|---|---|
| Engajamento | 10 | `edis-mint` |
| Autoridade | 14 | azul (chart-2: `#5ab5ff`) |
| Conversão | 12 | amarelo (chart-4: `#ffce55`) |
| Viral | 4 | vermelho (destructive: `#ff5470`) |

> Os totais batem em 40 — revisão necessária no MD original (contagem estava errada por categoria).

### Estrutura de um Template

```ts
type Template = {
  id: string                     // "01"–"40"
  name: string
  category: "engajamento" | "autoridade" | "conversao" | "viral"
  aspectRatio: "1:1" | "4:5" | "9:16"
  promptTemplate: string         // com [PLACEHOLDERS]
  needsProductReference: boolean
  placeholders: Record<string, string>
}
```

### UI

- Grid de cards com: ID + nome, badge de categoria, aspect ratio, ícone se precisa de imagem de produto
- Filtros: por categoria, por `needsProductReference`
- Click no card → modal com prompt completo + editor de copy
- Estimativa de custo total antes de gerar

---

## Fase 4 — Geração

### Fluxo

1. Usuário configura: quality (low/medium/high), variações (1–4)
2. Clica "Gerar" → POST `/api/generate` → retorna job ID
3. Frontend abre SSE em `/api/generate/stream?jobId=...`
4. Cada evento SSE atualiza UI em tempo real

### Controles de UI (não flags CLI)

- **Quality**: `<Select>` shadcn — low / medium / high
- **Variações**: `<Input type="number">` — 1 a 4
- **Templates específicos**: checkboxes no passo anterior (Fase 3)
- **Cancelar**: botão que chama `/api/generate/cancel`

### Status em Tempo Real

```
[ 38/40 ]  ████████████████████░░  95%

✓ Template 01 — Citação de Avaliação           8s
✓ Template 02 — Estilo de Vida em Cores        11s
⧖ Template 03 — Heróis com Estatísticas        gerando...
✗ Template 04 — falhou                          [Retry]
```

Custo acumulado atualizado a cada evento.

---

## Fase 5 — Galeria

### Rota

`/gerador/[id]/galeria` — página própria Next.js, não HTML externo.

### UI

- Grid 3–4 colunas responsivo
- Cada card: imagem preview + hover overlay com nome, categoria badge, botões Preview / Download
- Filtros: por categoria, por aspect ratio
- Fullscreen modal com navegação prev/next

### Download

- **Individual**: link direto para imagem
- **ZIP organizado**: GET `/api/generate/[id]/download` → stream do ZIP gerado server-side
  - Estrutura interna: `por-categoria/`, `por-plataforma/`, `todos/`
- **CSV de metadata**: GET `/api/generate/[id]/export-csv`

---

## Design System — Tokens Corretos

**Não inventar cores novas.** Usar apenas o que existe:

```
Backgrounds:  edis-ink-1 (#111) ... edis-ink-5 (#2a2a2a)
Borders:      edis-line-1/2/3
Text:         edis-text-hi / text-1 / text-2 / text-3 / text-4
Accent:       edis-mint (#00e573) / mint-hover (#33eb8c)
Destructive:  #ff5470
Chart colors: #5ab5ff (azul) / #d7f555 (lima) / #ffce55 (amarelo) / #ff5470 (vermelho)
```

**Tipografia:**
- Display/Headings: `font-display` → Space Grotesk
- Body: `font-sans` → Inter
- Mono/code/tags: `font-mono` → JetBrains Mono

**Componentes base:**
- Cards: shadcn `<Card>` com `border-border bg-card shadow-none`
- Botões: shadcn `<Button>` — `bg-primary text-primary-foreground` para CTA primário
- Inputs/Select: shadcn nativos
- Modais: shadcn `<Dialog>`
- Progress: shadcn `<Progress>` ou custom com tokens

**Dark mode:** não é opcional — o projeto É dark. Não há `prefers-color-scheme` toggle pra implementar.

---

## O Que Ficou de Fora (Deliberadamente)

- ~~Galeria HTML standalone~~ → é uma rota Next.js
- ~~Backend Python/Node separado~~ → Next.js API Routes
- ~~Vue~~ → React/Next.js
- ~~Arquivos locais como storage primário~~ → URLs/cloud
- ~~Flags CLI (`--dry-run`, `--quality`)~~ → controles de UI
- ~~Cores inventadas (`#2E75B6`)~~ → tokens EDIS
- ~~Plus Jakarta Sans~~ → Space Grotesk
- ~~Dark mode opcional~~ → é o padrão, sempre

---

**Versão:** 1.1 — alinhado com stack real do projeto  
**Última atualização:** April 25, 2026
