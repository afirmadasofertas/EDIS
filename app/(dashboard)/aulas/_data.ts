/**
 * Aulas mock data. Replace with CMS / backend data once the course platform
 * ships.
 *
 * Videos use Google's free sample mp4s so the HTML5 player works out of
 * the box with no extra config. Thumbnails live in public/aulas/thumbnails.
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
    id: "comecando",
    title: "01 - Começando",
    description:
      "Primeiros passos para entender o EDIS, navegar pelas ferramentas e tirar dúvidas sem perder ritmo.",
    thumbnailSeed: "modulo-01-comecando",
    level: "iniciante",
    tags: ["Começo", "Fundamentos"],
    instructor: "Marcos Viana",
  },
  {
    id: "dashboard",
    title: "02 - Dashboard",
    description:
      "Acompanhe criativos, métricas e sinais de performance em um só lugar antes de decidir o próximo passo.",
    thumbnailSeed: "modulo-02-dashboard",
    level: "iniciante",
    tags: ["Dashboard", "Métricas"],
    instructor: "Marcos Viana",
  },
  {
    id: "space",
    title: "03 - Space",
    description:
      "Gere imagens e vídeos livres com prompts, variações e regeneração dentro do fluxo de criação.",
    thumbnailSeed: "modulo-03-space",
    level: "iniciante",
    tags: ["Space", "Geração"],
    instructor: "Marcos Viana",
  },
  {
    id: "editor",
    title: "04 - Editor",
    description:
      "Use templates validados, troque assets e copy, crie variações e exporte criativos prontos para rodar.",
    thumbnailSeed: "modulo-04-editor",
    level: "iniciante",
    tags: ["Editor", "Templates"],
    instructor: "Marcos Viana",
  },
  {
    id: "crow-ai",
    title: "05 - CrowAI",
    description:
      "Transforme research de Meta Ads, Reddit e TikTok em hooks, ângulos, objeções e copy acionável.",
    thumbnailSeed: "modulo-05-crow-ai",
    level: "intermediário",
    tags: ["CrowAI", "Research"],
    instructor: "Marcos Viana",
  },
  {
    id: "swipe-files",
    title: "06 - Swipe files",
    description:
      "Organize anúncios validados por nicho, oferta e ângulo para encontrar referências úteis mais rápido.",
    thumbnailSeed: "modulo-06-swipe-files",
    level: "intermediário",
    tags: ["Swipe", "Referências"],
    instructor: "Marcos Viana",
  },
  {
    id: "drive",
    title: "07 - Drive",
    description:
      "Gerencie arquivos criativos, pastas, compartilhamentos e revisões sem tirar o time do fluxo.",
    thumbnailSeed: "modulo-07-drive",
    level: "iniciante",
    tags: ["Drive", "Arquivos"],
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
  {
    id: "comecando-01",
    moduleId: "comecando",
    order: 1,
    type: "video",
    title: "Comece Aqui: Como usar o EDIS",
    description:
      "Um tour rápido para entender o fluxo do EDIS e saber por onde começar.",
    durationSec: 4 * 60 + 30,
    videoUrl: video(0),
  },
  {
    id: "comecando-02",
    moduleId: "comecando",
    order: 2,
    type: "video",
    title: "Conhecendo as Ferramentas",
    description:
      "Veja como Dashboard, Space, Editor, CrowAI, Swipe files e Drive se conectam.",
    durationSec: 6 * 60,
    videoUrl: video(1),
  },
  {
    id: "comecando-03",
    moduleId: "comecando",
    order: 3,
    type: "video",
    title: "Tirando Dúvidas",
    description:
      "Aprenda onde encontrar respostas e como seguir quando surgir uma dúvida.",
    durationSec: 3 * 60 + 45,
    videoUrl: video(2),
  },
  {
    id: "dashboard-01",
    moduleId: "dashboard",
    order: 1,
    type: "video",
    title: "Visão geral do Dashboard",
    description:
      "Entenda os principais blocos da tela e como ler o status dos seus criativos.",
    durationSec: 5 * 60 + 20,
    videoUrl: video(3),
  },
  {
    id: "dashboard-02",
    moduleId: "dashboard",
    order: 2,
    type: "video",
    title: "Lendo métricas sem ruído",
    description:
      "Use os sinais certos para decidir se vale iterar, pausar ou escalar.",
    durationSec: 7 * 60 + 10,
    videoUrl: video(4),
  },
  {
    id: "dashboard-03",
    moduleId: "dashboard",
    order: 3,
    type: "article",
    title: "Rotina diária de análise",
    description:
      "Um checklist simples para revisar campanhas sem se perder em métricas.",
    durationSec: 4 * 60,
    content: [
      { type: "heading", level: 2, text: "A análise em poucos minutos" },
      {
        type: "paragraph",
        text:
          "Comece pelos criativos que mais gastaram, compare variação de custo e só depois aprofunde em métricas secundárias. O Dashboard existe para reduzir decisões impulsivas.",
      },
      {
        type: "list",
        items: [
          "Revise campanhas ativas antes de abrir novas abas.",
          "Compare criativos por objetivo, não por vaidade visual.",
          "Anote hipóteses de melhoria antes de editar qualquer peça.",
        ],
      },
    ],
  },
  {
    id: "space-01",
    moduleId: "space",
    order: 1,
    type: "video",
    title: "Criando sua primeira imagem no Space",
    description:
      "Use prompts, referências e variações para sair de uma ideia para um visual testável.",
    durationSec: 6 * 60 + 15,
    videoUrl: video(5),
  },
  {
    id: "space-02",
    moduleId: "space",
    order: 2,
    type: "video",
    title: "Variações que preservam a direção",
    description:
      "Como ajustar composição, estilo e formato sem perder a ideia central.",
    durationSec: 8 * 60,
    videoUrl: video(0),
  },
  {
    id: "space-03",
    moduleId: "space",
    order: 3,
    type: "article",
    title: "Boas práticas de prompt",
    description:
      "Uma estrutura curta para prompts mais claros e resultados mais consistentes.",
    durationSec: 5 * 60,
    content: [
      { type: "heading", level: 2, text: "Prompt bom tem direção" },
      {
        type: "paragraph",
        text:
          "Descreva o objetivo do criativo, o assunto principal, o enquadramento, a luz, o formato e o que deve ser evitado. Quanto menos ambíguo, melhor o resultado.",
      },
      {
        type: "list",
        items: [
          "Comece pelo uso final da imagem.",
          "Defina uma composição principal.",
          "Evite pedir muitos estilos ao mesmo tempo.",
        ],
      },
    ],
  },
  {
    id: "editor-01",
    moduleId: "editor",
    order: 1,
    type: "video",
    title: "Tour pelo Editor",
    description:
      "Conheça a área de edição, os templates e os pontos que mais economizam tempo.",
    durationSec: 7 * 60,
    videoUrl: video(1),
  },
  {
    id: "editor-02",
    moduleId: "editor",
    order: 2,
    type: "video",
    title: "Criando variações a partir de um template",
    description:
      "Troque imagem, copy e CTA para gerar versões prontas para teste.",
    durationSec: 9 * 60 + 30,
    videoUrl: video(2),
  },
  {
    id: "editor-03",
    moduleId: "editor",
    order: 3,
    type: "article",
    title: "Checklist antes de exportar",
    description:
      "Revise contraste, hierarquia, formatos e consistência antes de publicar.",
    durationSec: 4 * 60 + 20,
    content: [
      { type: "heading", level: 2, text: "O que conferir" },
      {
        type: "list",
        items: [
          "A promessa principal aparece rápido.",
          "O CTA está legível no formato final.",
          "Logo, produto e oferta não competem entre si.",
          "A variação tem uma hipótese clara.",
        ],
      },
    ],
  },
  {
    id: "crow-ai-01",
    moduleId: "crow-ai",
    order: 1,
    type: "video",
    title: "Como o CrowAI faz research",
    description:
      "Veja como o agente encontra sinais de mercado antes de escrever copy.",
    durationSec: 8 * 60 + 45,
    videoUrl: video(3),
  },
  {
    id: "crow-ai-02",
    moduleId: "crow-ai",
    order: 2,
    type: "video",
    title: "Transformando dados em hooks",
    description:
      "Converta objeções, comentários e anúncios ativos em ideias de criativo.",
    durationSec: 10 * 60 + 10,
    videoUrl: video(4),
  },
  {
    id: "crow-ai-03",
    moduleId: "crow-ai",
    order: 3,
    type: "article",
    title: "Como revisar a copy gerada",
    description:
      "Critérios para manter a copy precisa, humana e alinhada ao nicho.",
    durationSec: 5 * 60 + 30,
    content: [
      { type: "heading", level: 2, text: "Revisão inteligente" },
      {
        type: "paragraph",
        text:
          "A saída do CrowAI é um ponto de partida forte. Revise promessa, prova, clareza e aderência ao público antes de enviar para o Editor.",
      },
      {
        type: "list",
        items: [
          "Procure frases genéricas e torne-as específicas.",
          "Mantenha o benefício visível antes da feature.",
          "Use a linguagem do mercado sem copiar concorrentes.",
        ],
      },
    ],
  },
  {
    id: "swipe-files-01",
    moduleId: "swipe-files",
    order: 1,
    type: "video",
    title: "Organizando referências por ângulo",
    description:
      "Aprenda a salvar anúncios de um jeito que ajude na hora de criar.",
    durationSec: 6 * 60 + 50,
    videoUrl: video(5),
  },
  {
    id: "swipe-files-02",
    moduleId: "swipe-files",
    order: 2,
    type: "video",
    title: "Encontrando padrões que valem teste",
    description:
      "Compare peças por oferta, promessa e mecanismo para separar sinal de ruído.",
    durationSec: 8 * 60 + 20,
    videoUrl: video(0),
  },
  {
    id: "swipe-files-03",
    moduleId: "swipe-files",
    order: 3,
    type: "article",
    title: "Como transformar referência em hipótese",
    description:
      "Use uma referência como ponto de partida sem copiar a peça original.",
    durationSec: 4 * 60 + 40,
    content: [
      { type: "heading", level: 2, text: "Referência não é atalho" },
      {
        type: "paragraph",
        text:
          "O objetivo do Swipe files é entender por que um criativo funciona. Extraia o ângulo, a promessa e a estrutura antes de criar sua versão.",
      },
      {
        type: "list",
        items: [
          "Identifique a objeção principal.",
          "Escreva uma hipótese testável.",
          "Crie uma variação com identidade própria.",
        ],
      },
    ],
  },
  {
    id: "drive-01",
    moduleId: "drive",
    order: 1,
    type: "video",
    title: "Gerenciando criativos e arquivos",
    description:
      "Organize criativos, materiais de campanha e versões em uma estrutura clara.",
    durationSec: 5 * 60 + 35,
    videoUrl: video(1),
  },
  {
    id: "drive-02",
    moduleId: "drive",
    order: 2,
    type: "video",
    title: "Compartilhamento e revisão",
    description:
      "Veja como enviar materiais para revisão e acompanhar o que mudou.",
    durationSec: 7 * 60 + 25,
    videoUrl: video(2),
  },
  {
    id: "drive-03",
    moduleId: "drive",
    order: 3,
    type: "article",
    title: "Padrão de organização recomendado",
    description:
      "Um modelo simples para evitar arquivos soltos e versões duplicadas.",
    durationSec: 4 * 60 + 10,
    content: [
      { type: "heading", level: 2, text: "Estrutura sugerida" },
      {
        type: "list",
        items: [
          "Separe pastas por campanha ou cliente.",
          "Use nomes com data, formato e variação.",
          "Arquive criativos antigos sem apagar histórico útil.",
        ],
      },
    ],
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

export function thumbUrl(seed: string, _w = 640, _h = 360): string {
  return `/aulas/thumbnails/${seed}.png`;
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
