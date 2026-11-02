'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Radar } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileItems = [
  {
    name: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
  },
  {
    name: 'CRM',
    href: '/prospects',
    icon: Users,
  },
  {
    name: 'Escanear',
    href: '/scout',
    icon: Radar,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 py-2">
      <div className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'text-blue-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <div
                className={cn(
                  'p-1 rounded-md transition-colors',
                  isActive ? 'bg-blue-500/10' : ''
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
