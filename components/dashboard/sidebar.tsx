'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Radar, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const navItems = [
  {
    name: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
    description: 'Métricas y actividad',
  },
  {
    name: 'CRM Prospectos',
    href: '/prospects',
    icon: Users,
    description: 'Gestión de clientes',
  },
  {
    name: 'Escanear Web',
    href: '/scout',
    icon: Radar,
    description: 'Auditoría comercial',
    badge: 'Scout',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800/80">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/80">
        <Link href="/overview" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center font-bold text-white text-base tracking-wider font-mono">
              Z
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-sm">ZYRVAE</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-zinc-500">Commercial Intel</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Plataforma
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'bg-zinc-800/80 text-white font-medium border border-zinc-700/60 shadow-inner shadow-zinc-900/50'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-zinc-500 group-hover:text-zinc-300 group-hover:bg-zinc-800/40'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 flex items-center justify-between">
                <span>{item.name}</span>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    {item.badge}
                  </span>
                )}
              </div>

              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full" />
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Acciones Rápidas
        </div>

        <Link
          href="/scout"
          className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 rounded-lg transition-colors group"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Escanear nuevo cliente</span>
        </Link>
      </div>

      {/* System Status / Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Supabase DB
            </span>
            <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-tight">
            Motor de auditoría técnica v1.0 listo para escanear.
          </p>
        </div>
      </div>
    </aside>
  );
}
