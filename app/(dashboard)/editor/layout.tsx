// Nested layout scoped to /editor only. Escapes the dashboard layout's
// p-6 / p-8 padding via fixed positioning so the editor canvas reaches
// the topbar and the collapsed sidebar with no gap, without modifying
// the parent layout that every other dashboard page depends on.
//
// Anchored to the viewport:
//   top-14                       → clears the 3.5rem (h-14) topbar
//   left-[var(--sidebar-width-icon)] → clears the collapsed sidebar
//                                      (always collapsed on /editor)
//   right-0 / bottom-0           → fills the rest of the viewport

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed bottom-0 left-[var(--sidebar-width-icon,3.25rem)] right-0 top-14 z-10 flex overflow-hidden bg-background">
      {children}
    </div>
  );
}
