import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { MobileNav } from '@/components/dashboard/mobile-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Sidebar fijo en Desktop */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Barra de navegación inferior en Mobile */}
      <MobileNav />
    </div>
  );
}
