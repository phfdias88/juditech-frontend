"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
  File,
  ArrowRight,
  Zap,
  Search,
  Brain,
  ShieldCheck,
} from "lucide-react";

const ACCEPTED_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXTENSIONS = [".txt", ".pdf", ".docx"];

async function extractTextFromPDF(file: globalThis.File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = content.items
      .map((item: any) => item.str || "")
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n\n");
}

async function extractTextFromFile(file: globalThis.File): Promise<string> {
  const ext = file.name.toLowerCase().split(".").pop();

  if (ext === "txt" || file.type === "text/plain") {
    return file.text();
  }

  if (ext === "pdf" || file.type === "application/pdf") {
    return extractTextFromPDF(file);
  }

  if (
    ext === "docx" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const docXml = await zip.file("word/document.xml")?.async("string");
    if (!docXml) throw new Error("Arquivo DOCX inválido");
    return docXml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  throw new Error("Formato não suportado. Use .txt, .pdf ou .docx");
}

// ── Pipeline Steps Visual ──────────────────────────
type PipelineStep = "idle" | "extracting" | "analyzing" | "creating" | "redirecting";

const PIPELINE_STEPS = [
  { key: "extracting", icon: Search, label: "Extraindo dados com IA" },
  { key: "analyzing", icon: Brain, label: "Análise jurimétrica" },
  { key: "creating", icon: ShieldCheck, label: "Salvando processo" },
  { key: "redirecting", icon: Zap, label: "Abrindo análise profunda" },
] as const;

function PipelineProgress({ currentStep }: { currentStep: PipelineStep }) {
  if (currentStep === "idle") return null;

  const stepIndex = PIPELINE_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <p className="text-sm font-medium text-blue-400">
              Processando documento...
            </p>
          </div>
          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === stepIndex;
              const isDone = i < stepIndex;
              const isPending = i > stepIndex;

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? "bg-blue-500/10 border border-blue-500/20"
                      : isDone
                        ? "bg-emerald-500/5"
                        : "opacity-40"
                  }`}
                >
                  <div
                    className={`rounded-full p-1.5 ${
                      isActive
                        ? "bg-blue-500/20"
                        : isDone
                          ? "bg-emerald-500/20"
                          : "bg-slate-800"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    ) : (
                      <StepIcon
                        className={`h-4 w-4 ${isPending ? "text-slate-600" : "text-blue-400"}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isActive
                        ? "font-medium text-blue-300"
                        : isDone
                          ? "text-emerald-400"
                          : "text-slate-600"
                    }`}
                  >
                    {step.label}
                    {isDone && " ✓"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ──────────────────────────────────
export default function UploadPage() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
  const [fileLoading, setFileLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ProcessamentoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing = pipelineStep !== "idle";

  const handleFile = useCallback(async (file: globalThis.File) => {
    const ext = "." + file.name.toLowerCase().split(".").pop();
    if (
      !ACCEPTED_TYPES.includes(file.type) &&
      !ACCEPTED_EXTENSIONS.includes(ext)
    ) {
      setError("Formato não suportado. Use .txt, .pdf ou .docx");
      return;
    }

    setFileLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const text = await extractTextFromFile(file);
      if (text.trim().length === 0) {
        setError(
          "Não foi possível extrair texto do arquivo. Verifique se o arquivo não está vazio ou protegido."
        );
        setFileName(null);
      } else {
        setTexto(text);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao ler arquivo.";
      setError(msg);
      setFileName(null);
    } finally {
      setFileLoading(false);
    }
  }, []);

  // ── FLUXO DIANA TECH: Análise Completa ──
  const handleAnaliseCompleta = async () => {
    if (texto.trim().length < 20) {
      setError("O texto deve ter pelo menos 20 caracteres.");
      return;
    }

    setError(null);
    setResultado(null);

    try {
      // FASE 1: Extração e análise com IA
      setPipelineStep("extracting");
      await new Promise((r) => setTimeout(r, 400)); // Visual feedback

      setPipelineStep("analyzing");
      const res = await processText(texto, true); // Sempre criar processo
      const data = res.data;
      setResultado(data);

      // FASE 2: Verificar se processo foi criado
      if (data.processo_criado_id) {
        setPipelineStep("creating");
        await new Promise((r) => setTimeout(r, 600));

        // FASE 3: Redirecionar para análise profunda
        setPipelineStep("redirecting");
        await new Promise((r) => setTimeout(r, 500));

        router.push(`/processos/${data.processo_criado_id}`);
      } else {
        // Processo não foi criado (dados insuficientes) — mostrar resultados
        setPipelineStep("idle");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao processar documento.";
      setError(msg);
      setPipelineStep("idle");
    }
  };

  // ── Análise Rápida (sem criar processo) ──
  const handleAnaliseRapida = async () => {
    if (texto.trim().length < 20) {
      setError("O texto deve ter pelo menos 20 caracteres.");
      return;
    }

    setError(null);
    setResultado(null);
    setPipelineStep("analyzing");

    try {
      const res = await processText(texto, false);
      setResultado(res.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao processar documento.";
      setError(msg);
    } finally {
      setPipelineStep("idle");
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

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
        {/* ── LEFT: Input Area ── */}
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
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileInput}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
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
                {fileLoading ? (
                  <>
                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-400" />
                    <p className="text-sm text-blue-400">Extraindo texto...</p>
                  </>
                ) : fileName ? (
                  <>
                    <File className="mb-2 h-8 w-8 text-emerald-400" />
                    <p className="text-sm text-emerald-400">{fileName}</p>
                    <p className="text-xs text-slate-500">
                      Clique para trocar o arquivo
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-slate-500" />
                    <p className="text-sm text-slate-400">
                      Arraste um arquivo aqui ou clique para selecionar
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Suporta <span className="text-blue-400">.pdf</span>,{" "}
                      <span className="text-blue-400">.docx</span> e{" "}
                      <span className="text-blue-400">.txt</span>
                    </p>
                  </>
                )}
              </div>

              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Cole aqui o texto completo do documento processual, sentença, petição ou depoimentos..."
                className="h-64 w-full resize-none rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <div className="mt-2 text-right text-xs text-slate-600">
                {texto.length.toLocaleString()} caracteres
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent>
              {/* Botão Principal: Análise Completa (Diana Tech) */}
              <button
                onClick={handleAnaliseCompleta}
                disabled={isProcessing || texto.trim().length < 20}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Análise Completa + Criar Processo
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-[11px] text-slate-600">
                Extrai dados, cria o processo no banco e redireciona para análise
                profunda
              </p>

              {/* Divisor */}
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-xs text-slate-600">ou</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              {/* Botão Secundário: Análise Rápida (sem criar processo) */}
              <button
                onClick={handleAnaliseRapida}
                disabled={isProcessing || texto.trim().length < 20}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-6 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                Análise Rápida (sem salvar)
              </button>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Results & Pipeline ── */}
        <div className="space-y-6">
          {/* Pipeline Progress */}
          {isProcessing && <PipelineProgress currentStep={pipelineStep} />}

          {/* Error */}
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

          {/* Resultado da análise */}
          {resultado && pipelineStep === "idle" && (
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

              {/* CTA: Ir para processo criado */}
              {resultado.processo_criado_id && (
                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-300">
                          Processo #{resultado.processo_criado_id} criado com
                          sucesso!
                        </p>
                        <p className="text-xs text-slate-500">
                          Clique para ver a análise profunda com IA
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          router.push(
                            `/processos/${resultado.processo_criado_id}`
                          )
                        }
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                      >
                        Ver Processo
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

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

          {/* Empty State */}
          {!resultado && !error && !isProcessing && (
            <Card>
              <CardContent>
                <div className="py-16 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/10">
                    <Sparkles className="h-10 w-10 text-blue-500/40" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">
                    Cole um documento ou arraste um arquivo
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    A IA vai extrair os dados, criar o processo e iniciar a
                    análise jurimétrica automaticamente
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5 text-blue-400/50" />
                      Extração
                    </span>
                    <span className="text-slate-800">→</span>
                    <span className="flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 text-indigo-400/50" />
                      Análise
                    </span>
                    <span className="text-slate-800">→</span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400/50" />
                      Insights
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
