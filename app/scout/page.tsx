'use client';

import { useState } from 'react';
import { Search, Globe, ShieldAlert, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ScoutDashboard() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="border-b border-neutral-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">Z</div>
            <span className="font-semibold tracking-tight text-white">ZYRVAE <span className="text-neutral-500 font-normal">Scout</span></span>
          </div>
          <div className="text-xs font-mono text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
            v1.0 // Internal
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero / Buscador */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Inteligencia Comercial</h1>
          <p className="text-neutral-400 mb-8">Escaneá la web de un prospecto para detectar fallas técnicas y oportunidades de venta.</p>

          <form onSubmit={handleScan} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hotel-prospecto.com"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-4 pl-12 pr-32 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-lg"
              required
            />
            <div className="absolute inset-y-2 right-2">
              <button
                type="submit"
                disabled={loading}
                className="h-full bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Escaneando</>
                ) : 'Analizar'}
              </button>
            </div>
          </form>
        </div>

        {/* Errores */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Resultados */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Columna Izquierda: Score */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-neutral-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                    <circle 
                      className={`${result.painScore > 6 ? 'text-red-500' : result.painScore > 3 ? 'text-yellow-500' : 'text-green-500'} stroke-current transition-all duration-1000`} 
                      strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" 
                      strokeDasharray={`${(result.painScore / 10) * 251} 251`} 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold text-white">{result.painScore}</span>
                    <span className="text-xs text-neutral-500 uppercase tracking-wider">Score</span>
                  </div>
                </div>
                <h3 className="font-semibold text-white">Pain Score</h3>
                <p className="text-sm text-neutral-400 mt-1">Nivel de urgencia comercial</p>
              </div>

              {/* Columna Derecha: Diagnóstico */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Análisis Técnico
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800/50">
                      <div className="text-xs text-neutral-500 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Tiempo de carga</div>
                      <div className="text-lg font-mono text-white">{result.loadTime.toFixed(2)}s</div>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800/50">
                      <div className="text-xs text-neutral-500 mb-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Dependencia OTA</div>
                      <div className="text-lg font-mono text-white">{result.hasOTA ? 'Alta' : 'Baja'}</div>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800/50">
                      <div className="text-xs text-neutral-500 mb-1">Responsive Mobile</div>
                      <div className="text-lg font-mono text-white">{result.hasViewport ? '✅ Sí' : '❌ No'}</div>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800/50">
                      <div className="text-xs text-neutral-500 mb-1">Reserva Directa</div>
                      <div className="text-lg font-mono text-white">{result.hasBookingButton ? '✅ Sí' : '❌ No'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Argumentos de Venta
                  </h3>
                  <ul className="space-y-3">
                    {result.diagnosis.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-neutral-300 bg-neutral-950 p-3 rounded-lg border border-neutral-800/50">
                        <span className="text-blue-500 mt-0.5">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
