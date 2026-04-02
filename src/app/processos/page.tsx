"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProcessos, type Processo } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Scale,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  ExternalLink,
} from "lucide-react";

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getProcessos();
        setProcessos(res.data);
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = processos.filter(
    (p) =>
      p.numero_cnj.toLowerCase().includes(filtro.toLowerCase()) ||
      (p.tribunal || "").toLowerCase().includes(filtro.toLowerCase()) ||
      (p.autor || "").toLowerCase().includes(filtro.toLowerCase()) ||
      (p.reu || "").toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-80 rounded-lg" />
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <table className="w-full">
            <tbody className="divide-y divide-slate-800/50">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-3 pr-3"><Skeleton className="h-4 w-8" /></td>
                  <td className="py-3 pr-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="py-3 pr-3"><Skeleton className="h-5 w-16 rounded" /></td>
                  <td className="py-3 pr-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="py-3 pr-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="py-3 pr-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="py-3 pr-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="py-3"><Skeleton className="h-4 w-28" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Processos</h1>
          <p className="text-sm text-slate-500">
            {processos.length} processos cadastrados
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por CNJ, tribunal, autor ou réu..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              {processos.length === 0 ? (
                <>
                  <Scale className="mx-auto h-10 w-10 text-slate-700" />
                  <p className="mt-3 text-sm text-slate-400">
                    Nenhum processo cadastrado ainda.
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Comece fazendo o upload de um documento processual.
                  </p>
                  <Link
                    href="/upload"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Fazer Upload de PDF
                  </Link>
                </>
              ) : (
                <>
                  <Filter className="mx-auto h-10 w-10 text-slate-700" />
                  <p className="mt-3 text-sm text-slate-500">
                    Nenhum processo encontrado para &quot;{filtro}&quot;.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-3">ID</th>
                    <th className="pb-3 pr-3">CNJ</th>
                    <th className="pb-3 pr-3">Tribunal</th>
                    <th className="pb-3 pr-3">Autor</th>
                    <th className="pb-3 pr-3">Réu</th>
                    <th className="pb-3 pr-3">Valor</th>
                    <th className="pb-3 pr-3">Status</th>
                    <th className="pb-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="group cursor-pointer transition-colors hover:bg-slate-800/30"
                    >
                      <td className="py-3 pr-3 text-sm text-slate-500">
                        #{p.id}
                      </td>
                      <td className="py-3 pr-3">
                        <Link
                          href={`/processos/${p.id}`}
                          className="inline-flex items-center gap-1 font-mono text-sm text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {p.numero_cnj}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                          {p.tribunal}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-sm text-slate-300">
                        {p.autor || "-"}
                      </td>
                      <td className="py-3 pr-3 text-sm text-slate-300">
                        {p.reu || "-"}
                      </td>
                      <td className="py-3 pr-3 text-sm font-medium text-slate-200">
                        {formatCurrency(p.valor_causa)}
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 text-sm text-slate-500">
                        {formatDate(p.criado_em)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    ativo: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10" },
    suspenso: { icon: Clock, color: "text-amber-400 bg-amber-500/10" },
    arquivado: { icon: XCircle, color: "text-slate-400 bg-slate-500/10" },
    encerrado: { icon: XCircle, color: "text-red-400 bg-red-500/10" },
    em_recurso: { icon: Clock, color: "text-blue-400 bg-blue-500/10" },
  };
  const { icon: Icon, color } = config[status] || config.ativo;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
