"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { calculatePricing, type PricingResponse } from "@/lib/api";
import { formatCurrency, riskColor, riskBg } from "@/lib/utils";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Target,
  Loader2,
  BarChart3,
} from "lucide-react";

export default function FinanceiroPage() {
  const [form, setForm] = useState({
    valor_pedido: "",
    probabilidade_ganho: "",
    tempo_estimado_meses: "",
    taxa_retorno_anual_alvo: "",
    custas_estimadas: "",
  });
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<PricingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await calculatePricing({
        valor_pedido: parseFloat(form.valor_pedido),
        probabilidade_ganho: parseFloat(form.probabilidade_ganho) / 100,
        tempo_estimado_meses: parseInt(form.tempo_estimado_meses),
        taxa_retorno_anual_alvo: parseFloat(form.taxa_retorno_anual_alvo) / 100,
        custas_estimadas: parseFloat(form.custas_estimadas),
      });
      setResultado(res.data);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || "Erro ao calcular.");
      } else {
        setError("Erro ao conectar com a API.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-50">
          Calculadora de Pricing — Litigation Finance
        </h1>
        <p className="text-sm text-slate-500">
          Calcule o preço máximo de aquisição, valor esperado e risco de ativos
          judiciais
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-400" />
                Parâmetros do Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField
                  label="Valor do Pedido (R$)"
                  name="valor_pedido"
                  value={form.valor_pedido}
                  onChange={handleChange}
                  placeholder="250000"
                  icon={<DollarSign className="h-4 w-4" />}
                />
                <FormField
                  label="Probabilidade de Ganho (%)"
                  name="probabilidade_ganho"
                  value={form.probabilidade_ganho}
                  onChange={handleChange}
                  placeholder="75"
                  icon={<Target className="h-4 w-4" />}
                />
                <FormField
                  label="Tempo Estimado (meses)"
                  name="tempo_estimado_meses"
                  value={form.tempo_estimado_meses}
                  onChange={handleChange}
                  placeholder="18"
                  icon={<BarChart3 className="h-4 w-4" />}
                />
                <FormField
                  label="Taxa Retorno Anual Alvo (%)"
                  name="taxa_retorno_anual_alvo"
                  value={form.taxa_retorno_anual_alvo}
                  onChange={handleChange}
                  placeholder="15"
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <FormField
                  label="Custas Estimadas (R$)"
                  name="custas_estimadas"
                  value={form.custas_estimadas}
                  onChange={handleChange}
                  placeholder="20000"
                  icon={<TrendingDown className="h-4 w-4" />}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4" />
                      Calcular Pricing
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6 lg:col-span-3">
          {error && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent>
                <div className="flex items-start gap-3">
                  <TrendingDown className="mt-0.5 h-5 w-5 text-red-400" />
                  <div>
                    <p className="font-medium text-red-400">
                      Ativo Inviável
                    </p>
                    <p className="mt-1 text-sm text-red-300/70">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {resultado && (
            <>
              {/* Risk Banner */}
              <Card className={`border ${riskBg(resultado.nivel_risco)}`}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-xl p-3 ${riskBg(resultado.nivel_risco)}`}
                      >
                        <Shield
                          className={`h-8 w-8 ${riskColor(resultado.nivel_risco)}`}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Nível de Risco</p>
                        <p
                          className={`text-3xl font-bold ${riskColor(resultado.nivel_risco)}`}
                        >
                          {resultado.nivel_risco}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">
                        Margem de Segurança
                      </p>
                      <p className="text-2xl font-bold text-slate-100">
                        {resultado.margem_seguranca.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Valor Esperado (EV)"
                  value={formatCurrency(resultado.valor_esperado)}
                  description="(V x p) - Custas"
                  color="text-blue-400"
                />
                <MetricCard
                  label="Preço Máx. Compra (PV)"
                  value={formatCurrency(resultado.preco_maximo_compra)}
                  description="EV / (1 + r)^t"
                  color="text-emerald-400"
                />
                <MetricCard
                  label="Lucro Projetado"
                  value={formatCurrency(resultado.lucro_projetado)}
                  description="EV - PV"
                  color={
                    resultado.lucro_projetado > 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                />
              </div>

              {/* Formula Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Parâmetros Utilizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(resultado.parametros).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-2.5"
                      >
                        <span className="text-xs text-slate-500">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-sm text-slate-200">
                          {typeof val === "number" && val > 1000
                            ? formatCurrency(val)
                            : typeof val === "number"
                              ? val.toFixed(4)
                              : val}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!resultado && !error && (
            <Card>
              <CardContent>
                <div className="py-20 text-center">
                  <Calculator className="mx-auto mb-4 h-12 w-12 text-slate-700" />
                  <p className="text-sm text-slate-500">
                    Preencha os parâmetros e clique em &quot;Calcular Pricing&quot;
                    para ver a análise financeira.
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    Fórmulas: EV = (V x p) - C &nbsp;|&nbsp; PV = EV / (1 +
                    r)^t
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </div>
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          step="any"
          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  color,
}: {
  label: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
        <p className="mt-1 font-mono text-[10px] text-slate-600">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
