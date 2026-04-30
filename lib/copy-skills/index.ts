/**
 * Brazilian direct-response copywriting skills library.
 *
 * Used by the editor's /api/suggest-copy and the CrowAI page's
 * /api/crowai-copy endpoint. Encodes the patterns of high-converting
 * Brazilian SaaS / infoproduto / ecommerce ads ("estilo black"):
 *
 * - Personal voice (você, eu, tá, pra)
 * - Specific numbers and concrete promises
 * - Pain-naming over benefit-listing
 * - Action verbs that imply commitment
 * - No AI tells, no corporate-speak, no clichês
 */

// ---- Anti-AI patterns ------------------------------------------------

/**
 * Phrases that INSTANTLY mark copy as AI-generated or amateur.
 * Banned from every output.
 */
export const ANTI_AI_PATTERNS = [
  "transforme sua vida",
  "descubra os segredos",
  "incrível",
  "imperdível",
  "revolucionário",
  "exclusivo",
  "uma jornada",
  "desbloqueie seu potencial",
  "alcance seus sonhos",
  "é isso mesmo que você ouviu",
  "preparado para",
  "sem dúvida",
  "diga adeus",
  "não perca tempo",
  "comprovado cientificamente",
  "100% garantido",
  "passo a passo definitivo",
  "método infalível",
];

// ---- Hook patterns (how to OPEN) -------------------------------------

export type HookType =
  | "curiosity"
  | "callout"
  | "pain"
  | "proof"
  | "authority"
  | "contrarian";

export const HOOKS: Record<HookType, { name: string; recipe: string; example: string }> = {
  curiosity: {
    name: "Curiosity gap",
    recipe:
      "Open with a result, action or claim that creates an information gap — the reader has to keep reading to learn HOW.",
    example:
      "Eu tirei R$ 47k em 90 dias com Python — e o método não tem nada a ver com freelance.",
  },
  callout: {
    name: "Direct callout",
    recipe:
      "Open by addressing a specific person ('Pra quem...', 'Se você...'). Mirrors the reader's identity back at them.",
    example: "Pra quem trabalha 10h por dia e ainda não fechou os R$ 10k mensais.",
  },
  pain: {
    name: "Pain naming",
    recipe:
      "Name the exact internal monologue the reader has at 2am. Specific, uncomfortable, unmistakable.",
    example: "Você acorda às 6h, faz tudo certo, e olha a conta no fim do mês: nada.",
  },
  proof: {
    name: "Proof first",
    recipe:
      "Lead with a specific number, case, or result. Concrete > vague. Numbers >>> words.",
    example: "133 alunos já tiraram a primeira venda em até 7 dias.",
  },
  authority: {
    name: "Authority",
    recipe:
      "Lead with experience, position, or credential — but specific. Not 'sou expert', but 'orientei 312 clientes em 4 anos'.",
    example: "Em 4 anos orientando 312 clientes, esse foi o erro que mais matou faturamento.",
  },
  contrarian: {
    name: "Contrarian",
    recipe:
      "Reject the conventional wisdom. 'Esquece X', 'Não é Y', 'Pare de Z'. Pattern interrupt.",
    example: "Esquece esse papo de 'comece um nicho'. O que travava você era outra coisa.",
  },
};

// ---- Frameworks (how to STRUCTURE) -----------------------------------

export type FrameworkType = "PAS" | "AIDA" | "BAB" | "4U";

export const FRAMEWORKS: Record<FrameworkType, { name: string; recipe: string }> = {
  PAS: {
    name: "Problem · Agitate · Solve",
    recipe:
      "1) Nomeie o problema com precisão. 2) Vire a faca: descreva o custo de não resolver. 3) Apresente a solução.",
  },
  AIDA: {
    name: "Attention · Interest · Desire · Action",
    recipe:
      "1) Hook. 2) Mostre por que isso te interessa. 3) Pinte o cenário do depois. 4) CTA específico.",
  },
  BAB: {
    name: "Before · After · Bridge",
    recipe:
      "1) Realidade atual desconfortável. 2) Realidade desejada concreta. 3) Mecanismo único que conecta.",
  },
  "4U": {
    name: "Useful · Urgent · Unique · Ultra-specific",
    recipe:
      "Toda headline deve atender os 4: utilidade clara, prazo/urgência, ângulo único, número/detalhe específico.",
  },
};

// ---- Voice rules (HOW to write) --------------------------------------

export const VOICE_RULES = [
  "Pessoal, segunda pessoa: você, seu, sua. Nunca 'você(s)', 'os usuários'.",
  "Brasileiro coloquial: tá, pra, né, dá pra. Não 'está', 'para'.",
  "Números específicos: R$ 197, 7 dias, 3x — não 'barato', 'rápido', 'várias vezes'.",
  "Promessa concreta: 'R$ 5k em 30 dias com X' — não 'ficar rico', 'mudar de vida'.",
  "Verbos de ação que implicam compromisso: 'Garantir vaga', 'Entrar agora', 'Comprar' — não 'Saiba mais', 'Conheça'.",
  "Frases curtas. Pontuação limpa. Zero emoji a menos que o nicho exija (humor, gen-z).",
  "Sem CAPS LOCK. Sem ênfase com asteriscos. O peso vem da palavra escolhida, não da formatação.",
  "Dor antes do benefício. O leitor identifica o problema dele primeiro, depois decide se quer a solução.",
];

// ---- Few-shot examples (PT-BR) ---------------------------------------

/**
 * Side-by-side examples of AI-flavored vs black-style copy. The model
 * sees these and calibrates its output to the right register.
 */
export const FEW_SHOT_EXAMPLES = [
  {
    bad: "Transforme sua vida com nosso método revolucionário de Python!",
    good: "Aprenda Python suficiente pra fechar o primeiro freela em 30 dias.",
    why: "Promessa concreta + prazo + verbo específico. Zero clichê.",
  },
  {
    bad: "Descubra os segredos do mercado financeiro!",
    good: "O que ninguém te conta sobre Tesouro Direto em 7 minutos.",
    why: "Curiosity gap real + tempo específico + tema concreto.",
  },
  {
    bad: "Não perca tempo, garanta sua vaga agora!",
    good: "Sobram 8 vagas. Inscrição fecha sexta às 23h59.",
    why: "Escassez com número + deadline com hora. Urgência verificável.",
  },
  {
    bad: "Aprenda copywriting e mude sua carreira!",
    good: "Como escrever um headline que para o scroll em 2024.",
    why: "Tarefa específica + ano (atual) + benefício mensurável.",
  },
  {
    bad: "Curso completo, do zero ao avançado!",
    good: "47 horas de aulas. 3 projetos no portfólio. Suporte por WhatsApp.",
    why: "Três fatos verificáveis substituem o adjetivo vazio.",
  },
];

// ---- Compose helpers --------------------------------------------------

/**
 * Format the anti-AI list as a forbidden-phrases block for the prompt.
 */
export function formatBannedPhrases(): string {
  return [
    "PROIBIDO usar (cara de IA imediato):",
    ANTI_AI_PATTERNS.map((p) => `· "${p}"`).join("\n"),
  ].join("\n");
}

/**
 * Pick a hook flavor based on the niche / mode. Heuristic — when in doubt,
 * 'pain' is the safest default for direct response.
 */
export function suggestHookForNiche(niche: string, mode: "editorial" | "campaign"): HookType {
  const n = niche.toLowerCase();
  if (mode === "editorial") return "authority";
  if (/curso|aula|método|aprenda|treinamento/.test(n)) return "curiosity";
  if (/oferta|black|promo|desconto|cupom/.test(n)) return "proof";
  if (/cansad|frustrad|problema|dor/.test(n)) return "pain";
  return "callout";
}

/**
 * Render the few-shot examples as a copy block for the system prompt.
 */
export function formatFewShotBlock(): string {
  return [
    "Exemplos calibradores (RUIM cara de IA → BOM estilo black):",
    ...FEW_SHOT_EXAMPLES.map(
      (ex, i) =>
        `${i + 1}. RUIM: "${ex.bad}"\n   BOM: "${ex.good}"\n   POR QUÊ: ${ex.why}`
    ),
  ].join("\n\n");
}

/**
 * Render the voice rules as a numbered list block.
 */
export function formatVoiceRules(): string {
  return [
    "Regras de voz (sempre):",
    ...VOICE_RULES.map((r, i) => `${i + 1}. ${r}`),
  ].join("\n");
}

/**
 * Hook recipe + example for a chosen hook type.
 */
export function formatHookGuide(hook: HookType): string {
  const h = HOOKS[hook];
  return `Estrutura recomendada — ${h.name}:\n${h.recipe}\nExemplo: "${h.example}"`;
}
