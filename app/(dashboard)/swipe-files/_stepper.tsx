"use client";

import {
  Edit01Icon,
  Atom02Icon,
  OrthogonalEdgeIcon,
  MagicWand01Icon,
  Image02Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const PHASES = [
  { id: 1, label: "Briefing", icon: Edit01Icon },
  { id: 2, label: "DNA Brand", icon: Atom02Icon },
  { id: 3, label: "Templates", icon: OrthogonalEdgeIcon },
  { id: 4, label: "Geração", icon: MagicWand01Icon },
  { id: 5, label: "Galeria", icon: Image02Icon },
];

interface PhaseStepperProps {
  activePhase: number;
  onPhaseClick?: (phase: number) => void;
}

export function PhaseStepper({ activePhase, onPhaseClick }: PhaseStepperProps) {
  return (
    <div className="flex items-start">
      {PHASES.map((phase, i) => {
        const isActive = phase.id === activePhase;
        const isDone = phase.id < activePhase;

        return (
          <div key={phase.id} className="flex flex-1 items-start">
            {/* Step */}
            <button
              onClick={() => onPhaseClick?.(phase.id)}
              className="flex flex-col items-center gap-2 outline-none"
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-[12px] font-medium transition-all duration-200",
                  isActive &&
                    "border-edis-mint bg-edis-mint/10 text-edis-mint",
                  isDone &&
                    "border-edis-mint bg-edis-mint text-edis-ink-0",
                  !isActive &&
                    !isDone &&
                    "border-edis-line-2 bg-edis-ink-2 text-edis-text-4"
                )}
              >
                {isDone ? (
                  <Icon icon={Tick01Icon} size={13} strokeWidth={2} />
                ) : (
                  <Icon
                    icon={phase.icon}
                    size={14}
                    strokeWidth={isActive ? 1.75 : 1.5}
                    className={isActive ? "text-edis-mint" : "text-edis-text-4"}
                  />
                )}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors duration-200",
                  isActive ? "text-edis-mint" : "text-edis-text-4"
                )}
              >
                {phase.label}
              </span>
            </button>

            {/* Connector */}
            {i < PHASES.length - 1 && (
              <div
                className={cn(
                  "mx-2 mt-4 h-px flex-1 transition-colors duration-200",
                  isDone ? "bg-edis-mint/25" : "bg-edis-line-2"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
