import { supabase } from '@/lib/supabase';
import { KpiCards } from '@/components/overview/kpi-cards';
import { IndustryChart } from '@/components/overview/industry-chart';
import { ActivityFeed, ActivityItem } from '@/components/overview/activity-feed';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Radar, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

const industryNameMap: Record<string, string> = {
  hoteleria: 'Hotelería & Turismo',
  gastronomia: 'Gastronomía',
  inmobiliaria: 'Real Estate',
  salud: 'Salud & Clínicas',
  ecommerce: 'E-commerce',
  servicios: 'Servicios',
  general: 'General / Otro',
};

async function getDashboardData() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Queries concurrentes en Supabase
    const [
      totalRes,
      highPriorityRes,
      scansTodayRes,
      wonRes,
      industriesRes,
      activitiesRes,
    ] = await Promise.all([
      // Total prospectos
      supabase.from('prospects').select('*', { count: 'exact', head: true }),
      // Prioridad alta
      supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('priority', 'alta'),
      // Escaneos hoy
      supabase.from('audits').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      // Ganados
      supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('status', 'ganado'),
      // Industrias
      supabase.from('prospects').select('industry'),
      // Registro de actividad
      supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(8),
    ]);

    // Procesar distribución de industrias
    const industryCounts: Record<string, number> = {};
    if (industriesRes.data) {
      for (const row of industriesRes.data) {
        const ind = (row.industry || 'general').toLowerCase();
        industryCounts[ind] = (industryCounts[ind] || 0) + 1;
      }
    }

    const industryData = Object.entries(industryCounts).map(([key, count]) => ({
      name: industryNameMap[key] || key.charAt(0).toUpperCase() + key.slice(1),
      value: count,
    }));

    return {
      stats: {
        totalProspects: totalRes.count || 0,
        highPriority: highPriorityRes.count || 0,
        scansToday: scansTodayRes.count || 0,
        wonProspects: wonRes.count || 0,
      },
      industryData,
      activities: (activitiesRes.data as ActivityItem[]) || [],
    };
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    return {
      stats: {
        totalProspects: 0,
        highPriority: 0,
        scansToday: 0,
        wonProspects: 0,
      },
      industryData: [],
      activities: [],
    };
  }
}

export default async function OverviewPage() {
  const { stats, industryData, activities } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-500/10 font-mono text-[11px]">
              Centro de Control ZYRVAE
            </Badge>
            <span className="text-xs text-zinc-500">• Datos en vivo</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Panel de Inteligencia Comercial
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Métricas de prospección en tiempo real, distribución de mercado y registro de actividad técnica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/scout"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-9 gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer'
            )}
          >
            <Radar className="w-4 h-4" />
            <span>Nuevo Escaneo</span>
          </Link>
        </div>
      </div>

      {/* Arriba: KPIs Cards */}
      <KpiCards stats={stats} />

      {/* Abajo: Gráfico de Torta (Izquierda) + Feed de Actividad (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IndustryChart data={industryData} />
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
