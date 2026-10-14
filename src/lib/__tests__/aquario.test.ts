import {
  diasEntre,
  estaPendente,
  formatarData,
  formatarDataHora,
  formatarNumero,
  lerNumero,
  medicoesDo,
  MODELOS,
  novoId,
  proximoTeste,
  situacao,
  textoFaixa,
  textoProximoTeste,
  ultimaMedicao,
} from '../aquario';
import { Medicao, Parametro } from '../types';

/** Datas em horário local, como o app usa. Mês começa em 1. */
const data = (ano: number, mes: number, dia: number, hora = 12, minuto = 0) =>
  new Date(ano, mes - 1, dia, hora, minuto);

const parametro = (extra: Partial<Parametro> = {}): Parametro => ({
  id: 'p1',
  nome: 'pH',
  unidade: '',
  frequenciaDias: 7,
  lembreteAtivo: true,
  criadoEm: data(2026, 1, 1).toISOString(),
  ...extra,
});

const medicao = (quando: Date, extra: Partial<Medicao> = {}): Medicao => ({
  id: quando.toISOString(),
  parametroId: 'p1',
  valor: 7,
  data: quando.toISOString(),
  ...extra,
});

describe('lerNumero', () => {
  it('aceita vírgula ou ponto como separador decimal', () => {
    expect(lerNumero('7,2')).toBe(7.2);
    expect(lerNumero('7.2')).toBe(7.2);
    expect(lerNumero('  0,25 ')).toBe(0.25);
    expect(lerNumero('0')).toBe(0);
    expect(lerNumero('-1,5')).toBe(-1.5);
  });

  it('retorna undefined para texto vazio ou inválido', () => {
    expect(lerNumero('')).toBeUndefined();
    expect(lerNumero('   ')).toBeUndefined();
    expect(lerNumero('abc')).toBeUndefined();
    expect(lerNumero('7,2,1')).toBeUndefined();
  });
});

describe('formatação pt-BR', () => {
  it('formata números com vírgula decimal e até 3 casas', () => {
    expect(formatarNumero(7.2)).toBe('7,2');
    expect(formatarNumero(0.125)).toBe('0,125');
    expect(formatarNumero(0.12345)).toBe('0,123');
    expect(formatarNumero(1234.5)).toBe('1.234,5');
  });

  it('formata datas como dd/mm/aaaa', () => {
    expect(formatarData(data(2026, 3, 5).toISOString())).toBe('05/03/2026');
    expect(formatarDataHora(data(2026, 3, 5, 14, 7).toISOString())).toBe('05/03/2026 14:07');
  });
});

describe('diasEntre', () => {
  it('conta dias de calendário, ignorando o horário', () => {
    expect(diasEntre(data(2026, 3, 5, 23, 59), data(2026, 3, 6, 0, 1))).toBe(1);
    expect(diasEntre(data(2026, 3, 5, 0, 1), data(2026, 3, 5, 23, 59))).toBe(0);
  });

  it('funciona na virada de mês e de ano', () => {
    expect(diasEntre(data(2026, 1, 30), data(2026, 2, 2))).toBe(3);
    expect(diasEntre(data(2026, 2, 27), data(2026, 3, 1))).toBe(2);
    expect(diasEntre(data(2028, 2, 28), data(2028, 3, 1))).toBe(2); // ano bissexto
    expect(diasEntre(data(2026, 12, 30), data(2027, 1, 2))).toBe(3);
  });

  it('é negativo quando b vem antes de a', () => {
    expect(diasEntre(data(2026, 3, 10), data(2026, 3, 7))).toBe(-3);
  });
});

describe('medicoesDo / ultimaMedicao', () => {
  const medicoes = [
    medicao(data(2026, 3, 1)),
    medicao(data(2026, 3, 10)),
    medicao(data(2026, 3, 20), { parametroId: 'outro' }),
    medicao(data(2026, 3, 5)),
  ];

  it('filtra pelo parâmetro e ordena da mais recente para a mais antiga', () => {
    expect(medicoesDo(medicoes, 'p1').map((m) => m.data)).toEqual([
      data(2026, 3, 10).toISOString(),
      data(2026, 3, 5).toISOString(),
      data(2026, 3, 1).toISOString(),
    ]);
  });

  it('não altera o array original', () => {
    const copia = [...medicoes];
    medicoesDo(medicoes, 'p1');
    expect(medicoes).toEqual(copia);
  });

  it('retorna a última medição ou undefined', () => {
    expect(ultimaMedicao(medicoes, 'p1')?.data).toBe(data(2026, 3, 10).toISOString());
    expect(ultimaMedicao(medicoes, 'inexistente')).toBeUndefined();
  });
});

describe('próximo teste', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(data(2026, 3, 10, 15, 30));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('soma a frequência à data da última medição, no início do dia', () => {
    const ultima = medicao(data(2026, 3, 1, 20, 45));
    expect(proximoTeste(parametro({ frequenciaDias: 7 }), ultima)).toEqual(data(2026, 3, 8, 0, 0));
  });

  it('atravessa a virada de mês', () => {
    const ultima = medicao(data(2026, 1, 28));
    expect(proximoTeste(parametro({ frequenciaDias: 14 }), ultima)).toEqual(data(2026, 2, 11, 0, 0));
  });

  it('sem medição, o teste é devido hoje', () => {
    expect(proximoTeste(parametro())).toEqual(data(2026, 3, 10, 0, 0));
  });

  it('descreve quando é o próximo teste', () => {
    expect(textoProximoTeste(data(2026, 3, 10), false)).toBe('Nenhum teste ainda');
    expect(textoProximoTeste(data(2026, 3, 9), true)).toBe('Atrasado há 1 dia');
    expect(textoProximoTeste(data(2026, 3, 7), true)).toBe('Atrasado há 3 dias');
    expect(textoProximoTeste(data(2026, 3, 10), true)).toBe('Testar hoje');
    expect(textoProximoTeste(data(2026, 3, 11), true)).toBe('Testar amanhã');
    expect(textoProximoTeste(data(2026, 3, 15), true)).toBe('Próximo teste em 5 dias');
  });

  it('está pendente se for hoje ou já passou', () => {
    expect(estaPendente(data(2026, 3, 9))).toBe(true);
    expect(estaPendente(data(2026, 3, 10, 23, 0))).toBe(true);
    expect(estaPendente(data(2026, 3, 11, 0, 0))).toBe(false);
  });
});

describe('situacao', () => {
  it('sem faixa definida', () => {
    expect(situacao(parametro(), 7)).toBe('sem-faixa');
  });

  it('compara com mínimo e máximo, incluindo os limites', () => {
    const p = parametro({ min: 6.5, max: 7.5 });
    expect(situacao(p, 6.4)).toBe('baixo');
    expect(situacao(p, 6.5)).toBe('ok');
    expect(situacao(p, 7.5)).toBe('ok');
    expect(situacao(p, 7.6)).toBe('alto');
  });

  it('funciona com só um dos limites', () => {
    expect(situacao(parametro({ max: 40 }), 50)).toBe('alto');
    expect(situacao(parametro({ max: 40 }), 0)).toBe('ok');
    expect(situacao(parametro({ min: 24 }), 20)).toBe('baixo');
    expect(situacao(parametro({ min: 24 }), 30)).toBe('ok');
  });

  it('trata mínimo 0 como limite definido', () => {
    expect(situacao(parametro({ min: 0, max: 0.25 }), 0)).toBe('ok');
    expect(situacao(parametro({ min: 0 }), -1)).toBe('baixo');
  });
});

describe('textoFaixa', () => {
  it('descreve a faixa com unidade', () => {
    expect(textoFaixa(parametro({ min: 0, max: 0.25, unidade: 'ppm' }))).toBe('0 – 0,25 ppm');
    expect(textoFaixa(parametro({ min: 24, unidade: '°C' }))).toBe('≥ 24 °C');
    expect(textoFaixa(parametro({ max: 40, unidade: 'ppm' }))).toBe('≤ 40 ppm');
    expect(textoFaixa(parametro({ min: 6.5, max: 7.5 }))).toBe('6,5 – 7,5');
    expect(textoFaixa(parametro())).toBe('Sem faixa definida');
  });
});

describe('novoId', () => {
  it('gera ids diferentes', () => {
    const ids = new Set(Array.from({ length: 1000 }, novoId));
    expect(ids.size).toBe(1000);
  });
});

describe('MODELOS', () => {
  it('têm frequência positiva e faixa coerente', () => {
    for (const m of MODELOS) {
      expect(m.frequenciaDias).toBeGreaterThan(0);
      if (m.min !== undefined && m.max !== undefined) expect(m.min).toBeLessThanOrEqual(m.max);
    }
  });
});
