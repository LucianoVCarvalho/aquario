import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { cores } from '@/lib/tema';

type BotaoProps = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'perigo';
  desabilitado?: boolean;
  style?: ViewStyle;
};

export function Botao({ titulo, onPress, variante = 'primario', desabilitado, style }: BotaoProps) {
  const fundo = variante === 'primario' ? cores.primaria : variante === 'perigo' ? cores.perigo : cores.primariaClara;
  const corTexto = variante === 'secundario' ? cores.primaria : '#fff';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={desabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.botao,
        { backgroundColor: fundo, opacity: desabilitado ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}>
      <Text style={[estilos.botaoTexto, { color: corTexto }]}>{titulo}</Text>
    </Pressable>
  );
}

export function Cartao({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[estilos.cartao, style]}>{children}</View>;
}

export function Campo({ rotulo, ajuda, ...props }: TextInputProps & { rotulo: string; ajuda?: string }) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput placeholderTextColor={cores.textoSuave} style={estilos.input} {...props} />
      {ajuda ? <Text style={estilos.ajuda}>{ajuda}</Text> : null}
    </View>
  );
}

export function Selo({ texto, cor }: { texto: string; cor: string }) {
  return (
    <View style={[estilos.selo, { backgroundColor: cor + '22' }]}>
      <View style={[estilos.ponto, { backgroundColor: cor }]} />
      <Text style={[estilos.seloTexto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  botao: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  botaoTexto: { fontSize: 16, fontWeight: '600' },
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  campo: { marginBottom: 14 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 6 },
  input: {
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: cores.texto,
  },
  ajuda: { fontSize: 12, color: cores.textoSuave, marginTop: 4 },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 5,
  },
  ponto: { width: 7, height: 7, borderRadius: 4 },
  seloTexto: { fontSize: 12, fontWeight: '600' },
});
