import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { configurarNotificacoes, pedirPermissao } from '@/lib/notificacoes';
import { AquarioProvider } from '@/lib/store';
import { cores } from '@/lib/tema';

configurarNotificacoes();

export default function Layout() {
  useEffect(() => {
    pedirPermissao().catch(console.warn);
  }, []);

  return (
    <AquarioProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: cores.primaria },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: cores.fundo },
        }}>
        <Stack.Screen name="index" options={{ title: 'Meu Aquário' }} />
        <Stack.Screen name="parametro/[id]" options={{ title: '' }} />
        <Stack.Screen name="parametro/editar" options={{ title: 'Parâmetro', presentation: 'modal' }} />
        <Stack.Screen name="medicao/[id]" options={{ title: 'Registrar teste', presentation: 'modal' }} />
      </Stack>
    </AquarioProvider>
  );
}
