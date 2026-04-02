"use client";

import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { processText, type ProcessamentoResponse } from "@/lib/api";
import {
  Upload,
  FileText,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function UploadPage() {
  const [texto, setTexto] = useState("");
  const [criarProcesso, setCriarProcesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ProcessamentoResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleAnalise = async () => {
    if (texto.trim().length < 20) {
      setError("O texto deve ter pelo menos 20 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await processText(texto, criarProcesso);
      setResultado(res.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao processar documento.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setTexto(evt.target?.result as string);
      };
      reader.readAsText(file);
    }
  }, []);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-50">
          Upload & Análise com IA
        </h1>
        <p className="text-sm text-slate-500">
          Cole o texto de um documento processual ou arraste um arquivo para
          análise automática com Google Gemini
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Area */}
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Documento Processual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative mb-4 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                }`}
              >
                <Upload className="mb-2 h-8 w-8 text-slate-500" />
                <p className="text-sm text-slate-400">
                  Arraste um arquivo .txt aqui
                </p>
                <p className="text-xs text-slate-600">ou cole o texto abaixo</p>
              </div>

              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Cole aqui o texto completo do documento processual, sentença, petição ou depoimentos..."
                className="h-64 w-full resize-none rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="mt-2 text-right text-xs text-slate-600">
                {texto.length} caracteres
              </div>
            </CardContent>
          </Card>

          {/* Options & Submit */}
          <Card>
            <CardContent>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 p-4 transition-colors hover:bg-slate-800/30">
                <input
                  type="checkbox"
                  checked={criarProcesso}
                  onChange={(e) => setCriarProcesso(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Criar processo automaticamente
                  </p>
                  <p className="text-xs text-slate-500">
                    Se os dados forem extraídos com sucesso, cadastra o processo
                    no banco
                  </p>
                </div>
              </label>

              <button
                onClick={handleAnalise}
                disabled={loading || texto.trim().length < 20}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analisando com Gemini IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Iniciar Análise Jurimétrica
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Results Area */}
        <div className="space-y-6">
          {error && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent>
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 text-red-400" />
                  <div>
                    <p className="font-medium text-red-400">
                      Erro no processamento
                    </p>
                    <p className="mt-1 text-sm text-red-300/70">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {resultado && (
            <>
              {/* Score Card */}
              <Card
                className={
                  resultado.aprovado
                    ? "border-emerald-500/20"
                    : "border-amber-500/20"
                }
              >
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {resultado.aprovado ? (
                        <div className="rounded-full bg-emerald-500/10 p-2">
                          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="rounded-full bg-amber-500/10 p-2">
                          <AlertTriangle className="h-6 w-6 text-amber-400" />
                        </div>
                      )}
                      <div>
                        <p
                          className={`font-semibold ${
                            resultado.aprovado
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {resultado.aprovado
                            ? "Documento Aprovado"
                            : "Documento Requer Revisão"}
                        </p>
                        <p className="text-sm text-slate-400">
                          Score de qualidade:{" "}
                          <span className="font-mono font-bold text-slate-200">
                            {(resultado.score_qualidade * 100).toFixed(0)}%
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Cpu className="mx-auto mb-1 h-5 w-5 text-blue-400" />
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Gemini IA
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supervisor Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Observações do Supervisor IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {resultado.observacoes_supervisor}
                  </p>
                </CardContent>
              </Card>

              {/* Extracted Data */}
              {resultado.dados_extraidos && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Extraídos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(resultado.dados_extraidos).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-start justify-between rounded-lg bg-slate-800/30 px-4 py-2"
                          >
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="max-w-[60%] text-right font-mono text-sm text-slate-200">
                              {Array.isArray(value)
                                ? value.join(", ") || "-"
                                : String(value ?? "-")}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alerts */}
              {resultado.alertas.length > 0 && (
                <Card className="border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-400">
                      <AlertTriangle className="h-4 w-4" />
                      Alertas ({resultado.alertas.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {resultado.alertas.map((alerta, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-amber-300/80"
                        >
                          <span className="mt-1 text-amber-500">&#x2022;</span>
                          {alerta}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!resultado && !error && (
            <Card>
              <CardContent>
                <div className="py-16 text-center">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-slate-700" />
                  <p className="text-sm text-slate-500">
                    Cole um documento e clique em &quot;Iniciar Análise&quot; para
                    ver os resultados da IA aqui.
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
