import { Coins01Icon } from "@hugeicons/core-free-icons";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function UsagePage() {
  return (
    <PlaceholderPage
      eyebrow="Usage"
      title="Consumo de API e créditos."
      description="Acompanhe gasto de tokens, chamadas de imagem e vídeo, créditos restantes e histórico por mês. O medidor de quanto o EDIS tá custando no seu workflow."
      icon={Coins01Icon}
    />
  );
}
