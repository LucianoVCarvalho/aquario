import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { HORARIO_PADRAO, novoId, ultimaMedicao } from './aquario';
import { agendarLembrete, cancelarLembrete, sincronizarLembretes } from './notificacoes';
import { Horario, Medicao, Parametro } from './types';

const CHAVE = 'aquario:dados:v1';

type Dados = { parametros: Parametro[]; medicoes: Medicao[]; horario: Horario };

export type DadosParametro = Omit<Parametro, 'id' | 'criadoEm'>;

type Store = Dados & {
  carregado: boolean;
  salvarParametro(dados: DadosParametro, id?: string): Promise<string>;
  excluirParametro(id: string): Promise<void>;
  registrarMedicao(dados: Omit<Medicao, 'id'>): Promise<void>;
  excluirMedicao(id: string): Promise<void>;
  salvarHorario(horario: Horario): Promise<void>;
};

const Contexto = createContext<Store | null>(null);

const VAZIO: Dados = { parametros: [], medicoes: [], horario: HORARIO_PADRAO };

/** Completa dados salvos por versões anteriores (ex.: sem `horario`). */
function normalizar(lido: Partial<Dados>): Dados {
  return { ...VAZIO, ...lido, horario: { ...HORARIO_PADRAO, ...lido.horario } };
}

function sincronizar({ parametros, medicoes, horario }: Dados) {
  return sincronizarLembretes(parametros, horario, (id) => ultimaMedicao(medicoes, id));
}

export function AquarioProvider({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [carregado, setCarregado] = useState(false);
  const atual = useRef(dados);

  useEffect(() => {
    (async () => {
      try {
        const salvo = await AsyncStorage.getItem(CHAVE);
        if (salvo) {
          const lido = normalizar(JSON.parse(salvo));
          atual.current = lido;
          setDados(lido);
          await sincronizar(lido);
        }
      } catch (e) {
        console.warn('Falha ao carregar dados', e);
      } finally {
        setCarregado(true);
      }
    })();
  }, []);

  async function gravar(mudancas: Partial<Dados>) {
    const novos = { ...atual.current, ...mudancas };
    atual.current = novos;
    setDados(novos);
    await AsyncStorage.setItem(CHAVE, JSON.stringify(novos));
  }

  async function reagendar(parametroId: string) {
    const { parametros, medicoes, horario } = atual.current;
    const p = parametros.find((x) => x.id === parametroId);
    if (p) await agendarLembrete(p, horario, ultimaMedicao(medicoes, p.id)).catch(console.warn);
  }

  const store: Store = {
    ...dados,
    carregado,

    async salvarParametro(entrada, id) {
      const { parametros } = atual.current;
      let finalId = id;
      let lista: Parametro[];
      if (id) {
        lista = parametros.map((p) => (p.id === id ? { ...p, ...entrada } : p));
      } else {
        finalId = novoId();
        lista = [...parametros, { ...entrada, id: finalId, criadoEm: new Date().toISOString() }];
      }
      await gravar({ parametros: lista });
      await reagendar(finalId!);
      return finalId!;
    },

    async excluirParametro(id) {
      const { parametros, medicoes } = atual.current;
      await gravar({
        parametros: parametros.filter((p) => p.id !== id),
        medicoes: medicoes.filter((m) => m.parametroId !== id),
      });
      await cancelarLembrete(id).catch(console.warn);
    },

    async registrarMedicao(entrada) {
      const { medicoes } = atual.current;
      await gravar({ medicoes: [...medicoes, { ...entrada, id: novoId() }] });
      await reagendar(entrada.parametroId);
    },

    async excluirMedicao(id) {
      const { medicoes } = atual.current;
      const alvo = medicoes.find((m) => m.id === id);
      await gravar({ medicoes: medicoes.filter((m) => m.id !== id) });
      if (alvo) await reagendar(alvo.parametroId);
    },

    async salvarHorario(horario) {
      await gravar({ horario });
      await sincronizar(atual.current).catch(console.warn);
    },
  };

  return <Contexto.Provider value={store}>{children}</Contexto.Provider>;
}

export function useAquario() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useAquario precisa estar dentro de AquarioProvider');
  return ctx;
}
