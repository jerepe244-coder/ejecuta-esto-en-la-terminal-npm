import { Users, AlertTriangle, Radar, Trophy, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KpiStats {
  totalProspects: number;
  highPriority: number;
  scansToday: number;
  wonProspects: number;
}

export function KpiCards({ stats }: { stats: KpiStats }) {
  const cards = [
    {
      title: 'Total Prospectos',
      value: stats.totalProspects,
      description: 'Empresas en base de datos',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      tag: 'Supabase CRM',
    },
    {
      title: 'Prioridad Alta',
      value: stats.highPriority,
      description: 'Pain Score crítico (≥ 7)',
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      tag: 'Urgente',
    },
    {
      title: 'Escaneos Hoy',
      value: stats.scansToday,
      description: 'Auditorías realizadas hoy',
      icon: Radar,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      tag: 'Últimas 24h',
    },
    {
      title: 'Prospectos Ganados',
      value: stats.wonProspects,
      description: 'Cierres comerciales exitosos',
      icon: Trophy,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      tag: 'Cierres',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <Card
            key={idx}
            className="bg-zinc-900/60 border-zinc-800/80 shadow-md hover:border-zinc-700/80 transition-all duration-200"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{card.title}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {card.value}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  {card.tag}
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 mt-2 truncate">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
