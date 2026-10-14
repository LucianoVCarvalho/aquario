import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao, Cartao } from '@/components/ui';
import { ajustarHorario, formatarHorario } from '@/lib/aquario';
import { useAquario } from '@/lib/store';
import { cores } from '@/lib/tema';
import { Horario } from '@/lib/types';

const PASSO_MINUTO = 5;

const SUGESTOES: Horario[] = [
  { hora: 7, minuto: 0 },
  { hora: 9, minuto: 0 },
  { hora: 12, minuto: 0 },
  { hora: 18, minuto: 0 },
  { hora: 20, minuto: 0 },
];

function Ajuste({ rotulo, valor, onMenos, onMais }: { rotulo: string; valor: number; onMenos: () => void; onMais: () => void }) {
  return (
    <View style={estilos.ajuste}>
      <Text style={estilos.ajusteRotulo}>{rotulo}</Text>
      <View style={estilos.ajusteLinha}>
        <Pressable accessibilityLabel={`Diminuir ${rotulo.toLowerCase()}`} onPress={onMenos} style={estilos.passo}>
          <Text style={estilos.passoTexto}>−</Text>
        </Pressable>
        <Text style={estilos.ajusteValor}>{String(valor).padStart(2, '0')}</Text>
        <Pressable accessibilityLabel={`Aumentar ${rotulo.toLowerCase()}`} onPress={onMais} style={estilos.passo}>
          <Text style={estilos.passoTexto}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function Configuracoes() {
  const { horario: salvo, salvarHorario } = useAquario();
  const [horario, setHorario] = useState(salvo);
  const [salvando, setSalvando] = useState(false);

  const mudar = (campo: keyof Horario, passo: number) => setHorario((h) => ajustarHorario(h, campo, passo));

  async function salvar() {
    setSalvando(true);
    try {
      await salvarHorario(horario);
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.secao}>Horário dos lembretes</Text>
      <Cartao style={{ gap: 16 }}>
        <Text style={estilos.relogio}>{formatarHorario(horario)}</Text>
        <View style={estilos.ajustes}>
          <Ajuste rotulo="Hora" valor={horario.hora} onMenos={() => mudar('hora', -1)} onMais={() => mudar('hora', 1)} />
          <Ajuste
            rotulo="Minuto"
            valor={horario.minuto}
            onMenos={() => mudar('minuto', -PASSO_MINUTO)}
            onMais={() => mudar('minuto', PASSO_MINUTO)}
          />
        </View>
        <View style={estilos.chips}>
          {SUGESTOES.map((s) => {
            const ativo = s.hora === horario.hora && s.minuto === horario.minuto;
            return (
              <Pressable
                key={formatarHorario(s)}
                onPress={() => setHorario(s)}
                style={[estilos.chip, ativo && { backgroundColor: cores.primaria }]}>
                <Text style={[estilos.chipTexto, ativo && { color: '#fff' }]}>{formatarHorario(s)}</Text>
              </Pressable>
            );
          })}
        </View>
      </Cartao>
      <Text style={estilos.ajuda}>
        Vale para todos os parâmetros com lembrete ativo: a notificação chega nesse horário, no dia de refazer o teste.
      </Text>

      <Botao titulo="Salvar" onPress={salvar} desabilitado={salvando} style={{ marginTop: 20 }} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: 16, paddingBottom: 40 },
  secao: { fontSize: 13, fontWeight: '700', color: cores.textoSuave, textTransform: 'uppercase', marginBottom: 8 },
  relogio: { fontSize: 48, fontWeight: '700', color: cores.texto, textAlign: 'center', fontVariant: ['tabular-nums'] },
  ajustes: { flexDirection: 'row', justifyContent: 'space-around' },
  ajuste: { alignItems: 'center', gap: 6 },
  ajusteRotulo: { fontSize: 13, fontWeight: '600', color: cores.textoSuave },
  ajusteLinha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ajusteValor: { fontSize: 22, fontWeight: '600', color: cores.texto, minWidth: 32, textAlign: 'center' },
  passo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passoTexto: { fontSize: 24, color: cores.primaria, fontWeight: '600', lineHeight: 26 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: cores.primariaClara },
  chipTexto: { color: cores.primaria, fontWeight: '600', fontVariant: ['tabular-nums'] },
  ajuda: { fontSize: 13, color: cores.textoSuave, marginTop: 10 },
});
