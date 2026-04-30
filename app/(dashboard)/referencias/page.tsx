import Image from "next/image";

type Reference = {
  id: string;
  name: string;
  description: string;
  whenToUse: string;
  /** File under /public/referencias — see drop list at the bottom of the file. */
  image: string;
  alt: string;
};

const REFERENCES: Reference[] = [
  {
    id: "noticia",
    name: "Formato Notícia",
    description:
      "Cara de matéria de jornal. Quebra padrão de feed, alto CTR.",
    whenToUse: "Ofertas locais, lançamentos, validação de marca.",
    image: "/referencias/noticia.png",
    alt: "Reference: ad em formato notícia com header vermelho e headline em caixa alta",
  },
  {
    id: "fofoca",
    name: "Página de fofoca",
    description: "Estilo Choquei. Viral, autoridade emprestada de gossip.",
    whenToUse: "Estética, transformação, prova social impactante.",
    image: "/referencias/fofoca.png",
    alt: "Reference: ad estilo Choquei com perfil verificado e foto antes/depois",
  },
  {
    id: "vs-concorrente",
    name: "Você x Concorrente",
    description: "Comparativo split. Defeito do outro vs benefício seu.",
    whenToUse: "Quando seu produto resolve dor que o concorrente cria.",
    image: "/referencias/concorrente.png",
    alt: "Reference: comparativo entre concorrente genérico e produto da marca",
  },
  {
    id: "antes-depois",
    name: "Antes x Depois UGC",
    description: "Selfie antes / selfie depois com produto.",
    whenToUse: "Resultado físico ou estético verificável em N dias.",
    image: "/referencias/antes-depois.png",
    alt: "Reference: antes e depois UGC com Day 1 e Day 30",
  },
  {
    id: "promocao",
    name: "Promoção",
    description: "Hero shot do produto + desconto gigante + bônus.",
    whenToUse: "Black Friday, queima de estoque, oferta de lançamento.",
    image: "/referencias/promocao.png",
    alt: "Reference: criativo de promoção com SAVE 52% e produto em destaque",
  },
  {
    id: "review",
    name: "Reviews / Depoimentos",
    description: "Quote de cliente real + estrelas + foto do produto.",
    whenToUse: "Reforçar prova social depois do hook inicial.",
    image: "/referencias/review.png",
    alt: "Reference: criativo de review com depoimento, estrelas e produto",
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
          5 padrões de ad direto que mais convertem hoje. Use como
          referência visual no editor. Copia o layout, adapta pro seu
          nicho.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REFERENCES.map((ref) => (
          <article
            key={ref.id}
            className="flex flex-col gap-3 overflow-hidden rounded-xl border border-edis-line-1 bg-edis-ink-1 p-3 transition-colors duration-150 hover:border-edis-line-3"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-edis-line-2 bg-edis-ink-2">
              <Image
                src={ref.image}
                alt={ref.alt}
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover"
              />
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
