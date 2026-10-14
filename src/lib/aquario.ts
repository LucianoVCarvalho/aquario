import { Medicao, Parametro, Situacao } from './types';

const DIA_MS = 24 * 60 * 60 * 1000;

export function novoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Aceita vírgula ou ponto como separador decimal. */
export function lerNumero(texto: string): number | undefined {
  const limpo = texto.trim().replace(',', '.');
  if (limpo === '') return undefined;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : undefined;
}

export function formatarNumero(n: number) {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatarDataHora(iso: string) {
  const d = new Date(iso);
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${formatarData(iso)} ${hora}`;
}

function inicioDoDia(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Diferença em dias de calendário (b - a). */
export function diasEntre(a: Date, b: Date) {
  return Math.round((inicioDoDia(b).getTime() - inicioDoDia(a).getTime()) / DIA_MS);
}

export function medicoesDo(medicoes: Medicao[], parametroId: string) {
  return medicoes
    .filter((m) => m.parametroId === parametroId)
    .sort((a, b) => b.data.localeCompare(a.data));
}

export function ultimaMedicao(medicoes: Medicao[], parametroId: string): Medicao | undefined {
  return medicoesDo(medicoes, parametroId)[0];
}

/** Data do próximo teste. Sem nenhuma medição, o teste já é devido hoje. */
export function proximoTeste(parametro: Parametro, ultima?: Medicao): Date {
  if (!ultima) return inicioDoDia(new Date());
  const d = inicioDoDia(new Date(ultima.data));
  d.setDate(d.getDate() + parametro.frequenciaDias);
  return d;
}

export function textoProximoTeste(data: Date, temMedicao: boolean) {
  if (!temMedicao) return 'Nenhum teste ainda';
  const dias = diasEntre(new Date(), data);
  if (dias < 0) return `Atrasado há ${-dias} ${-dias === 1 ? 'dia' : 'dias'}`;
  if (dias === 0) return 'Testar hoje';
  if (dias === 1) return 'Testar amanhã';
  return `Próximo teste em ${dias} dias`;
}

export function estaPendente(data: Date) {
  return diasEntre(new Date(), data) <= 0;
}

export function situacao(parametro: Parametro, valor: number): Situacao {
  const { min, max } = parametro;
  if (min === undefined && max === undefined) return 'sem-faixa';
  if (min !== undefined && valor < min) return 'baixo';
  if (max !== undefined && valor > max) return 'alto';
  return 'ok';
}

export function textoFaixa(p: Parametro) {
  const u = p.unidade ? ` ${p.unidade}` : '';
  if (p.min !== undefined && p.max !== undefined) return `${formatarNumero(p.min)} – ${formatarNumero(p.max)}${u}`;
  if (p.min !== undefined) return `≥ ${formatarNumero(p.min)}${u}`;
  if (p.max !== undefined) return `≤ ${formatarNumero(p.max)}${u}`;
  return 'Sem faixa definida';
}

export type Modelo = Pick<Parametro, 'nome' | 'unidade' | 'frequenciaDias' | 'min' | 'max'>;

/** Sugestões para preencher o formulário rapidamente (água doce). */
export const MODELOS: Modelo[] = [
  { nome: 'pH', unidade: '', frequenciaDias: 7, min: 6.5, max: 7.5 },
  { nome: 'Amônia', unidade: 'ppm', frequenciaDias: 7, min: 0, max: 0.25 },
  { nome: 'Nitrito', unidade: 'ppm', frequenciaDias: 7, min: 0, max: 0.25 },
  { nome: 'Nitrato', unidade: 'ppm', frequenciaDias: 7, min: 0, max: 40 },
  { nome: 'KH', unidade: 'dKH', frequenciaDias: 14, min: 3, max: 8 },
  { nome: 'GH', unidade: 'dGH', frequenciaDias: 14, min: 4, max: 12 },
  { nome: 'Temperatura', unidade: '°C', frequenciaDias: 1, min: 24, max: 28 },
  { nome: 'Fosfato', unidade: 'ppm', frequenciaDias: 14, min: 0, max: 1 },
];
