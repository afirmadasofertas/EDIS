/**
 * Aulas mock data — 5 modules with a realistic mix of video + article
 * lessons. Replace with CMS / backend data once the course platform ships.
 *
 * Videos use Google's free sample mp4s so the HTML5 player works out of
 * the box with no extra config. Thumbnails come from picsum.photos
 * (already allowed in next.config.ts).
 */

export type Level = "iniciante" | "intermediário" | "avançado";

export type ArticleBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; attribution?: string };

export type Lesson = {
  id: string;
  moduleId: string;
  order: number;
  type: "video" | "article";
  title: string;
  description: string;
  /** Duration in seconds — also the estimated reading time for articles. */
  durationSec: number;
  /** Only for type="video". */
  videoUrl?: string;
  /** Only for type="article". */
  content?: ArticleBlock[];
};

export type Module = {
  id: string;
  title: string;
  description: string;
  thumbnailSeed: string;
  level: Level;
  tags: string[];
  instructor: string;
};

export const MODULES: Module[] = [
  {
    id: "copy-que-vende",
    title: "Copy que vende",
    description:
      "Escrita persuasiva para direct response. Ganchos, estruturas e as heurísticas que levantam CTR sem gritar.",
    thumbnailSeed: "aulas-copy",
    level: "iniciante",
    tags: ["Copy", "Fundamentos"],
    instructor: "Marcos Viana",
  },
  {
    id: "research-360",
    title: "Research 360°",
    description:
      "Como varrer Meta Ads, Reddit e TikTok pra extrair hook, ângulo e objeção antes de escrever qualquer coisa.",
    thumbnailSeed: "aulas-research",
    level: "intermediário",
    tags: ["Research", "CrowAI"],
    instructor: "Marcos Viana",
  },
  {
    id: "editor-pro",
    title: "Editor pro",
    description:
      "Montar criativo do zero no Editor EDIS — templates, assets, variações e o que otimiza tempo.",
    thumbnailSeed: "aulas-editor",
    level: "iniciante",
    tags: ["Editor", "Produção"],
    instructor: "Marcos Viana",
  },
  {
    id: "analytics-iteracao",
    title: "Analytics & iteração",
    description:
      "Ler os números: CPM, CTR, CPA, ROAS. Quando matar um criativo, quando escalar, quando iterar.",
    thumbnailSeed: "aulas-analytics",
    level: "avançado",
    tags: ["Analytics", "Meta Ads"],
    instructor: "Marcos Viana",
  },
  {
    id: "templates-validados",
    title: "Templates validados",
    description:
      "Catálogo comentado dos templates que rodaram nos últimos 90 dias, com notas de quando usar cada um.",
    thumbnailSeed: "aulas-templates",
    level: "iniciante",
    tags: ["Templates", "Swipe"],
    instructor: "Marcos Viana",
  },
];

// Google's public sample videos — small, free, no auth needed.
const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

function video(i: number): string {
  return SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length];
}

export const LESSONS: Lesson[] = [
  // ── Copy que vende ──────────────────────────────────────────────────────
  {
    id: "copy-01",
    moduleId: "copy-que-vende",
    order: 1,
    type: "video",
    title: "Introdução: copy não é decoração",
    description:
      "O que muda quando a copy puxa uma decisão em vez de descrever um produto. Referências e o que vamos cobrir no módulo.",
    durationSec: 2 * 60 + 15,
    videoUrl: video(0),
  },
  {
    id: "copy-02",
    moduleId: "copy-que-vende",
    order: 2,
    type: "article",
    title: "10 ganchos testados",
    description:
      "Formato curto: ganchos que já rodaram em pelo menos 3 nichos diferentes com CTR acima da média.",
    durationSec: 4 * 60,
    content: [
      { type: "heading", level: 2, text: "Por que gancho é 80% do criativo" },
      {
        type: "paragraph",
        text:
          "Gancho é o primeiro segundo do vídeo ou a primeira linha do anúncio. Se ele não prende, o resto não importa. Abaixo estão 10 padrões que testamos exaustivamente em nichos diversos (saúde, finanças, SaaS, ecommerce) com retorno consistente.",
      },
      { type: "heading", level: 3, text: "1. Contradição com autoridade" },
      {
        type: "paragraph",
        text:
          "Ex.: \"Todo mundo te disse que beber água em jejum é bom. Nutricionistas discordam.\" Contradiz uma crença estabelecida e adiciona autoridade.",
      },
      { type: "heading", level: 3, text: "2. Número específico + tempo" },
      {
        type: "paragraph",
        text:
          "Ex.: \"Em 73 horas descobri o que 12 anos de academia não ensinaram.\" Números não-redondos funcionam melhor que redondos.",
      },
      { type: "heading", level: 3, text: "3. Confissão pessoal" },
      {
        type: "paragraph",
        text:
          "Ex.: \"Quase entrei em falência por causa de um erro bobo de Meta Ads.\" Gera proximidade antes do pitch.",
      },
      { type: "heading", level: 3, text: "4. Pergunta incômoda" },
      {
        type: "paragraph",
        text:
          "Ex.: \"Quanto você paga hoje pra ficar preso onde está?\" Faz o usuário parar pra responder mentalmente.",
      },
      { type: "heading", level: 3, text: "5. Metáfora inesperada" },
      {
        type: "paragraph",
        text:
          "Ex.: \"Criativo sem research é como atirar no escuro com os olhos fechados.\" Torna abstrato em visual.",
      },
      {
        type: "quote",
        text:
          "Um bom gancho não promete — ele interrompe. A promessa vem no segundo 3.",
        attribution: "Eugene Schwartz (parafraseado)",
      },
      { type: "heading", level: 3, text: "6 a 10: no vídeo" },
      {
        type: "paragraph",
        text:
          "Os cinco restantes estão destrinchados na aula 4 — com exemplos reais de anúncios que rodaram em escala.",
      },
    ],
  },
  {
    id: "copy-03",
    moduleId: "copy-que-vende",
    order: 3,
    type: "video",
    title: "Estrutura AIDA moderna (não é a que te ensinaram)",
    description:
      "A versão original não aguenta feed moderno. Vamos ver a AIDA com hook + tensão + pagamento simbólico.",
    durationSec: 8 * 60 + 30,
    videoUrl: video(1),
  },
  {
    id: "copy-04",
    moduleId: "copy-que-vende",
    order: 4,
    type: "video",
    title: "Escrevendo pra direct response (longo vs curto)",
    description:
      "Quando usar vídeo de 15s vs long form de 3 minutos. Matemática do CPA por formato.",
    durationSec: 12 * 60,
    videoUrl: video(2),
  },
  {
    id: "copy-05",
    moduleId: "copy-que-vende",
    order: 5,
    type: "article",
    title: "Monte seu swipe file pessoal",
    description:
      "Como organizar anúncios salvos pra inspiração utilizável — não decoração visual.",
    durationSec: 6 * 60,
    content: [
      { type: "heading", level: 2, text: "Por que swipe file normal não funciona" },
      {
        type: "paragraph",
        text:
          "A maioria das pessoas salva screenshots aleatórios em pastas sem estrutura. Quando precisam de inspiração, não conseguem achar nada. O swipe útil é indexado por ângulo + objeção, não por estética.",
      },
      { type: "heading", level: 2, text: "A estrutura que funciona" },
      {
        type: "list",
        items: [
          "Pasta por ângulo (preço, transformação, autoridade, medo, curiosidade)",
          "Nome do arquivo inclui hook + nicho (ex: \"contradição-saude.png\")",
          "Um .txt por pasta com 3 bullets: por que salvou, o que extrair, variação testável",
          "Revisão mensal: arquivo que nunca foi usado sai",
        ],
      },
      { type: "heading", level: 2, text: "Integração com EDIS" },
      {
        type: "paragraph",
        text:
          "O Swipe Files do próprio EDIS já indexa por ângulo. Se você salvar de lá, o .txt é automático. O valor fica no seu curadoria manual do que realmente serve.",
      },
    ],
  },

  // ── Research 360° ──────────────────────────────────────────────────────
  {
    id: "research-01",
    moduleId: "research-360",
    order: 1,
    type: "video",
    title: "O que é research de verdade",
    description:
      "Não é lookalike. Research é extrair ângulo, objeção e linguagem do próprio mercado antes de escrever.",
    durationSec: 5 * 60 + 40,
    videoUrl: video(3),
  },
  {
    id: "research-02",
    moduleId: "research-360",
    order: 2,
    type: "video",
    title: "Scrapando Meta Ads Library",
    description:
      "Como usar a biblioteca pública do Meta pra mapear o que concorrentes estão rodando há > 30 dias.",
    durationSec: 14 * 60 + 10,
    videoUrl: video(4),
  },
  {
    id: "research-03",
    moduleId: "research-360",
    order: 3,
    type: "article",
    title: "Reddit é ouro — se você souber ler",
    description: "Subreddits, filtros temporais, e como separar sinal de ruído.",
    durationSec: 5 * 60,
    content: [
      { type: "heading", level: 2, text: "O que Reddit tem que outras redes não têm" },
      {
        type: "paragraph",
        text:
          "Reddit é uma das poucas redes onde as pessoas ainda escrevem em texto longo sobre problemas reais. Isso é ouro pra quem quer entender a LINGUAGEM exata do mercado.",
      },
      { type: "heading", level: 2, text: "Fluxo de research" },
      {
        type: "list",
        items: [
          "Identifique 3-5 subreddits do nicho (r/fitness, r/advancedfitness, r/loseit etc)",
          "Filtre por \"top of year\" — posts que subiram de verdade",
          "Leia COMENTÁRIOS, não o post. Objeções moram lá",
          "Copie frase literal. Não parafrasee",
        ],
      },
      {
        type: "quote",
        text:
          "As melhores hooks de copy não saem da sua cabeça. Elas saem de comentários de Reddit com 200 upvotes.",
      },
    ],
  },
  {
    id: "research-04",
    moduleId: "research-360",
    order: 4,
    type: "video",
    title: "TikTok: pattern interrupts em escala",
    description:
      "Como a feed page recomenda, o que copiar da lógica pra feed de Meta, e por que o hook precisa ser mais curto ainda.",
    durationSec: 9 * 60 + 20,
    videoUrl: video(5),
  },
  {
    id: "research-05",
    moduleId: "research-360",
    order: 5,
    type: "video",
    title: "Consolidando: do research ao briefing",
    description:
      "Como sair de 40 páginas de screenshots pra um briefing de 1 página que o copywriter usa.",
    durationSec: 11 * 60,
    videoUrl: video(0),
  },

  // ── Editor pro ──────────────────────────────────────────────────────────
  {
    id: "editor-01",
    moduleId: "editor-pro",
    order: 1,
    type: "video",
    title: "Tour: o que o Editor faz",
    description: "10 minutos rápidos pelo Editor — o que ele faz e o que não faz.",
    durationSec: 10 * 60 + 15,
    videoUrl: video(1),
  },
  {
    id: "editor-02",
    moduleId: "editor-pro",
    order: 2,
    type: "video",
    title: "Montando seu primeiro template",
    description:
      "Pega um brief da referência, abre template, troca elementos, exporta. Do zero ao MP4.",
    durationSec: 13 * 60 + 45,
    videoUrl: video(2),
  },
  {
    id: "editor-03",
    moduleId: "editor-pro",
    order: 3,
    type: "article",
    title: "Os 4 elementos de todo criativo que converte",
    description: "Hook visual, promessa, prova, CTA. O resto é decoração.",
    durationSec: 4 * 60,
    content: [
      { type: "heading", level: 2, text: "Anatomia de um criativo que converte" },
      {
        type: "paragraph",
        text:
          "Independente de ser vídeo ou estático, todo criativo performático tem 4 elementos. Se algum faltar, o CTR afunda.",
      },
      { type: "heading", level: 3, text: "1. Hook visual" },
      {
        type: "paragraph",
        text:
          "Primeiro 0,8s. É o que faz o dedo parar de scrollar. Contraste alto, movimento, rosto, número na tela.",
      },
      { type: "heading", level: 3, text: "2. Promessa clara" },
      {
        type: "paragraph",
        text:
          "Em uma frase: o que a pessoa ganha. Não é feature. É benefício pessoal.",
      },
      { type: "heading", level: 3, text: "3. Prova" },
      {
        type: "paragraph",
        text:
          "Depoimento, resultado numérico, antes/depois, selo de autoridade. Uma das quatro, escolha a que o nicho acredita.",
      },
      { type: "heading", level: 3, text: "4. CTA direta" },
      {
        type: "paragraph",
        text:
          "Verbo + próximo passo específico. \"Clique no link\" já não basta — \"pegue o desconto antes que expire\" funciona melhor.",
      },
    ],
  },
  {
    id: "editor-04",
    moduleId: "editor-pro",
    order: 4,
    type: "video",
    title: "Variações: a matemática que ninguém te contou",
    description: "Por que 20 variações são melhores que 1 polido. Como sistematizar.",
    durationSec: 7 * 60 + 50,
    videoUrl: video(3),
  },

  // ── Analytics & iteração ────────────────────────────────────────────────
  {
    id: "analytics-01",
    moduleId: "analytics-iteracao",
    order: 1,
    type: "article",
    title: "Glossário honesto: CPM, CTR, CPC, CPA, ROAS",
    description:
      "O que cada métrica de fato diz — sem o marketês corporativo.",
    durationSec: 6 * 60,
    content: [
      { type: "heading", level: 2, text: "Por que o glossário oficial atrapalha" },
      {
        type: "paragraph",
        text:
          "A maioria dos guias trata métricas como fórmulas. Na prática, cada métrica responde UMA pergunta específica — e saber qual é essa pergunta vale mais que a definição.",
      },
      { type: "heading", level: 3, text: "CPM — quão caro é esse público?" },
      {
        type: "paragraph",
        text:
          "Custo por mil impressões. Alto = público disputado. Importante, mas não controlável por criativo.",
      },
      { type: "heading", level: 3, text: "CTR — meu hook funciona?" },
      {
        type: "paragraph",
        text:
          "Clique por impressão. Essa é a métrica do criativo. Abaixo de 1% em direct response = rever hook.",
      },
      { type: "heading", level: 3, text: "CPA — minha oferta aguenta?" },
      {
        type: "paragraph",
        text:
          "Custo por aquisição. Se o CPA é maior que LTV, a festa acabou. Métrica do offer + funil.",
      },
      { type: "heading", level: 3, text: "ROAS — meu dinheiro volta?" },
      {
        type: "paragraph",
        text:
          "Revenue ÷ spend. Métrica final. Mas engana: ROAS de 1,5 pode ser lucro (produto com margem alta) ou prejuízo (commodities).",
      },
    ],
  },
  {
    id: "analytics-02",
    moduleId: "analytics-iteracao",
    order: 2,
    type: "video",
    title: "Quando matar um criativo",
    description:
      "Janela de aprendizado, limiares de decisão e o erro de matar cedo demais.",
    durationSec: 11 * 60 + 5,
    videoUrl: video(4),
  },
  {
    id: "analytics-03",
    moduleId: "analytics-iteracao",
    order: 3,
    type: "video",
    title: "Quando escalar — e como não quebrar",
    description:
      "A regra dos 20%, quando usar CBO vs ABO, e sinais de fadiga.",
    durationSec: 15 * 60 + 30,
    videoUrl: video(5),
  },
  {
    id: "analytics-04",
    moduleId: "analytics-iteracao",
    order: 4,
    type: "video",
    title: "Iterar vs recomeçar",
    description:
      "Quando um criativo serve de base pra variação e quando é melhor voltar pro research.",
    durationSec: 8 * 60 + 40,
    videoUrl: video(0),
  },
  {
    id: "analytics-05",
    moduleId: "analytics-iteracao",
    order: 5,
    type: "article",
    title: "Dashboard mental: as 3 perguntas diárias",
    description: "O que olhar toda manhã em 90 segundos.",
    durationSec: 3 * 60,
    content: [
      { type: "heading", level: 2, text: "90 segundos, 3 perguntas" },
      {
        type: "paragraph",
        text:
          "Abrir o Meta Ads Manager todo dia pra olhar 40 métricas é o caminho rápido pra decisão ruim. Essas 3 perguntas resolvem 80% dos casos:",
      },
      {
        type: "list",
        items: [
          "1. Meu CPA ontem está dentro do target? — se sim, deixa rodar",
          "2. Algum criativo subiu CPM 30% em 48h? — sinal de fadiga, prepara variação",
          "3. ROAS semanal > ROAS mensal? — tá melhorando, valor investir mais",
        ],
      },
      {
        type: "quote",
        text:
          "Gestor que olha painel toda hora toma decisão ruim. O painel serve o setup, não o instinto.",
      },
    ],
  },

  // ── Templates validados ─────────────────────────────────────────────────
  {
    id: "templates-01",
    moduleId: "templates-validados",
    order: 1,
    type: "article",
    title: "Como a biblioteca foi construída",
    description:
      "Critérios de validação dos templates: CPA, volume, longevidade, nichos.",
    durationSec: 4 * 60,
    content: [
      { type: "heading", level: 2, text: "O que vira template no EDIS" },
      {
        type: "paragraph",
        text:
          "Só entra na biblioteca depois de bater 3 critérios simultaneamente:",
      },
      {
        type: "list",
        items: [
          "CPA abaixo do target em ao menos 2 contas diferentes",
          "Volume > 50k impressões (elimina falso positivo de amostra)",
          "Longevidade — continuou rodando > 21 dias sem fatiga",
        ],
      },
      {
        type: "paragraph",
        text:
          "A regra elimina uns 90% dos criativos de alta performance de curto prazo, mas esses 10% restantes são o que realmente escala.",
      },
    ],
  },
  {
    id: "templates-02",
    moduleId: "templates-validados",
    order: 2,
    type: "video",
    title: "Top 5 templates de saúde & fitness",
    description:
      "Os 5 templates que mais performaram no nicho nos últimos 90 dias, com notas de uso.",
    durationSec: 13 * 60 + 20,
    videoUrl: video(1),
  },
  {
    id: "templates-03",
    moduleId: "templates-validados",
    order: 3,
    type: "video",
    title: "Top 5 templates de SaaS & infoprodutos",
    description: "Mesmo formato, nicho diferente. O que mudou no hook.",
    durationSec: 11 * 60 + 45,
    videoUrl: video(2),
  },
];

// ─── Derived helpers ────────────────────────────────────────────────────────

export function getModule(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getLessonsForModule(moduleId: string): Lesson[] {
  return LESSONS.filter((l) => l.moduleId === moduleId).sort(
    (a, b) => a.order - b.order
  );
}

export function getLesson(lessonId: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === lessonId);
}

export function thumbUrl(seed: string, w = 640, h = 360): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/** Format duration in seconds as "Xh Ym" / "Xm Ys" / "Xs". */
export function formatDuration(secs: number): string {
  const s = Math.round(secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec > 0 && m < 10 ? sec + "s" : ""}`.trim();
  return `${sec}s`;
}

/** Shorter variant for dense UI — always "Xm" or "X:YY". */
export function formatDurationShort(secs: number): string {
  const s = Math.round(secs);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (s < 60) return `${s}s`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
