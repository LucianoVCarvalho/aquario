import { Situacao } from './types';

export const cores = {
  primaria: '#0E7490',
  primariaClara: '#CFFAFE',
  fundo: '#F0F9FF',
  cartao: '#FFFFFF',
  texto: '#0F172A',
  textoSuave: '#64748B',
  borda: '#E2E8F0',
  perigo: '#DC2626',
  alerta: '#D97706',
  sucesso: '#16A34A',
};

export const corSituacao: Record<Situacao, string> = {
  ok: cores.sucesso,
  baixo: cores.alerta,
  alto: cores.perigo,
  'sem-faixa': cores.textoSuave,
};

export const textoSituacao: Record<Situacao, string> = {
  ok: 'Ideal',
  baixo: 'Abaixo',
  alto: 'Acima',
  'sem-faixa': '—',
};
