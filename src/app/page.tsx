"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { getProcessos, getHealth, type Processo } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Scale,
  DollarSign,
  AlertTriangle,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
} from "lucide-react";

export default function DashboardPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [apiStatus, setApiStatus] = useState<string>("loading");
  const [apiVersion, setApiVersion] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [processosRes, healthRes] = await Promise.all([
          getProcessos(),
          getHealth(),
        ]);
        setProcessos(processosRes.data);
        setApiStatus(healthRes.data.status);
        setApiVersion(healthRes.data.version);
      } catch {
        setApiStatus("offline");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const totalValor = processos.reduce((acc, p) => acc + p.valor_causa, 0);
  const ativos = processos.filter((p) => p.status === "ativo").length;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Visão geral da plataforma de inteligência jurídica
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2">
          <div
            className={`h-2 w-2 rounded-full ${
              apiStatus === "ok"
                ? "bg-emerald-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
          <span className="text-xs text-slate-400">
            API {apiStatus === "ok" ? "Online" : "Offline"}{" "}
            {apiVersion && `v${apiVersion}`}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Processos"
          value={processos.length}
          subtitle={`${ativos} ativos`}
          icon={<Scale className="h-5 w-5" />}
          trend="up"
        />
        <StatCard
          title="Valor Potencial da Carteira"
          value={formatCurrency(totalValor)}
          subtitle="Soma dos valores de causa"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Alertas de IA"
          value={0}
          subtitle="Contradições detectadas"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          title="Status da API"
          value={apiStatus === "ok" ? "Operacional" : "Indisponível"}
          subtitle="Todos os serviços"
          icon={<Activity className="h-5 w-5" />}
          trend={apiStatus === "ok" ? "up" : "down"}
        />
      </div>

      {/* Recent Processes Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Processos Recentes</CardTitle>
            <Link
              href="/processos"
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {processos.length === 0 ? (
            <div className="py-12 text-center">
              <Scale className="mx-auto h-12 w-12 text-slate-700" />
              <p className="mt-3 text-sm text-slate-400">
                Nenhum processo encontrado.
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
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4">CNJ</th>
                    <th className="pb-3 pr-4">Tribunal</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Valor</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {processos.slice(0, 10).map((p) => (
                    <tr
                      key={p.id}
                      className="group cursor-pointer transition-colors hover:bg-slate-800/30"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/processos/${p.id}`}
                          className="font-mono text-sm text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {p.numero_cnj}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                          {p.tribunal}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-400">
                        {p.tipo_acao || "-"}
                      </td>
                      <td className="py-3 pr-4 text-sm font-medium text-slate-200">
                        {formatCurrency(p.valor_causa)}
                      </td>
                      <td className="py-3 pr-4">
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
