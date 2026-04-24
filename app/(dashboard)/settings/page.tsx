import { Settings01Icon } from "@hugeicons/core-free-icons";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Configurações"
      title="Conta, time e integrações."
      description="Perfil, billing, conexão com Meta Ads e convites de time. Tudo o que precisa pra botar o EDIS pra rodar no seu workflow."
      icon={Settings01Icon}
    />
  );
}
