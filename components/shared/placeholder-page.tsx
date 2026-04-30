import type { IconSvgElement } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/icon";

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: IconSvgElement;
  comingSoon?: string;
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  icon,
  comingSoon = "Em breve",
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="edis-tag">{eyebrow}</span>
        </div>
        <h1
          className="font-display text-[34px] font-medium leading-[1.05] tracking-tight text-foreground"
          style={{ letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>
        <p className="max-w-xl text-[15px] leading-[1.55] text-edis-text-2">
          {description}
        </p>
      </header>

      <Card className="border-border bg-card shadow-none">
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex size-11 items-center justify-center rounded-md border border-edis-line-2 bg-edis-ink-3">
            <Icon icon={icon} size={20} className="text-edis-text-2" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="edis-tag">{comingSoon}</span>
            <p className="max-w-sm text-[13.5px] leading-[1.55] text-edis-text-3">
              Esta seção ainda não foi construída. A casca está pronta. O
              conteúdo chega nas próximas fases.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
