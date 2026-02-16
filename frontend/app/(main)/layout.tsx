// frontend/app/(main)/layout.tsx
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left section: Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white z-20">
        <Sidebar />
      </div>

      {/* Rigth section: Header + Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}