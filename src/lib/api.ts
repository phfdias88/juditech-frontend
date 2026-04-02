import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://72.60.248.41:8002";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// ── Types ────────────────────────────────────────

export interface Processo {
  id: number;
  numero_cnj: string;
  tribunal: string;
  vara: string | null;
  comarca: string | null;
  tipo_acao: string | null;
  valor_causa: number;
  status: string;
  autor: string | null;
  reu: string | null;
  cpf_cnpj_autor: string | null;
  cpf_cnpj_reu: string | null;
  advogado_autor: string | null;
  advogado_reu: string | null;
  juiz_responsavel: string | null;
  data_distribuicao: string | null;
  resumo: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface PricingRequest {
  valor_pedido: number;
  probabilidade_ganho: number;
  tempo_estimado_meses: number;
  taxa_retorno_anual_alvo: number;
  custas_estimadas: number;
}

export interface PricingResponse {
  valor_esperado: number;
  preco_maximo_compra: number;
  lucro_projetado: number;
  nivel_risco: "BAIXO" | "MEDIO" | "ALTO";
  margem_seguranca: number;
  parametros: Record<string, number>;
}

export interface HealthResponse {
  status: string;
  version: string;
  services: Record<string, string>;
}

export interface DepoimentoResponse {
  id: number;
  processo_id: number;
  testemunha_nome: string;
  texto_depoimento: string;
  status_analise: string;
  celery_task_id: string | null;
  analise_contradicao_ia: string | null;
  score_confiabilidade: number | null;
  criado_em: string;
}

export interface ProcessamentoResponse {
  aprovado: boolean;
  score_qualidade: number;
  observacoes_supervisor: string;
  alertas: string[];
  dados_extraidos: Record<string, unknown> | null;
  processo_criado_id: number | null;
}

// ── API Functions ────────────────────────────────

export const getHealth = () => api.get<HealthResponse>("/health");

export const getProcessos = () =>
  api.get<Processo[]>("/api/v1/processos/");

export const getProcesso = (id: number) =>
  api.get<Processo>(`/api/v1/processos/${id}`);

export const calculatePricing = (data: PricingRequest) =>
  api.post<PricingResponse>("/api/v1/finance/calculate-pricing", data);

export const processText = (texto: string, salvar_processo = false) =>
  api.post<ProcessamentoResponse>("/api/v1/agents/process-text", {
    texto,
    salvar_processo,
  });

export const getDepoimentos = (processoId: number) =>
  api.get<DepoimentoResponse[]>(
    `/api/v1/legal/processos/${processoId}/depoimentos`
  );

export const createDepoimento = (
  processoId: number,
  data: { processo_id: number; testemunha_nome: string; texto_depoimento: string }
) =>
  api.post<DepoimentoResponse>(
    `/api/v1/legal/processos/${processoId}/depoimentos`,
    data
  );
