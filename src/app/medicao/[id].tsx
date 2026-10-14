import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao, Campo, Selo } from '@/components/ui';
import { lerNumero, situacao, textoFaixa } from '@/lib/aquario';
import { useAquario } from '@/lib/store';
import { cores, corSituacao, textoSituacao } from '@/lib/tema';

const QUANDO = [
  { rotulo: 'Agora', dias: 0 },
  { rotulo: 'Ontem', dias: 1 },
  { rotulo: 'Há 2 dias', dias: 2 },
];

export default function RegistrarMedicao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { parametros, registrarMedicao } = useAquario();
  const p = parametros.find((x) => x.id === id);

  const [valor, setValor] = useState('');
  const [observacao, setObservacao] = useState('');
  const [diasAtras, setDiasAtras] = useState(0);
  const [salvando, setSalvando] = useState(false);

  if (!p) {
    return <Text style={{ padding: 16, color: cores.textoSuave }}>Parâmetro não encontrado.</Text>;
  }

  const numero = lerNumero(valor);
  const sit = numero !== undefined ? situacao(p, numero) : undefined;

  async function salvar() {
    if (numero === undefined) return Alert.alert('Informe um valor numérico.');
    const data = new Date();
    data.setDate(data.getDate() - diasAtras);
    setSalvando(true);
    try {
      await registrarMedicao({
        parametroId: p!.id,
        valor: numero,
        data: data.toISOString(),
        observacao: observacao.trim() || undefined,
      });
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo}>{p.nome}</Text>
        <Text style={estilos.faixa}>Faixa ideal: {textoFaixa(p)}</Text>

        <Campo
          rotulo={`Valor${p.unidade ? ` (${p.unidade})` : ''}`}
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
          placeholder="0,0"
          autoFocus
          style={estilos.inputValor}
        />
        {sit && sit !== 'sem-faixa' ? (
          <View style={{ marginTop: -6, marginBottom: 14 }}>
            <Selo texto={textoSituacao[sit]} cor={corSituacao[sit]} />
          </View>
        ) : null}

        <Text style={estilos.rotulo}>Quando foi feito</Text>
        <View style={estilos.chips}>
          {QUANDO.map((q) => {
            const ativo = q.dias === diasAtras;
            return (
              <Pressable
                key={q.dias}
                onPress={() => setDiasAtras(q.dias)}
                style={[estilos.chip, ativo && { backgroundColor: cores.primaria }]}>
                <Text style={[estilos.chipTexto, ativo && { color: '#fff' }]}>{q.rotulo}</Text>
              </Pressable>
            );
          })}
        </View>

        <Campo
          rotulo="Observação (opcional)"
          value={observacao}
          onChangeText={setObservacao}
          placeholder="Ex.: após troca parcial de água"
          multiline
        />

        <Botao titulo="Salvar teste" onPress={salvar} desabilitado={salvando || numero === undefined} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: 16, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: '700', color: cores.texto },
  faixa: { fontSize: 14, color: cores.textoSuave, marginBottom: 18, marginTop: 2 },
  inputValor: { fontSize: 28, fontWeight: '700', paddingVertical: 12 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 6 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: cores.primariaClara },
  chipTexto: { color: cores.primaria, fontWeight: '600' },
});
