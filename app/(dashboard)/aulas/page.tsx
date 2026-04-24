import { MODULES } from "./_data";
import { ModuleCard } from "./_module-card";

export default function AulasPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <span className="edis-tag">Aulas</span>
        <h1
          className="font-display text-[30px] font-medium leading-[1.1] tracking-tight text-foreground"
          style={{ letterSpacing: "-0.025em" }}
        >
          Tire dúvidas e aprenda a plataforma.
        </h1>
        <p className="max-w-2xl text-[14px] leading-[1.55] text-edis-text-3">
          Vídeos curtos e artigos objetivos cobrindo Editor, CrowAI, Drive,
          Analytics e fundamentos de copy e research. Se pintou dúvida de como
          algo funciona por aqui, provavelmente já tem resposta — é mais rápido
          que abrir um ticket.
        </p>
      </header>

      {/* Modules grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <ModuleCard key={m.id} module={m} />
        ))}
      </div>
    </div>
  );
}
