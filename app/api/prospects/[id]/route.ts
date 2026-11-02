import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ['nuevo', 'contactado', 'ganado', 'perdido'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // 1. Obtener prospecto actual para el log
    const { data: currentProspect, error: fetchError } = await supabase
      .from('prospects')
      .select('name, status')
      .eq('id', id)
      .single();

    if (fetchError || !currentProspect) {
      return NextResponse.json(
        { error: 'Prospecto no encontrado' },
        { status: 404 }
      );
    }

    // 2. Actualizar estado
    const { data: updatedProspect, error: updateError } = await supabase
      .from('prospects')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // 3. Registrar en activity_log
    const statusLabels: Record<string, string> = {
      nuevo: 'Nuevo',
      contactado: 'Contactado',
      ganado: 'Ganado',
      perdido: 'Perdido',
    };

    await supabase.from('activity_log').insert({
      prospect_id: id,
      event_type: 'status_changed',
      message: `El prospecto "${currentProspect.name}" cambió a estado "${statusLabels[status] || status}".`,
    });

    return NextResponse.json({
      success: true,
      prospect: updatedProspect,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
