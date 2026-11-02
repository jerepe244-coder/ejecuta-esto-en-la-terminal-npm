import { supabase } from '@/lib/supabase';
import { ProspectsTable, Prospect } from '@/components/prospects/prospects-table';
import { Badge } from '@/components/ui/badge';
import { Users, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProspects(): Promise<Prospect[]> {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prospects:', error);
      return [];
    }

    return (data as Prospect[]) || [];
  } catch (err) {
    console.error('Failed to load prospects from Supabase:', err);
    return [];
  }
}

export default async function ProspectsPage() {
  const prospects = await getProspects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-zinc-400 border-zinc-700 bg-zinc-900/60 font-mono text-[11px]">
            Base de Datos Supabase
          </Badge>
          <span className="text-xs text-zinc-500">• Tabla `prospects`</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              CRM de Prospectos
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Pipeline centralizado de clientes auditados, con seguimiento de estado y nivel de prioridad comercial.
            </p>
          </div>
        </div>
      </div>

      {/* Componente Tabla Interactivo */}
      <ProspectsTable initialProspects={prospects} />
    </div>
  );
}
