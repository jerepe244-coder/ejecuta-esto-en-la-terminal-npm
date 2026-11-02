'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  MapPin,
  Briefcase,
  Globe,
  Star,
  Radar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Check,
  Building,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DiscoverResult {
  name: string;
  website: string;
  address: string;
  rating: number | null;
}

interface ScanProgressItem {
  name: string;
  website: string;
  status: 'pending' | 'scanning' | 'completed' | 'error';
  painScore?: number;
  error?: string;
}

const suggestedRubros = [
  'Hoteles boutique',
  'Restaurantes',
  'Clínicas estéticas',
  'Inmobiliarias',
  'Estudios contables',
  'Gimnasios',
];

const suggestedZonas = [
  'Palermo, Buenos Aires',
  'Madrid, España',
  'Barcelona, España',
  'Ciudad de México',
  'Bogotá, Colombia',
  'Miami, Florida',
];

export default function DiscoverPage() {
  const router = useRouter();

  // Search form state
  const [rubro, setRubro] = useState('');
  const [zona, setZona] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Results & selection state
  const [results, setResults] = useState<DiscoverResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedWebsites, setSelectedWebsites] = useState<Set<string>>(new Set());

  // Bulk scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgressItem[]>([]);
  const [currentScanningIndex, setCurrentScanningIndex] = useState(0);
  const [scanCompleted, setScanCompleted] = useState(false);

  // Handle Search
  const handleSearch = async (e?: React.FormEvent, forceDemo: boolean = false) => {
    if (e) e.preventDefault();
    if (!rubro.trim() || !zona.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setApiKeyMissing(false);
    setSelectedWebsites(new Set());

    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: rubro.trim(),
          location: zona.trim(),
          demo: forceDemo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'MISSING_API_KEY') {
          setApiKeyMissing(true);
        }
        throw new Error(data.error || 'Ocurrió un error al buscar negocios.');
      }

      setResults(data);
      setHasSearched(true);

      // Por defecto, seleccionamos todos los prospectos encontrados
      const allWebsites = new Set<string>((data as DiscoverResult[]).map((r) => r.website));
      setSelectedWebsites(allWebsites);
    } catch (err: any) {
      setSearchError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSearching(false);
    }
  };

  // Selection toggle
  const toggleSelect = (website: string) => {
    setSelectedWebsites((prev) => {
      const next = new Set(prev);
      if (next.has(website)) {
        next.delete(website);
      } else {
        next.add(website);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedWebsites.size === results.length) {
      setSelectedWebsites(new Set());
    } else {
      setSelectedWebsites(new Set(results.map((r) => r.website)));
    }
  };

  // Bulk Scanning
  const handleBulkScan = async () => {
    const itemsToScan = results.filter((r) => selectedWebsites.has(r.website));
    if (itemsToScan.length === 0) return;

    setIsScanning(true);
    setScanCompleted(false);
    setCurrentScanningIndex(0);

    const progressList: ScanProgressItem[] = itemsToScan.map((item) => ({
      name: item.name,
      website: item.website,
      status: 'pending',
    }));
    setScanProgress(progressList);

    for (let i = 0; i < itemsToScan.length; i++) {
      const item = itemsToScan[i];
      setCurrentScanningIndex(i + 1);

      // Marcar elemento actual como escaneando
      setScanProgress((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: 'scanning' } : p))
      );

      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: item.website,
            industry: rubro.trim() || 'general',
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Fallo durante el escaneo');
        }

        // Marcar como completado
        setScanProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'completed', painScore: data.painScore } : p
          )
        );
      } catch (err: any) {
        setScanProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error', error: err.message || 'Error' } : p
          )
        );
      }
    }

    setScanCompleted(true);

    // Redirigir al CRM después de 2.2 segundos para mostrar el éxito
    setTimeout(() => {
      router.push('/prospects');
    }, 2200);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="text-blue-400 border-blue-500/30 bg-blue-500/10 font-mono text-[11px] gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            Fase 4 • Auto-Discovery
          </Badge>
          <span className="text-xs text-zinc-500">• Google Places API Integration</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Buscador Automático de Prospectos
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Descubrí empresas de cualquier rubro y localidad en tiempo real, extraé sus sitios web y
              escaneá sus Pain Scores con un solo clic.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de Búsqueda */}
      <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm shadow-xl">
        <CardContent className="pt-6 space-y-5">
          <form onSubmit={(e) => handleSearch(e, false)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Rubro */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  Rubro / Industria
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Ej. Hoteles boutique, Odontología, Bares..."
                    value={rubro}
                    onChange={(e) => setRubro(e.target.value)}
                    className="bg-zinc-950/80 border-zinc-800 focus:border-blue-500 text-zinc-100 placeholder:text-zinc-500 h-11"
                    disabled={isSearching || isScanning}
                  />
                </div>
                {/* Rubros sugeridos */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-zinc-500 self-center">Ejemplos:</span>
                  {suggestedRubros.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRubro(item)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/50"
                      disabled={isSearching || isScanning}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Zona */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Zona / Localidad
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Ej. Palermo, Buenos Aires o Madrid..."
                    value={zona}
                    onChange={(e) => setZona(e.target.value)}
                    className="bg-zinc-950/80 border-zinc-800 focus:border-blue-500 text-zinc-100 placeholder:text-zinc-500 h-11"
                    disabled={isSearching || isScanning}
                  />
                </div>
                {/* Zonas sugeridas */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-zinc-500 self-center">Ejemplos:</span>
                  {suggestedZonas.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setZona(item)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/50"
                      disabled={isSearching || isScanning}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800/60">
              <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>Solo extrae prospectos que posean sitio web registrado.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="submit"
                  disabled={!rubro.trim() || !zona.trim() || isSearching || isScanning}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/20 h-10 px-6 gap-2 cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Buscando en Google Places...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Buscar Prospectos</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Banner de API Key faltante con opción de demo */}
          {apiKeyMissing && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm space-y-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-300">
                    Variable `GOOGLE_MAPS_API_KEY` requerida
                  </p>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    Para consultar Google Places en producción, agregá tu clave de Google Cloud en{' '}
                    <code className="px-1.5 py-0.5 rounded bg-zinc-900 border border-amber-500/30 font-mono text-amber-300">
                      .env.local
                    </code>{' '}
                    y en Vercel. Asegurate de habilitar el servicio <strong>Places API</strong>.
                  </p>
                </div>
              </div>

              <div className="pl-8 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(undefined, true)}
                  className="border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 text-xs h-8 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  Probar ahora con datos de demostración
                </Button>
              </div>
            </motion.div>
          )}

          {/* Mensaje de Error General */}
          {searchError && !apiKeyMissing && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal / Banner de Escaneo Masivo en Ejecución */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/40 via-zinc-900/90 to-zinc-950 border border-blue-500/30 shadow-2xl backdrop-blur-xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Radar className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Escaneo Masivo en Progreso
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Auditoría de performance, viewport, SEO, OTAs y cálculo de Pain Score para cada negocio.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  Escaneando {currentScanningIndex} de {scanProgress.length}
                </span>
              </div>
            </div>

            {/* Barra de progreso visual */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/60">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full shadow-lg shadow-blue-500/50"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.round((currentScanningIndex / scanProgress.length) * 100)}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>Progreso total</span>
                <span>{Math.round((currentScanningIndex / scanProgress.length) * 100)}%</span>
              </div>
            </div>

            {/* Lista detallada del progreso en vivo */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {scanProgress.map((item, idx) => (
                <div
                  key={item.website}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors',
                    item.status === 'scanning'
                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                      : item.status === 'completed'
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-zinc-300'
                      : item.status === 'error'
                      ? 'bg-red-500/5 border-red-500/20 text-red-400'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                    {item.status === 'scanning' && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
                    )}
                    {item.status === 'completed' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    )}
                    {item.status === 'pending' && (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span className="font-medium text-white truncate">{item.name}</span>
                    <span className="text-[11px] text-zinc-500 font-mono truncate">
                      ({item.website})
                    </span>
                  </div>

                  <div>
                    {item.status === 'completed' && item.painScore !== undefined && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-mono',
                          item.painScore >= 7
                            ? 'text-red-400 border-red-500/30 bg-red-500/10'
                            : item.painScore >= 4
                            ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                            : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        )}
                      >
                        Pain Score: {item.painScore}/10
                      </Badge>
                    )}
                    {item.status === 'scanning' && (
                      <span className="text-[11px] text-blue-400 font-mono animate-pulse">
                        Auditando...
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="text-[11px] text-zinc-500 font-mono">En espera</span>
                    )}
                    {item.status === 'error' && (
                      <span className="text-[11px] text-red-400 font-mono">Fallo técnico</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Aviso de redirección */}
            {scanCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    ¡Escaneo completado con éxito! Redirigiendo automáticamente al CRM de Prospectos...
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultados de la Búsqueda */}
      {hasSearched && (
        <Card className="bg-zinc-900/60 border-zinc-800 shadow-xl overflow-hidden">
          {/* Header de la Tabla y Acción de Escaneo */}
          <div className="p-4 md:p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white">Prospectos Encontrados</h3>
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono text-xs"
                >
                  {results.length} con sitio web
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Seleccioná los negocios que querés escanear e ingresar a tu base de datos comercial.
              </p>
            </div>

            {/* Botón Clave: Escanear Seleccionados */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-mono">
                {selectedWebsites.size} de {results.length} seleccionados
              </span>

              <Button
                type="button"
                onClick={handleBulkScan}
                disabled={selectedWebsites.size === 0 || isScanning}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-600/30 h-10 px-5 gap-2 cursor-pointer transition-all duration-200"
              >
                <Radar className="w-4 h-4" />
                <span>Escanear Seleccionados ({selectedWebsites.size})</span>
              </Button>
            </div>
          </div>

          {/* Tabla de Resultados */}
          {results.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-300">
                No se encontraron negocios con sitio web
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Probá ampliando la zona o cambiando los términos del rubro (ej. &quot;hoteles&quot; en vez de
                &quot;hoteles boutique&quot;).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/80 hover:bg-transparent">
                    {/* Checkbox Maestro */}
                    <TableHead className="w-12 px-4">
                      <input
                        type="checkbox"
                        checked={selectedWebsites.size === results.length && results.length > 0}
                        onChange={toggleSelectAll}
                        disabled={isScanning}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-blue-500/20 accent-blue-600 cursor-pointer"
                        aria-label="Seleccionar todos"
                      />
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">Negocio</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">Dirección</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">Sitio Web</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400 text-right pr-6">
                      Rating
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((prospect) => {
                    const isChecked = selectedWebsites.has(prospect.website);

                    return (
                      <TableRow
                        key={prospect.website}
                        className={cn(
                          'border-zinc-800/60 transition-colors cursor-pointer',
                          isChecked ? 'bg-blue-500/[0.04]' : 'hover:bg-zinc-800/30'
                        )}
                        onClick={() => !isScanning && toggleSelect(prospect.website)}
                      >
                        {/* Checkbox de la fila */}
                        <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(prospect.website)}
                            disabled={isScanning}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-blue-500/20 accent-blue-600 cursor-pointer"
                            aria-label={`Seleccionar ${prospect.name}`}
                          />
                        </TableCell>

                        {/* Nombre del Negocio */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-100 text-sm">
                              {prospect.name}
                            </span>
                          </div>
                        </TableCell>

                        {/* Dirección */}
                        <TableCell>
                          <span className="text-xs text-zinc-400 flex items-center gap-1.5 truncate max-w-xs">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            {prospect.address || 'Dirección no disponible'}
                          </span>
                        </TableCell>

                        {/* Sitio Web */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <a
                            href={
                              prospect.website.startsWith('http')
                                ? prospect.website
                                : `https://${prospect.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline max-w-[240px] truncate"
                          >
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{prospect.website}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                          </a>
                        </TableCell>

                        {/* Rating */}
                        <TableCell className="text-right pr-6">
                          {prospect.rating ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{prospect.rating.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-500 font-mono">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
