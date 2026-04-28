"use client";

import { EditorProvider } from "./_state";
import { LeftPanel } from "./_left-panel";
import { CenterPreview } from "./_preview";
import { GalleryPanel } from "./_gallery";

export default function EditorPage() {
  return (
    <EditorProvider>
      <div className="flex h-[calc(100vh-3.5rem)] w-full">
        <LeftPanel />
        <CenterPreview />
        <GalleryPanel />
      </div>
    </EditorProvider>
  );
}
