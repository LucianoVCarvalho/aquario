import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';

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
        <Stack.Screen
          name="index"
          options={{
            title: 'Meu Aquário',
            headerRight: () => (
              <Link href="/configuracoes" asChild>
                <Pressable accessibilityRole="button" hitSlop={10}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Ajustes</Text>
                </Pressable>
              </Link>
            ),
          }}
        />
        <Stack.Screen name="parametro/[id]" options={{ title: '' }} />
        <Stack.Screen name="parametro/editar" options={{ title: 'Parâmetro', presentation: 'modal' }} />
        <Stack.Screen name="medicao/[id]" options={{ title: 'Registrar teste', presentation: 'modal' }} />
        <Stack.Screen name="configuracoes" options={{ title: 'Ajustes' }} />
      </Stack>
    </AquarioProvider>
  );
}
