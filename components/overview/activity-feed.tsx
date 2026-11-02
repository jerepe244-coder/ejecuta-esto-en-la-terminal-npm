import { Activity, Radar, Clock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export interface ActivityItem {
  id: string;
  prospect_id?: string;
  event_type: string;
  message: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 2) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'audit_completed':
      return {
        icon: Radar,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        label: 'Auditoría',
      };
    case 'status_changed':
      return {
        icon: Sparkles,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        label: 'Estado',
      };
    default:
      return {
        icon: Activity,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        label: 'Evento',
      };
  }
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const hasActivities = activities && activities.length > 0;

  return (
    <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-lg flex flex-col">
      <CardHeader className="pb-3 border-b border-zinc-800/60 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Feed de Actividad en Vivo
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400 mt-0.5">
            Eventos registrados automáticamente en Supabase
          </CardDescription>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          En Tiempo Real
        </span>
      </CardHeader>

      <CardContent className="flex-1 pt-4 pb-4">
        {hasActivities ? (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-800">
            {activities.map((act) => {
              const meta = getEventIcon(act.event_type);
              const Icon = meta.icon;

              return (
                <div key={act.id} className="relative group">
                  {/* Timeline bullet / icon */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center ${meta.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                  </div>

                  {/* Activity content */}
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 group-hover:border-zinc-700/60 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        {meta.label}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {formatDate(act.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {act.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 space-y-2">
            <div className="w-12 h-12 rounded-full bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mx-auto text-zinc-500">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-300">Sin actividad reciente</p>
            <p className="text-xs text-zinc-500 max-w-xs">
              Las auditorías y cambios de estado generarán eventos automáticos en este registro.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
