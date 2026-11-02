import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // 1. Medir tiempo de carga
    const startTime = Date.now();
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'ZYRVAE-Scout/1.0' },
    });
    const loadTime = (Date.now() - startTime) / 1000; // en segundos

    if (!response.ok) {
      throw new Error(`La web respondió con estado ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. Analizar HTML
    const hasViewport = $('meta[name="viewport"]').length > 0;
    
    // Buscar palabras clave de reserva directa
    const bodyText = $('body').text().toLowerCase();
    const bookingKeywords = /(reservar|reserva|booking|book now|reserve|check-in|disponibilidad)/i;
    const hasBookingButton = bookingKeywords.test(bodyText);

    // Buscar links a OTAs (Booking, Expedia, Airbnb)
    const hasOTA = /(booking\.com|expedia|airbnb|hotels\.com)/i.test(html);

    // 3. Calcular el "Pain Score" (0 = Perfecto, 10 = Necesita ayuda urgente)
    let painScore = 0;
    if (loadTime > 2.5) painScore += 3;
    if (loadTime > 4.0) painScore += 2;
    if (!hasViewport) painScore += 2;
    if (!hasBookingButton) painScore += 2;
    if (hasOTA) painScore += 1;

    // 4. Generar el diagnóstico (Lo que vas a usar para vender)
    const diagnosis = [];
    if (loadTime > 3) diagnosis.push(`⏱️ Carga lenta (${loadTime.toFixed(2)}s). Esto espanta huéspedes.`);
    if (!hasViewport) diagnosis.push("📱 No está optimizada para celulares (falta meta viewport).");
    if (!hasBookingButton) diagnosis.push("🚫 No tiene llamados a la acción claros para reservar.");
    if (hasOTA) diagnosis.push("💸 Depende de Booking/Expedia (estás pagando comisiones del 15-18%).");
    if (diagnosis.length === 0) diagnosis.push("✅ La web está técnicamente bien, pero podría mejorar su diseño.");

    return NextResponse.json({
      url: targetUrl,
      loadTime,
      hasViewport,
      hasBookingButton,
      hasOTA,
      painScore: Math.min(painScore, 10),
      diagnosis
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
