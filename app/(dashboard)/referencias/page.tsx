"use client";

import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Menu01Icon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";

type Reference = {
  id: string;
  name: string;
  description: string;
  whenToUse: string;
  preview: () => React.ReactNode;
};

const REFERENCES: Reference[] = [
  {
    id: "noticia",
    name: "Formato Notícia",
    description: "Cara de matéria de jornal — quebra padrão de feed.",
    whenToUse: "Ofertas locais, lançamentos, validação social.",
    preview: NoticiaPreview,
  },
  {
    id: "fofoca",
    name: "Página de fofoca",
    description: "Estilo Choquei — viral, autoridade emprestada.",
    whenToUse: "Estética, transformação, prova social impactante.",
    preview: FofocaPreview,
  },
  {
    id: "vs-concorrente",
    name: "Você x Concorrente",
    description: "Comparativo split — virtudes vs falhas.",
    whenToUse: "Quando seu produto resolve a dor que o concorrente cria.",
    preview: VersusPreview,
  },
  {
    id: "antes-depois",
    name: "Antes x Depois UGC",
    description: "Selfie antes / selfie depois com produto.",
    whenToUse: "Resultado físico ou estético verificável.",
    preview: BeforeAfterPreview,
  },
  {
    id: "promocao",
    name: "Promoção",
    description: "Hero shot do produto + desconto gigante + bônus.",
    whenToUse: "Black Friday, queima de estoque, oferta de lançamento.",
    preview: PromocaoPreview,
  },
];

export default function ReferenciasPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <header className="flex flex-col gap-1.5">
        <span className="edis-tag">Referências</span>
        <h1
          className="font-display text-[30px] font-medium leading-[1.1] tracking-tight text-foreground"
          style={{ letterSpacing: "-0.025em" }}
        >
          Formatos que vendem.
        </h1>
        <p className="max-w-2xl text-[14px] leading-[1.55] text-edis-text-3">
          Os 5 formatos que mais convertem em ads diretos no Brasil hoje.
          Use como referência visual no editor — copia o layout, adapta pro
          seu nicho.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REFERENCES.map((ref) => (
          <article
            key={ref.id}
            className="flex flex-col gap-3 overflow-hidden rounded-xl border border-edis-line-1 bg-edis-ink-1 p-3 transition-colors duration-150 hover:border-edis-line-3"
          >
            <div className="overflow-hidden rounded-lg border border-edis-line-2">
              {ref.preview()}
            </div>
            <div className="flex flex-col gap-1 px-1 pb-1 pt-0.5">
              <h3 className="text-[14px] font-medium text-foreground">
                {ref.name}
              </h3>
              <p className="line-clamp-2 text-[12.5px] leading-[1.5] text-edis-text-3">
                {ref.description}
              </p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-edis-text-4">
                Usar quando
              </p>
              <p className="text-[11.5px] leading-[1.5] text-edis-text-2">
                {ref.whenToUse}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ─── Previews ────────────────────────────────────────────────────── */

function NoticiaPreview() {
  return (
    <div className="flex aspect-[4/5] flex-col bg-white text-black">
      <div className="flex items-center gap-2 bg-[#d0021b] px-3 py-2 text-white">
        <Icon icon={Menu01Icon} size={14} className="text-white" />
        <span className="flex-1 text-center font-display text-[12.5px] font-bold tracking-[0.06em]">
          NOTÍCIA
        </span>
        <Icon icon={Search01Icon} size={14} className="text-white" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h4 className="font-display text-[14px] font-extrabold leading-[1.05] uppercase">
          Empresa local revoluciona mercado e chama atenção da cidade
        </h4>
        <p className="line-clamp-2 text-[10px] leading-[1.4] text-neutral-700">
          Atendimento personalizado, preço justo e qualidade impressionante.
        </p>
        <div className="mt-1.5 grid grid-cols-2 gap-1">
          <div className="aspect-[4/5] rounded-sm bg-gradient-to-br from-neutral-300 to-neutral-500" />
          <div className="aspect-[4/5] rounded-sm bg-gradient-to-br from-neutral-700 to-black" />
        </div>
      </div>
    </div>
  );
}

function FofocaPreview() {
  return (
    <div className="flex aspect-[4/5] flex-col gap-2 bg-white p-3 text-black">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-full bg-yellow-400 font-display text-[10px] font-extrabold uppercase tracking-tight text-black">
          C!
        </div>
        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-[11px] font-bold leading-tight">
            CHOQUEI
            <Icon icon={CheckmarkCircle02Icon} size={11} className="text-blue-500" />
          </span>
          <span className="text-[9.5px] text-neutral-500">@choquei</span>
        </div>
      </div>
      <p className="text-[10.5px] leading-[1.45] text-black">
        <strong>POLÊMICA!</strong> Médica revoluciona pacientes que sofriam
        com <strong>questão estética</strong>. Técnica permite{" "}
        <strong>correção em 40 minutos</strong> e sem dor.
      </p>
      <div className="mt-auto grid grid-cols-2 gap-1">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-gradient-to-br from-pink-200 to-pink-400">
          <span className="absolute bottom-1 right-1 rounded bg-yellow-400 px-1 py-0.5 font-display text-[7px] font-extrabold tracking-tight">
            ANTES
          </span>
        </div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-gradient-to-br from-emerald-200 to-emerald-500">
          <span className="absolute bottom-1 right-1 rounded bg-yellow-400 px-1 py-0.5 font-display text-[7px] font-extrabold tracking-tight">
            DEPOIS
          </span>
        </div>
      </div>
    </div>
  );
}

function VersusPreview() {
  return (
    <div className="flex aspect-[4/5] flex-row text-[10px] font-medium">
      <div className="relative flex flex-1 flex-col gap-1.5 bg-neutral-200 p-3 text-black">
        <span className="font-display text-[15px] font-extrabold leading-[0.95]">
          Genérico
        </span>
        <div className="my-2 grid place-items-center">
          <div className="size-12 rounded-md bg-neutral-300" />
        </div>
        {["Caro", "Frágil", "Cheira mal"].map((t) => (
          <div key={t} className="flex items-center gap-1.5 text-[9.5px]">
            <Icon icon={Cancel01Icon} size={10} className="text-red-500" />
            <span>{t}</span>
          </div>
        ))}
      </div>
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-edis-mint px-2 py-0.5 font-display text-[10px] font-extrabold text-black">
        VS
      </div>
      <div className="relative flex flex-1 flex-col gap-1.5 bg-edis-mint p-3 text-black">
        <span className="font-display text-[15px] font-extrabold leading-[0.95]">
          Seu produto
        </span>
        <div className="my-2 grid place-items-center">
          <div className="size-12 rounded-md bg-emerald-700" />
        </div>
        {["Acessível", "Durável", "Cheiro bom"].map((t) => (
          <div key={t} className="flex items-center gap-1.5 text-[9.5px]">
            <Icon icon={Tick02Icon} size={10} className="text-emerald-900" />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BeforeAfterPreview() {
  return (
    <div className="relative flex aspect-[4/5] gap-px bg-black p-2">
      <div className="relative flex-1 overflow-hidden rounded-sm bg-gradient-to-b from-neutral-700 to-neutral-900">
        <span className="absolute left-2 top-2 font-display text-[10px] italic text-white/80">
          Day 1
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden rounded-sm bg-gradient-to-b from-amber-200 to-amber-500">
        <span className="absolute right-2 top-2 font-display text-[10px] italic text-black">
          Day 30
        </span>
      </div>
      <div className="absolute inset-x-0 top-3 z-10 text-center font-display text-[12px] font-bold text-white">
        30 days on Edis
      </div>
    </div>
  );
}

function PromocaoPreview() {
  return (
    <div className="flex aspect-[4/5] flex-col items-center justify-center gap-2 bg-emerald-900 p-4 text-center text-white">
      <h4 className="font-display text-[24px] font-black leading-[0.9] tracking-[-0.02em] text-yellow-400">
        SAVE
        <br />
        52% OFF
      </h4>
      <p className="text-[10px] leading-tight text-white/85">
        First subscription month.
        <br />
        Cancel any time.
      </p>
      <div className="my-1 size-16 rounded-md bg-emerald-600" />
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[8px] font-medium">
        {["Frete grátis", "Brinde", "Garantia"].map((t) => (
          <span key={t} className="flex items-center gap-1">
            <Icon icon={Tick02Icon} size={8} className="text-yellow-400" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
