import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { novoId, ultimaMedicao } from './aquario';
import { agendarLembrete, cancelarLembrete, sincronizarLembretes } from './notificacoes';
import { Medicao, Parametro } from './types';

const CHAVE = 'aquario:dados:v1';

type Dados = { parametros: Parametro[]; medicoes: Medicao[] };

export type DadosParametro = Omit<Parametro, 'id' | 'criadoEm'>;

type Store = Dados & {
  carregado: boolean;
  salvarParametro(dados: DadosParametro, id?: string): Promise<string>;
  excluirParametro(id: string): Promise<void>;
  registrarMedicao(dados: Omit<Medicao, 'id'>): Promise<void>;
  excluirMedicao(id: string): Promise<void>;
};

const Contexto = createContext<Store | null>(null);

export function AquarioProvider({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<Dados>({ parametros: [], medicoes: [] });
  const [carregado, setCarregado] = useState(false);
  const atual = useRef(dados);

  useEffect(() => {
    (async () => {
      try {
        const salvo = await AsyncStorage.getItem(CHAVE);
        if (salvo) {
          const lido: Dados = JSON.parse(salvo);
          atual.current = lido;
          setDados(lido);
          await sincronizarLembretes(lido.parametros, (id) => ultimaMedicao(lido.medicoes, id));
        }
      } catch (e) {
        console.warn('Falha ao carregar dados', e);
      } finally {
        setCarregado(true);
      }
    })();
  }, []);

  async function gravar(novos: Dados) {
    atual.current = novos;
    setDados(novos);
    await AsyncStorage.setItem(CHAVE, JSON.stringify(novos));
  }

  async function reagendar(parametroId: string) {
    const { parametros, medicoes } = atual.current;
    const p = parametros.find((x) => x.id === parametroId);
    if (p) await agendarLembrete(p, ultimaMedicao(medicoes, p.id)).catch(console.warn);
  }

  const store: Store = {
    ...dados,
    carregado,

    async salvarParametro(entrada, id) {
      const { parametros, medicoes } = atual.current;
      let finalId = id;
      let lista: Parametro[];
      if (id) {
        lista = parametros.map((p) => (p.id === id ? { ...p, ...entrada } : p));
      } else {
        finalId = novoId();
        lista = [...parametros, { ...entrada, id: finalId, criadoEm: new Date().toISOString() }];
      }
      await gravar({ parametros: lista, medicoes });
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
      const { parametros, medicoes } = atual.current;
      await gravar({ parametros, medicoes: [...medicoes, { ...entrada, id: novoId() }] });
      await reagendar(entrada.parametroId);
    },

    async excluirMedicao(id) {
      const { parametros, medicoes } = atual.current;
      const alvo = medicoes.find((m) => m.id === id);
      await gravar({ parametros, medicoes: medicoes.filter((m) => m.id !== id) });
      if (alvo) await reagendar(alvo.parametroId);
    },
  };

  return <Contexto.Provider value={store}>{children}</Contexto.Provider>;
}

export function useAquario() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useAquario precisa estar dentro de AquarioProvider');
  return ctx;
}
