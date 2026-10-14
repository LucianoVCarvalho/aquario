export type Parametro = {
  id: string;
  nome: string;
  unidade: string;
  /** A cada quantos dias o teste deve ser refeito. */
  frequenciaDias: number;
  /** Faixa ideal (opcional). */
  min?: number;
  max?: number;
  lembreteAtivo: boolean;
  criadoEm: string;
};

export type Medicao = {
  id: string;
  parametroId: string;
  valor: number;
  data: string;
  observacao?: string;
};

export type Situacao = 'ok' | 'baixo' | 'alto' | 'sem-faixa';

/** Horário do dia em que os lembretes disparam. */
export type Horario = { hora: number; minuto: number };
