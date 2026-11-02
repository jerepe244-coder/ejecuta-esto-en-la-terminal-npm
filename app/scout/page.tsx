'use client';

import { useState } from 'react';

export default function ScoutPage() {
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
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-white">ZYRVAE Scout</h1>
        <p className="text-neutral-400 mb-8">Detector de oportunidades comerciales.</p>

        <form onSubmit={handleScan} className="flex gap-4 mb-12">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="ej. lafresquehotel.com"
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Escaneando...' : 'Escanear'}
          </button>
        </form>

        {error && (
          <div className="bg-red-900/30 border border-red-900 text-red-400 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white break-all">{result.url}</h2>
                  <p className="text-sm text-neutral-400">Análisis técnico completado</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${result.painScore > 6 ? 'text-red-500' : result.painScore > 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {result.painScore}/10
                  </div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">Pain Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <div className="text-sm text-neutral-400">Tiempo de carga</div>
                  <div className="text-lg font-mono">{result.loadTime.toFixed(2)}s</div>
                </div>
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <div className="text-sm text-neutral-400">Responsive (Mobile)</div>
                  <div className="text-lg font-mono">{result.hasViewport ? '✅ Sí' : '❌ No'}</div>
                </div>
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <div className="text-sm text-neutral-400">Botón de Reserva</div>
                  <div className="text-lg font-mono">{result.hasBookingButton ? '✅ Sí' : '❌ No'}</div>
                </div>
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <div className="text-sm text-neutral-400">Depende de OTAs</div>
                  <div className="text-lg font-mono">{result.hasOTA ? '⚠️ Sí (comisiones)' : '✅ No'}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-3">Diagnóstico Comercial</h3>
                <ul className="space-y-2">
                  {result.diagnosis.map((item: string, i: number) => (
                    <li key={i} className="text-neutral-300 bg-neutral-950 p-3 rounded border border-neutral-800">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
