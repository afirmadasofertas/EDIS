"use client";

import { useState } from "react";
import { PhaseStepper } from "./_stepper";
import { BriefingPhase } from "./_briefing";
import { PhasePlaceholder } from "./_phase-placeholder";

export default function GeradorPage() {
  const [activePhase, setActivePhase] = useState(1);

  function next() {
    setActivePhase((p) => Math.min(p + 1, 5));
  }

  function back() {
    setActivePhase((p) => Math.max(p - 1, 1));
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <span className="edis-tag">Gerador</span>
        <h1
          className="font-display text-[30px] font-medium leading-[1.1] text-foreground"
          style={{ letterSpacing: "-0.025em" }}
        >
          Gerador de Anúncios
        </h1>
        <p className="max-w-xl text-[14px] leading-[1.55] text-edis-text-3">
          40 anúncios profissionais para qualquer marca. Do briefing à galeria
          pronta para veicular.
        </p>
      </header>

      {/* Phase stepper */}
      <PhaseStepper activePhase={activePhase} onPhaseClick={setActivePhase} />

      {/* Phase content */}
      {activePhase === 1 && <BriefingPhase onNext={next} />}
      {activePhase > 1 && (
        <PhasePlaceholder phase={activePhase} onNext={next} onBack={back} />
      )}
    </div>
  );
}
