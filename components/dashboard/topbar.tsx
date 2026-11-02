'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radar, Sparkles, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SectionMeta {
  title: string;
  category: string;
  description: string;
}

const sectionMap: Record<string, SectionMeta> = {
  '/overview': {
    title: 'Overview',
    category: 'Dashboard',
    description: 'Rendimiento general y pipeline comercial',
  },
  '/prospects': {
    title: 'CRM Prospectos',
    category: 'Clientes',
    description: 'Gestión y seguimiento del estado de prospectos',
  },
  '/scout': {
    title: 'Escáner Web',
    category: 'Herramientas',
    description: 'Auditoría técnica en vivo y cálculo de Pain Score',
  },
};

export function Topbar() {
  const pathname = usePathname();
  const currentSection = sectionMap[pathname] || {
    title: 'Dashboard',
    category: 'ZYRVAE',
    description: 'Plataforma de inteligencia comercial',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-8 flex items-center justify-between">
      {/* Current Section & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span>ZYRVAE</span>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span className="text-zinc-400">{currentSection.category}</span>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
        </div>
        <h1 className="text-base md:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
          {currentSection.title}
        </h1>
      </div>

      {/* Right Controls: Status indicator & Action */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline text-zinc-400">Sistema:</span>
          <span className="font-medium text-emerald-400">Operativo</span>
        </div>

        {/* Quick Scan Button (if not already on /scout) */}
        {pathname !== '/scout' && (
          <Link
            href="/scout"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm shadow-blue-500/20 text-xs h-8 gap-1.5 cursor-pointer'
            )}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Escanear Web</span>
          </Link>
        )}
      </div>
    </header>
  );
}
