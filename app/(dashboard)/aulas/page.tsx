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
          Bem-vindo às aulas do EDIS
        </h1>
        <p className="max-w-2xl text-[14px] leading-[1.55] text-edis-text-3">
          Tire dúvidas e aproveite ao máximo o EDIS com este minicurso e outras
          informações.
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
