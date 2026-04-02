"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProcesso,
  getDepoimentos,
  type Processo,
  type DepoimentoResponse,
} from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Scale,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Cpu,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  Gavel,
} from "lucide-react";

function ProcessoDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-80" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function ProcessoDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [processo, setProcesso] = useState<Processo | null>(null);
  const [depoimentos, setDepoimentos] = useState<DepoimentoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDepo, setExpandedDepo] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [procRes, depoRes] = await Promise.allSettled([
          getProcesso(id),
          getDepoimentos(id),
        ]);

        if (procRes.status === "fulfilled") {
          setProcesso(procRes.value.data);
        } else {
          setError("Processo não encontrado.");
          return;
        }

        if (depoRes.status === "fulfilled") {
          setDepoimentos(depoRes.value.data);
        }
      } catch {
        setError("Erro ao carregar dados do processo.");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) return <ProcessoDetailSkeleton />;

  if (error || !processo) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-32">
        <XCircle className="h-16 w-16 text-red-500/50" />
        <p className="mt-4 text-lg font-medium text-slate-300">
          {error || "Processo não encontrado"}
        </p>
        <Link
          href="/processos"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Processos
        </Link>
      </div>
    );
  }

  const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
    ativo: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    suspenso: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    arquivado: { icon: XCircle, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
    encerrado: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    em_recurso: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  };

  const { icon: StatusIcon, color: statusColor, bg: statusBg } =
    statusConfig[processo.status] || statusConfig.ativo;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/processos"
          className="mt-1 rounded-lg bg-slate-800/50 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-50">
              {processo.numero_cnj}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusBg} ${statusColor}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {processo.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Criado em {formatDate(processo.criado_em)}
          </p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<DollarSign className="h-5 w-5 text-emerald-400" />}
          label="Valor da Causa"
          value={formatCurrency(processo.valor_causa)}
        />
        <InfoCard
          icon={<Building2 className="h-5 w-5 text-blue-400" />}
          label="Tribunal"
          value={processo.tribunal}
          subtitle={processo.vara || undefined}
        />
        <InfoCard
          icon={<Gavel className="h-5 w-5 text-amber-400" />}
          label="Tipo de Ação"
          value={processo.tipo_acao || "Não informado"}
        />
        <InfoCard
          icon={<Calendar className="h-5 w-5 text-purple-400" />}
          label="Data de Distribuição"
          value={
            processo.data_distribuicao
              ? formatDate(processo.data_distribuicao)
              : "Não informado"
          }
        />
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-blue-400" />
              Autor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <DetailRow label="Nome" value={processo.autor} />
              <DetailRow label="CPF/CNPJ" value={processo.cpf_cnpj_autor} />
              <DetailRow label="Advogado" value={processo.advogado_autor} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-red-400" />
              Réu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <DetailRow label="Nome" value={processo.reu} />
              <DetailRow label="CPF/CNPJ" value={processo.cpf_cnpj_reu} />
              <DetailRow label="Advogado" value={processo.advogado_reu} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Juiz */}
      {processo.juiz_responsavel && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <Gavel className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-xs text-slate-500">Juiz Responsável</p>
                <p className="text-sm font-medium text-slate-200">
                  {processo.juiz_responsavel}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo */}
      {processo.resumo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-300">
              {processo.resumo}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Análise de Testemunhas (Powered by Gemini) ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Cpu className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-100">
            Análise de Testemunhas
          </h2>
          <span className="rounded-full bg-blue-600/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-400 border border-blue-500/20">
            Powered by Gemini
          </span>
        </div>

        {depoimentos.length === 0 ? (
          <Card>
            <CardContent>
              <div className="py-12 text-center">
                <Scale className="mx-auto h-10 w-10 text-slate-700" />
                <p className="mt-3 text-sm text-slate-400">
                  Nenhum depoimento registrado para este processo.
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Adicione depoimentos via API para ativar a análise de
                  contradições com IA.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {depoimentos.map((depo) => {
              const isExpanded = expandedDepo === depo.id;
              const score = depo.score_confiabilidade;
              const hasContradiction = score !== null && score < 0.7;
              const isAnalyzed = depo.status_analise === "concluido";

              let borderColor = "border-slate-800";
              let scoreColor = "text-slate-400";
              let ScoreIcon = Clock;

              if (isAnalyzed && score !== null) {
                if (score >= 0.8) {
                  borderColor = "border-emerald-500/30";
                  scoreColor = "text-emerald-400";
                  ScoreIcon = CheckCircle2;
                } else if (score >= 0.5) {
                  borderColor = "border-amber-500/30";
                  scoreColor = "text-amber-400";
                  ScoreIcon = AlertTriangle;
                } else {
                  borderColor = "border-red-500/30";
                  scoreColor = "text-red-400";
                  ScoreIcon = AlertTriangle;
                }
              }

              return (
                <Card key={depo.id} className={`${borderColor} transition-colors`}>
                  {/* Header — always visible */}
                  <button
                    onClick={() =>
                      setExpandedDepo(isExpanded ? null : depo.id)
                    }
                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-1.5 ${
                          hasContradiction
                            ? "bg-red-500/10"
                            : isAnalyzed
                              ? "bg-emerald-500/10"
                              : "bg-slate-800"
                        }`}
                      >
                        <ScoreIcon className={`h-4 w-4 ${scoreColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {depo.testemunha_nome}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isAnalyzed
                            ? `Score: ${
                                score !== null
                                  ? `${(score * 100).toFixed(0)}%`
                                  : "N/A"
                              }`
                            : depo.status_analise === "processando"
                              ? "Análise em andamento..."
                              : "Aguardando análise"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasContradiction && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 border border-red-500/20">
                          Contradição
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/50 px-6 pb-6 pt-4 space-y-4">
                      {/* Original Testimony */}
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                          Depoimento Original
                        </p>
                        <div className="rounded-lg bg-slate-800/30 p-4">
                          <p className="text-sm leading-relaxed text-slate-300">
                            {depo.texto_depoimento}
                          </p>
                        </div>
                      </div>

                      {/* IA Analysis */}
                      {depo.analise_contradicao_ia && (
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                            Análise da IA
                          </p>
                          <div
                            className={`rounded-lg p-4 ${
                              hasContradiction
                                ? "bg-red-500/5 border border-red-500/20"
                                : "bg-emerald-500/5 border border-emerald-500/20"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <Cpu
                                className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                                  hasContradiction
                                    ? "text-red-400"
                                    : "text-emerald-400"
                                }`}
                              />
                              <p
                                className={`text-sm leading-relaxed ${
                                  hasContradiction
                                    ? "text-red-300/90"
                                    : "text-emerald-300/90"
                                }`}
                              >
                                {depo.analise_contradicao_ia}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Score Bar */}
                      {score !== null && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-slate-500">
                              Score de Confiabilidade
                            </p>
                            <p className={`text-sm font-mono font-bold ${scoreColor}`}>
                              {(score * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-800">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                score >= 0.8
                                  ? "bg-emerald-500"
                                  : score >= 0.5
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${score * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-slate-800/50 p-2">{icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-100 truncate">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-800/20 px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm text-slate-200">{value || "—"}</span>
    </div>
  );
}
