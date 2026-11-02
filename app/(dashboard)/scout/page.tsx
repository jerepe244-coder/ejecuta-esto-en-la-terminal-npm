'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Globe, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Smartphone,
  CalendarCheck,
  Building,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const industries = [
  { value: 'hoteleria', label: 'Hotelería y Turismo' },
  { value: 'gastronomia', label: 'Gastronomía y Bares' },
  { value: 'inmobiliaria', label: 'Inmobiliaria y Real Estate' },
  { value: 'salud', label: 'Salud y Clínicas' },
  { value: 'ecommerce', label: 'E-commerce y Retail' },
  { value: 'servicios', label: 'Servicios Profesionales' },
  { value: 'general', label: 'General / Otro' },
];

const scanSteps = [
  'Estableciendo conexión y midiendo latencia de respuesta...',
  'Extrayendo meta etiquetas, responsive viewport y estructura SEO...',
  'Detectando presencia de motor de reservas y enlaces a OTAs...',
  'Calculando Pain Score comercial y registrando en Supabase CRM...',
];

export default function ScoutPage() {
  const [url, setUrl] = useState('');
  const [industry, setIndustry] = useState('hoteleria');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Simulación de pasos de escaneo visuales
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), industry }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo completar el análisis del sitio web.');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión durante el escaneo.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return { text: 'text-red-400', stroke: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Alta Prioridad' };
    if (score >= 4) return { text: 'text-amber-400', stroke: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Prioridad Media' };
    return { text: 'text-emerald-400', stroke: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Baja Prioridad' };
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[11px]">
            ZYRVAE Scout Engine v1.0
          </Badge>
          <span className="text-xs text-zinc-500">• Búsqueda en vivo</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Escáner de Inteligencia Comercial
        </h2>
        <p className="text-zinc-400 text-sm md:text-base mt-1">
          Ingresá el sitio web del prospecto para analizar su rendimiento técnico, dependencias y argumentos de venta.
        </p>
      </div>

      {/* Formulario de Escaneo con Card de shadcn */}
      <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-sm shadow-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleScan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Input URL */}
              <div className="md:col-span-2 relative">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Sitio Web del Prospecto
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <Input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="ejemplo.com o https://hotel-paraiso.com"
                    className="pl-10 h-11 bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500 text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Selector Industria */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Industria / Nicho
                </label>
                <Select value={industry} onValueChange={(val) => val && setIndustry(val)} disabled={loading}>
                  <SelectTrigger className="w-full h-11 bg-zinc-950/80 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Seleccioná industria" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                    {industries.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-zinc-500">
                Guarda automáticamente el prospecto y la auditoría en Supabase CRM.
              </span>
              <Button
                type="submit"
                disabled={loading || !url.trim()}
                className="w-full sm:w-auto h-11 px-8 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Escaneando sitio...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Iniciar Auditoría
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-3 text-sm"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-300">Error durante la auditoría</p>
            <p className="text-red-400/80 text-xs mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Animación de Carga Elegante (Skeleton + Stepper) */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <Card className="bg-zinc-900/40 border-zinc-800/80 overflow-hidden">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-base">Analizando sitio en tiempo real</h4>
                    <p className="text-xs text-blue-400 font-mono mt-0.5">
                      {scanSteps[currentStepIndex]}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                    initial={{ width: '10%' }}
                    animate={{ width: `${((currentStepIndex + 1) / scanSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="h-44 bg-zinc-800/40 rounded-xl animate-pulse" />
                  <div className="md:col-span-2 h-44 bg-zinc-800/40 rounded-xl animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultados de la Auditoría */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Encabezado del Resultado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base leading-tight break-all">
                    {result.url}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Prospecto ID: <span className="font-mono text-zinc-500">{result.prospectId?.slice(0, 8)}...</span> • Auditoría guardada
                  </p>
                </div>
              </div>

              {/* Botón Ver en el CRM */}
              <div className="flex items-center gap-2">
                <Link
                  href="/prospects"
                  className={cn(
                    buttonVariants({ size: 'sm' }),
                    'bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 gap-2 shadow-md shadow-emerald-600/20 cursor-pointer'
                  )}
                >
                  <span>Ver en el CRM</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tarjeta 1: Pain Score con círculo destacado */}
              <Card className="bg-zinc-900/70 border-zinc-800 flex flex-col items-center justify-center p-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className={`text-xs ${getScoreColor(result.painScore).border} ${getScoreColor(result.painScore).text} ${getScoreColor(result.painScore).bg}`}>
                    {getScoreColor(result.painScore).label}
                  </Badge>
                </div>

                <div className="relative w-36 h-36 flex items-center justify-center my-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-zinc-800 stroke-current"
                      strokeWidth="8"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    />
                    <motion.circle
                      className="stroke-current"
                      stroke={getScoreColor(result.painScore).stroke}
                      strokeWidth="8"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray="251"
                      initial={{ strokeDashoffset: 251 }}
                      animate={{ strokeDashoffset: 251 - (result.painScore / 10) * 251 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                      {result.painScore}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                      de 10
                    </span>
                  </div>
                </div>

                <CardTitle className="text-base font-semibold text-white">
                  Pain Score ZYRVAE
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-1 max-w-[200px]">
                  {result.painScore >= 7
                    ? 'Fallas críticas detectadas. Oportunidad óptima de cierre de venta.'
                    : result.painScore >= 4
                    ? 'Oportunidades técnicas y mejoras de conversión detectadas.'
                    : 'Sitio técnicamente estable con margen para optimización comercial.'}
                </CardDescription>
              </Card>

              {/* Tarjeta 2 y 3: Diagnóstico Técnico y Argumentos de Venta */}
              <div className="md:col-span-2 space-y-4">
                {/* Métricas Técnicas */}
                <Card className="bg-zinc-900/70 border-zinc-800">
                  <CardHeader className="pb-3 border-b border-zinc-800/60">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      Diagnóstico Técnico Automatizado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Carga */}
                      <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                        <span className="text-[11px] text-zinc-500 block mb-1">Tiempo Carga</span>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold font-mono text-white">
                            {result.loadTime}s
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${result.loadTime > 3 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                            {result.loadTime > 3 ? 'Lento' : 'Rápido'}
                          </span>
                        </div>
                      </div>

                      {/* Dependencia OTA */}
                      <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                        <span className="text-[11px] text-zinc-500 block mb-1">Dependencia OTA</span>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold font-mono text-white">
                            {result.hasOTA ? 'Alta' : 'Baja'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${result.hasOTA ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            {result.hasOTA ? 'Comisiones' : 'Directa'}
                          </span>
                        </div>
                      </div>

                      {/* Responsive */}
                      <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                        <span className="text-[11px] text-zinc-500 block mb-1">Mobile Viewport</span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">
                            {result.hasViewport ? 'Optimizado' : 'Sin soporte'}
                          </span>
                          <span>{result.hasViewport ? '📱' : '❌'}</span>
                        </div>
                      </div>

                      {/* Reserva Directa */}
                      <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                        <span className="text-[11px] text-zinc-500 block mb-1">Reserva Directa</span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">
                            {result.hasBookingButton ? 'Detectado' : 'Ausente'}
                          </span>
                          <span>{result.hasBookingButton ? '✅' : '⚠️'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Argumentos de Venta */}
                <Card className="bg-zinc-900/70 border-zinc-800">
                  <CardHeader className="pb-3 border-b border-zinc-800/60">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Pitch Comercial y Argumentos de Venta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2.5">
                      {result.diagnosis?.map((item: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-zinc-200 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800/60"
                        >
                          <span className="text-blue-400 font-bold text-base leading-none">›</span>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
