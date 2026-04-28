"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_STATE,
  type EditorState,
  type Generation,
  type ReferenceImage,
  type SubjectPhoto,
} from "./_types";

type Ctx = {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  patch: <K extends keyof EditorState>(key: K, value: Partial<EditorState[K]> | EditorState[K]) => void;
  addReference: (ref: Omit<ReferenceImage, "id">) => void;
  updateReferenceNote: (id: string, note: string) => void;
  removeReference: (id: string) => void;
  addSubjectPhoto: (photo: Omit<SubjectPhoto, "id">) => void;
  removeSubjectPhoto: (id: string) => void;
  generations: Generation[];
  pushGeneration: (g: Generation) => void;
  removeGeneration: (id: string) => void;
  generating: boolean;
  setGenerating: (v: boolean) => void;
  generationError: string | null;
  setGenerationError: (v: string | null) => void;
};

const EditorCtx = createContext<Ctx | null>(null);

const HISTORY_KEY = "edis-editor-history";

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EditorState>(DEFAULT_STATE);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Load history once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setGenerations(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(generations.slice(0, 50)));
    } catch {
      // quota — drop silently
    }
  }, [generations]);

  const patch = useCallback<Ctx["patch"]>((key, value) => {
    setState((prev) => {
      const current = prev[key];
      if (current && typeof current === "object" && !Array.isArray(current)) {
        return {
          ...prev,
          [key]: { ...current, ...(value as object) },
        };
      }
      return { ...prev, [key]: value as EditorState[typeof key] };
    });
  }, []);

  const addReference = useCallback<Ctx["addReference"]>((ref) => {
    setState((prev) => {
      if (prev.references.length >= 5) return prev;
      const id = `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return { ...prev, references: [...prev.references, { ...ref, id }] };
    });
  }, []);

  const updateReferenceNote = useCallback<Ctx["updateReferenceNote"]>((id, note) => {
    setState((prev) => ({
      ...prev,
      references: prev.references.map((r) => (r.id === id ? { ...r, note } : r)),
    }));
  }, []);

  const removeReference = useCallback<Ctx["removeReference"]>((id) => {
    setState((prev) => ({
      ...prev,
      references: prev.references.filter((r) => r.id !== id),
    }));
  }, []);

  const addSubjectPhoto = useCallback<Ctx["addSubjectPhoto"]>((photo) => {
    setState((prev) => {
      if (prev.subject.photos.length >= 5) return prev;
      const id = `subj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return {
        ...prev,
        subject: { ...prev.subject, photos: [...prev.subject.photos, { ...photo, id }] },
      };
    });
  }, []);

  const removeSubjectPhoto = useCallback<Ctx["removeSubjectPhoto"]>((id) => {
    setState((prev) => ({
      ...prev,
      subject: {
        ...prev.subject,
        photos: prev.subject.photos.filter((p) => p.id !== id),
      },
    }));
  }, []);

  const pushGeneration = useCallback<Ctx["pushGeneration"]>((g) => {
    setGenerations((prev) => [g, ...prev]);
  }, []);

  const removeGeneration = useCallback<Ctx["removeGeneration"]>((id) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      setState,
      patch,
      addReference,
      updateReferenceNote,
      removeReference,
      addSubjectPhoto,
      removeSubjectPhoto,
      generations,
      pushGeneration,
      removeGeneration,
      generating,
      setGenerating,
      generationError,
      setGenerationError,
    }),
    [
      state,
      patch,
      addReference,
      updateReferenceNote,
      removeReference,
      addSubjectPhoto,
      removeSubjectPhoto,
      generations,
      pushGeneration,
      removeGeneration,
      generating,
      generationError,
    ]
  );

  return <EditorCtx.Provider value={value}>{children}</EditorCtx.Provider>;
}

export function useEditor() {
  const ctx = useContext(EditorCtx);
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider");
  return ctx;
}

// File → base64 helper used by photo + reference uploads.
// Resizes the image to MAX_DIM on the longest edge and re-encodes as JPEG at
// 0.85 quality. A 5MB phone photo lands at ~250KB without losing fidelity
// the model cares about — keeps fetch bodies sane (Next.js rejects huge
// bodies before our route ever runs).
const MAX_DIM = 1280;
const QUALITY = 0.85;

export async function fileToBase64(
  file: File
): Promise<{ base64: string; dataUrl: string; mimeType: string }> {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Falha ao carregar a imagem"));
      el.src = sourceUrl;
    });

    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = longest > MAX_DIM ? MAX_DIM / longest : 1;
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas não disponível");
    ctx.drawImage(img, 0, 0, w, h);

    const mimeType = "image/jpeg";
    const dataUrl = canvas.toDataURL(mimeType, QUALITY);
    const base64 = dataUrl.split(",")[1] ?? "";
    return { base64, dataUrl, mimeType };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
