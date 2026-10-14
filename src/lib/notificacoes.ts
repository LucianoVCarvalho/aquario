import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { momentoLembrete } from './aquario';
import { Horario, Medicao, Parametro } from './types';

const SUPORTADO = Platform.OS !== 'web';
const CANAL = 'lembretes';

const idLembrete = (parametroId: string) => `lembrete-${parametroId}`;

export function configurarNotificacoes() {
  if (!SUPORTADO) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function pedirPermissao(): Promise<boolean> {
  if (!SUPORTADO) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Lembretes de testes',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

export async function cancelarLembrete(parametroId: string) {
  if (!SUPORTADO) return;
  await Notifications.cancelScheduledNotificationAsync(idLembrete(parametroId));
}

/** (Re)agenda o lembrete do parâmetro para o dia do próximo teste, no horário configurado. */
export async function agendarLembrete(parametro: Parametro, horario: Horario, ultima?: Medicao) {
  if (!SUPORTADO) return;
  await cancelarLembrete(parametro.id);
  if (!parametro.lembreteAtivo || !ultima) return;

  const disparo = momentoLembrete(parametro, ultima, horario);
  if (disparo.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: idLembrete(parametro.id),
    content: {
      title: `Hora de testar: ${parametro.nome}`,
      body: `Já se passaram ${parametro.frequenciaDias} dia(s) desde o último teste de ${parametro.nome}.`,
      data: { parametroId: parametro.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: disparo,
      channelId: CANAL,
    },
  });
}

export async function sincronizarLembretes(
  parametros: Parametro[],
  horario: Horario,
  ultimaDe: (id: string) => Medicao | undefined,
) {
  if (!SUPORTADO) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const p of parametros) await agendarLembrete(p, horario, ultimaDe(p.id));
}
