import { notFound } from "next/navigation";

import { getLessonsForModule, getModule } from "../_data";
import { ModulePlayer } from "./_player";

type PageProps = {
  params: Promise<{ moduleId: string }>;
};

export default async function ModuleDetailPage({ params }: PageProps) {
  const { moduleId } = await params;
  const mod = getModule(moduleId);

  if (!mod) notFound();

  const lessons = getLessonsForModule(moduleId);
  if (lessons.length === 0) notFound();

  return <ModulePlayer module={mod} lessons={lessons} />;
}
