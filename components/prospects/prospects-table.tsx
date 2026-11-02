'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MoreHorizontal, 
  ExternalLink, 
  Search, 
  Filter, 
  Check, 
  Clock, 
  Send, 
  Trophy, 
  XCircle,
  Plus,
  Building2,
  RefreshCw
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Prospect {
  id: string;
  name: string;
  url: string;
  industry: string;
  status: 'nuevo' | 'contactado' | 'ganado' | 'perdido' | string;
  priority: 'alta' | 'media' | 'baja' | string;
  created_at: string;
}

const statusOptions = [
  { value: 'nuevo', label: 'Nuevo', icon: Clock, color: 'text-blue-400' },
  { value: 'contactado', label: 'Contactado', icon: Send, color: 'text-amber-400' },
  { value: 'ganado', label: 'Ganado', icon: Trophy, color: 'text-emerald-400' },
  { value: 'perdido', label: 'Perdido', icon: XCircle, color: 'text-rose-400' },
];

const industryLabels: Record<string, string> = {
  hoteleria: 'Hotelería y Turismo',
  gastronomia: 'Gastronomía y Bares',
  inmobiliaria: 'Inmobiliaria',
  salud: 'Salud y Clínicas',
  ecommerce: 'E-commerce',
  servicios: 'Servicios',
  general: 'General',
};

export function ProspectsTable({ initialProspects }: { initialProspects: Prospect[] }) {
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    // Optimistic update
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );

    try {
      const res = await fetch(`/api/prospects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar en la base de datos');
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      // Revert if error
      setProspects(initialProspects);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProspects = prospects.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.url?.toLowerCase().includes(term) ||
      p.industry?.toLowerCase().includes(term) ||
      p.status?.toLowerCase().includes(term)
    );
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return (
          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20 font-medium">
            Rojo • Alta
          </Badge>
        );
      case 'media':
        return (
          <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20 font-medium">
            Amarillo • Media
          </Badge>
        );
      case 'baja':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 font-medium">
            Verde • Baja
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-zinc-400 border-zinc-700">
            {priority || 'Revisión'}
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'nuevo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Nuevo
          </span>
        );
      case 'contactado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Contactado
          </span>
        );
      case 'ganado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ganado
          </span>
        );
      case 'perdido':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Perdido
          </span>
        );
      default:
        return <span className="text-xs text-zinc-400">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controles de Búsqueda y Filtro */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por nombre, URL o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-zinc-900/80 border-zinc-800 text-sm placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-500 font-mono">
            {filteredProspects.length} de {prospects.length} prospectos
          </span>
          <Link
            href="/scout"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-9 gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer'
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Prospecto</span>
          </Link>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-lg backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-zinc-950/70 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-400 font-medium text-xs">Nombre & URL</TableHead>
              <TableHead className="text-zinc-400 font-medium text-xs">Industria</TableHead>
              <TableHead className="text-zinc-400 font-medium text-xs">Estado</TableHead>
              <TableHead className="text-zinc-400 font-medium text-xs">Prioridad</TableHead>
              <TableHead className="text-zinc-400 font-medium text-xs">Fecha</TableHead>
              <TableHead className="text-zinc-400 font-medium text-xs text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProspects.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Building2 className="w-8 h-8 text-zinc-600 mb-1" />
                    <p className="text-sm text-zinc-400 font-medium">No se encontraron prospectos</p>
                    <p className="text-xs text-zinc-600 max-w-sm">
                      {searchTerm
                        ? 'No hay registros que coincidan con la búsqueda.'
                        : 'Aún no has registrado prospectos en la base de datos.'}
                    </p>
                    <Link
                      href="/scout"
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'mt-2 text-xs border-zinc-700'
                      )}
                    >
                      Escanear primer prospecto
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProspects.map((prospect) => {
                const isUpdating = updatingId === prospect.id;

                return (
                  <TableRow
                    key={prospect.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Nombre y URL */}
                    <TableCell className="font-medium text-white max-w-[280px]">
                      <div className="truncate font-semibold text-zinc-100 text-sm">
                        {prospect.name || 'Sin Título'}
                      </div>
                      <a
                        href={prospect.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 hover:text-blue-400 flex items-center gap-1 mt-0.5 truncate transition-colors font-mono"
                        title={prospect.url}
                      >
                        <span className="truncate">{prospect.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </TableCell>

                    {/* Industria */}
                    <TableCell className="text-zinc-300 text-xs">
                      <span className="px-2 py-1 rounded bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 text-[11px]">
                        {industryLabels[prospect.industry] || prospect.industry || 'General'}
                      </span>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>{getStatusBadge(prospect.status)}</TableCell>

                    {/* Prioridad */}
                    <TableCell>{getPriorityBadge(prospect.priority)}</TableCell>

                    {/* Fecha */}
                    <TableCell className="text-zinc-400 text-xs font-mono">
                      {formatDate(prospect.created_at)}
                    </TableCell>

                    {/* Botón de Acción con Menú de Estado */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={isUpdating}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                        >
                          {isUpdating ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                          ) : (
                            <MoreHorizontal className="w-4 h-4" />
                          )}
                          <span className="sr-only">Acciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-zinc-900 border-zinc-800 text-zinc-200"
                        >
                          <DropdownMenuLabel className="text-xs text-zinc-400 font-mono">
                            Cambiar Estado
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-zinc-800" />
                          {statusOptions.map((opt) => {
                            const isCurrent = prospect.status === opt.value;
                            const Icon = opt.icon;

                            return (
                              <DropdownMenuItem
                                key={opt.value}
                                onClick={() => handleStatusChange(prospect.id, opt.value)}
                                className="flex items-center justify-between text-xs cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white py-2"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                                  <span>{opt.label}</span>
                                </div>
                                {isCurrent && <Check className="w-3.5 h-3.5 text-blue-400" />}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
