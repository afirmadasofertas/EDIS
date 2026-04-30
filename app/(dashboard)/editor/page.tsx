"use client";

import { EditorProvider } from "./_state";
import { LeftPanel } from "./_left-panel";
import { CenterPreview } from "./_preview";
import { GalleryPanel } from "./_gallery";

export default function EditorPage() {
  // h-full fills whatever the parent <main> hands us. The SidebarInset
  // chain is `flex-col` with the topbar at the top and main as flex-1, so
  // h-full puts the editor flush under the topbar without any viewport
  // math (the calc(100vh-3.5rem) trick was overshooting on some viewports).
  return (
    <EditorProvider>
      <div className="flex h-full w-full">
        <LeftPanel />
        <CenterPreview />
        <GalleryPanel />
      </div>
    </EditorProvider>
  );
}
