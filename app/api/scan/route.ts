import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, industry = 'general' } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const parsedUrl = new URL(targetUrl);
    
    // 1. Medir tiempo de carga
    const startTime = Date.now();
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'ZYRVAE-Scout/1.0' },
    });
    const loadTime = Number(((Date.now() - startTime) / 1000).toFixed(2));

    if (!response.ok) {
      throw new Error(`La web respondió con estado ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. Analizar HTML y contenido
    const title = $('title').text().trim() || parsedUrl.hostname.replace(/^www\./, '');
    const hasViewport = $('meta[name="viewport"]').length > 0;
    const hasMetaDescription = $('meta[name="description"]').length > 0;
    const hasH1 = $('h1').length > 0;
    const hasAltImages = $('img[alt]').length > 0 || $('img').length === 0;
    
    // Buscar palabras clave de reserva directa
    const bodyText = $('body').text().toLowerCase();
    const bookingKeywords = /(reservar|reserva|booking|book now|reserve|check-in|disponibilidad)/i;
    const hasBookingButton = bookingKeywords.test(bodyText);

    // Buscar links a OTAs (Booking, Expedia, Airbnb)
    const hasOTA = /(booking\.com|expedia|airbnb|hotels\.com)/i.test(html);

    // Buscar botón / enlace a WhatsApp
    const hasWhatsApp = /(api\.whatsapp\.com|wa\.me|whatsapp)/i.test(html);

    // 3. Calcular el "Pain Score" (0 = Perfecto, 10 = Necesita ayuda urgente)
    let painScore = 0;
    if (loadTime > 2.5) painScore += 3;
    if (loadTime > 4.0) painScore += 2;
    if (!hasViewport) painScore += 2;
    if (!hasBookingButton) painScore += 2;
    if (hasOTA) painScore += 1;
    painScore = Math.min(painScore, 10);

    // Generar el diagnóstico comercial
    const diagnosis: string[] = [];
    if (loadTime > 3) diagnosis.push(`⏱️ Carga lenta (${loadTime.toFixed(2)}s). Esto espanta huéspedes.`);
    if (!hasViewport) diagnosis.push("📱 No está optimizada para celulares (falta meta viewport).");
    if (!hasBookingButton) diagnosis.push("🚫 No tiene llamados a la acción claros para reservar.");
    if (hasOTA) diagnosis.push("💸 Depende de Booking/Expedia (estás pagando comisiones del 15-18%).");
    if (diagnosis.length === 0) diagnosis.push("✅ La web está técnicamente bien, pero podría mejorar su diseño.");

    // Prioridad según el score
    let priority = 'baja';
    if (painScore >= 7) {
      priority = 'alta';
    } else if (painScore >= 4) {
      priority = 'media';
    }

    // Puntajes estimados para auditoría
    const performanceScore = Math.max(0, Math.min(100, Math.round(100 - (loadTime * 15))));
    const seoScore = 50 + (hasMetaDescription ? 25 : 0) + (hasH1 ? 25 : 0);
    const accessibilityScore = 50 + (hasViewport ? 30 : 0) + (hasAltImages ? 20 : 0);

    const rawData = {
      url: targetUrl,
      loadTime,
      hasViewport,
      hasBookingButton,
      hasOTA,
      hasWhatsApp,
      painScore,
      diagnosis,
    };

    // 4. Inserte el prospecto en Supabase (tabla prospects)
    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .insert({
        name: title,
        url: targetUrl,
        industry: industry || 'general',
        status: 'nuevo',
        priority,
      })
      .select()
      .single();

    if (prospectError) {
      console.error('Error insertando prospecto en Supabase:', prospectError);
      throw new Error(`Error en base de datos (prospects): ${prospectError.message}`);
    }

    // 5. Inserte la auditoría en Supabase (tabla audits)
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        prospect_id: prospect.id,
        performance_score: performanceScore,
        seo_score: seoScore,
        accessibility_score: accessibilityScore,
        load_time: loadTime,
        has_booking: hasBookingButton,
        has_ota: hasOTA,
        has_whatsapp: hasWhatsApp,
        raw_data: rawData,
      })
      .select()
      .single();

    if (auditError) {
      console.error('Error insertando auditoría en Supabase:', auditError);
      throw new Error(`Error en base de datos (audits): ${auditError.message}`);
    }

    // 6. Inserte un registro en activity_log avisando que se completó la auditoría
    const { error: logError } = await supabase
      .from('activity_log')
      .insert({
        prospect_id: prospect.id,
        event_type: 'audit_completed',
        message: `Auditoría completada para ${title} (${targetUrl}) con Pain Score ${painScore}/10 (Prioridad: ${priority}).`,
      });

    if (logError) {
      console.error('Error registrando actividad en Supabase:', logError);
    }

    // 7. Devuelva el JSON con el resultado a la vista actual
    return NextResponse.json({
      url: targetUrl,
      loadTime,
      hasViewport,
      hasBookingButton,
      hasOTA,
      painScore,
      diagnosis,
      prospectId: prospect.id,
      auditId: audit.id,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
