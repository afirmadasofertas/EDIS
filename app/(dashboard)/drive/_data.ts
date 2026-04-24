// Placeholder folders + files — replace with real data once the backend is
// wired. Thumbnails come from picsum.photos (deterministic via `seed/<id>`).

export type DriveFolder = {
  id: string;
  name: string;
  month: string; // display string, e.g. "Abril"
  year: number;
  fileCount: number;
  description?: string;
};

/** Patch shape accepted by folder-edit flows. */
export type DriveFolderUpdate = {
  name: string;
  month: string;
  year: number;
  description?: string;
};

export type DriveFile = {
  id: string;
  name: string;          // "CR01.png"
  size: number;          // bytes
  kind: "image" | "video" | "other";
  thumbnailUrl: string;  // absolute URL (picsum for mocks)
};

export type PromptItem = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  attachmentCount: number;
  fileTypes: string[];
  updatedAt: string;
};

export const SAMPLE_FOLDERS: DriveFolder[] = [
  { id: "02abr-star-canada", name: "02ABR STAR CANADA", month: "Abril", year: 2026, fileCount: 10 },
  { id: "22abr-australia-star", name: "22ABR Australia · Star", month: "Abril", year: 2026, fileCount: 10 },
  { id: "22abr-canada-star", name: "22ABR Canada · Star", month: "Abril", year: 2026, fileCount: 10 },
  { id: "milwaukee-5abr", name: "Milwaukee | 5ABR", month: "Abril", year: 2026, fileCount: 20 },
  { id: "star-01abr", name: "STAR 01ABR", month: "Abril", year: 2026, fileCount: 10 },
  { id: "star-17abr", name: "STAR 17ABR", month: "Abril", year: 2026, fileCount: 10 },
  { id: "bosch-13mar", name: "BOSCH 13MAR", month: "Março", year: 2026, fileCount: 13 },
  { id: "milwaukee-17mar", name: "Milwaukee | 17MAR", month: "Março", year: 2026, fileCount: 13 },
  { id: "milwaukee-18mar", name: "Milwaukee | 18MAR", month: "Março", year: 2026, fileCount: 10 },
  { id: "starconnect-cr-white-28mar", name: "STARCONNECT CR WHITE 28MAR", month: "Março", year: 2026, fileCount: 10 },
  { id: "starlink-27mar", name: "STARLINK 27MAR", month: "Março", year: 2026, fileCount: 10 },
];

export const SAMPLE_PROMPTS: PromptItem[] = [
  {
    id: "prompt-produto-cinematico",
    title: "Produto cinematográfico em fundo escuro",
    description:
      "Prompt base para gerar variações de produto com luz dramática, fundo preto e destaque em mint.",
    prompt:
      "Produto centralizado em estúdio escuro, iluminação cinematográfica, contraste alto, composição premium, detalhes nítidos.",
    attachmentCount: 3,
    fileTypes: ["texto", "imagem"],
    updatedAt: "Abril 2026",
  },
  {
    id: "prompt-ugc-estatico",
    title: "Criativo UGC estático",
    description:
      "Estrutura para anúncios com prova social, headline curta e CTA direto.",
    prompt:
      "Cena natural de uso do produto, aparência realista, composição vertical para anúncio, espaço limpo para headline.",
    attachmentCount: 2,
    fileTypes: ["imagem"],
    updatedAt: "Abril 2026",
  },
  {
    id: "prompt-before-after",
    title: "Antes e depois com prova visual",
    description:
      "Template de prompt para comparar transformação e manter leitura rápida no feed.",
    prompt:
      "Composição split screen, antes e depois, luz consistente, produto visível, visual limpo e direto.",
    attachmentCount: 4,
    fileTypes: ["texto", "imagem"],
    updatedAt: "Março 2026",
  },
];

export function getFolderById(id: string): DriveFolder | undefined {
  return SAMPLE_FOLDERS.find((f) => f.id === id);
}

/**
 * Deterministic mock file list for a folder. Generates `fileCount` files named
 * CR01.png → CR{N}.png, each with a seeded picsum thumbnail + fake bytes.
 */
export function getFolderFiles(folderId: string): DriveFile[] {
  const folder = getFolderById(folderId);
  if (!folder) return [];

  return Array.from({ length: folder.fileCount }).map((_, i) => {
    const num = (i + 1).toString().padStart(2, "0");
    const name = `CR${num}.png`;
    // Deterministic pseudo-size 1.00–1.60 MB range for variety
    const mb = 1 + ((i * 37) % 60) / 100;
    const size = Math.round(mb * 1024 * 1024);
    return {
      id: `${folderId}-${num}`,
      name,
      size,
      kind: "image" as const,
      thumbnailUrl: `https://picsum.photos/seed/${folderId}-${num}/480/600`,
    };
  });
}
