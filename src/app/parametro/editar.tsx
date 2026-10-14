import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Botao, Campo } from '@/components/ui';
import { formatarNumero, lerNumero, Modelo, MODELOS } from '@/lib/aquario';
import { HORA_LEMBRETE } from '@/lib/notificacoes';
import { useAquario } from '@/lib/store';
import { cores } from '@/lib/tema';

const paraTexto = (n?: number) => (n === undefined ? '' : formatarNumero(n));

export default function EditarParametro() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { parametros, salvarParametro, excluirParametro } = useAquario();
  const existente = id ? parametros.find((p) => p.id === id) : undefined;

  const [nome, setNome] = useState(existente?.nome ?? '');
  const [unidade, setUnidade] = useState(existente?.unidade ?? '');
  const [frequencia, setFrequencia] = useState(existente ? String(existente.frequenciaDias) : '7');
  const [min, setMin] = useState(paraTexto(existente?.min));
  const [max, setMax] = useState(paraTexto(existente?.max));
  const [lembrete, setLembrete] = useState(existente?.lembreteAtivo ?? true);
  const [salvando, setSalvando] = useState(false);

  function aplicarModelo(m: Modelo) {
    setNome(m.nome);
    setUnidade(m.unidade);
    setFrequencia(String(m.frequenciaDias));
    setMin(paraTexto(m.min));
    setMax(paraTexto(m.max));
  }

  async function salvar() {
    const freq = Number.parseInt(frequencia, 10);
    const vMin = lerNumero(min);
    const vMax = lerNumero(max);
    if (!nome.trim()) return Alert.alert('Informe o nome do parâmetro.');
    if (!Number.isFinite(freq) || freq < 1) return Alert.alert('A frequência deve ser de pelo menos 1 dia.');
    if ((min.trim() && vMin === undefined) || (max.trim() && vMax === undefined)) {
      return Alert.alert('Os valores da faixa ideal devem ser números.');
    }
    if (vMin !== undefined && vMax !== undefined && vMin > vMax) {
      return Alert.alert('O mínimo não pode ser maior que o máximo.');
    }

    setSalvando(true);
    try {
      await salvarParametro(
        { nome: nome.trim(), unidade: unidade.trim(), frequenciaDias: freq, min: vMin, max: vMax, lembreteAtivo: lembrete },
        existente?.id,
      );
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  function excluir() {
    if (!existente) return;
    Alert.alert('Excluir parâmetro', `Excluir "${existente.nome}" e todo o histórico de testes?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await excluirParametro(existente.id);
          router.dismissTo('/');
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: existente ? 'Editar parâmetro' : 'Novo parâmetro' }} />
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        {!existente ? (
          <View style={{ marginBottom: 18 }}>
            <Text style={estilos.secao}>Sugestões</Text>
            <View style={estilos.chips}>
              {MODELOS.map((m) => (
                <Pressable key={m.nome} onPress={() => aplicarModelo(m)} style={estilos.chip}>
                  <Text style={estilos.chipTexto}>{m.nome}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Campo rotulo="Nome" value={nome} onChangeText={setNome} placeholder="Ex.: pH, Nitrato, Cobre" />
        <Campo rotulo="Unidade" value={unidade} onChangeText={setUnidade} placeholder="Ex.: ppm, °C, dKH" />
        <Campo
          rotulo="Refazer o teste a cada (dias)"
          value={frequencia}
          onChangeText={setFrequencia}
          keyboardType="number-pad"
        />

        <Text style={estilos.secao}>Faixa ideal (opcional)</Text>
        <View style={estilos.duasColunas}>
          <View style={{ flex: 1 }}>
            <Campo rotulo="Mínimo" value={min} onChangeText={setMin} keyboardType="decimal-pad" placeholder="—" />
          </View>
          <View style={{ flex: 1 }}>
            <Campo rotulo="Máximo" value={max} onChangeText={setMax} keyboardType="decimal-pad" placeholder="—" />
          </View>
        </View>

        <View style={estilos.lembrete}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.lembreteTitulo}>Lembrete</Text>
            <Text style={estilos.lembreteTexto}>
              Notificar às {HORA_LEMBRETE}h no dia de refazer o teste.
            </Text>
          </View>
          <Switch
            value={lembrete}
            onValueChange={setLembrete}
            trackColor={{ true: cores.primaria, false: cores.borda }}
          />
        </View>

        <Botao titulo="Salvar" onPress={salvar} desabilitado={salvando} style={{ marginTop: 8 }} />
        {existente ? (
          <Botao titulo="Excluir parâmetro" variante="perigo" onPress={excluir} style={{ marginTop: 12 }} />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: 16, paddingBottom: 40 },
  secao: { fontSize: 13, fontWeight: '700', color: cores.textoSuave, textTransform: 'uppercase', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: cores.primariaClara,
  },
  chipTexto: { color: cores.primaria, fontWeight: '600' },
  duasColunas: { flexDirection: 'row', gap: 12 },
  lembrete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  lembreteTitulo: { fontSize: 15, fontWeight: '600', color: cores.texto },
  lembreteTexto: { fontSize: 13, color: cores.textoSuave },
});
