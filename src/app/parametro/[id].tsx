import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao, Cartao, Selo } from '@/components/ui';
import {
  estaPendente,
  formatarData,
  formatarDataHora,
  formatarNumero,
  medicoesDo,
  proximoTeste,
  situacao,
  textoFaixa,
  textoProximoTeste,
} from '@/lib/aquario';
import { useAquario } from '@/lib/store';
import { cores, corSituacao, textoSituacao } from '@/lib/tema';
import { Medicao, Parametro } from '@/lib/types';

export default function DetalheParametro() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { parametros, medicoes, excluirMedicao } = useAquario();
  const p = parametros.find((x) => x.id === id);

  if (!p) {
    return <Text style={{ padding: 16, color: cores.textoSuave }}>Parâmetro não encontrado.</Text>;
  }

  const historico = medicoesDo(medicoes, p.id);
  const ultima = historico[0];
  const proximo = proximoTeste(p, ultima);
  const pendente = estaPendente(proximo);

  function confirmarExclusao(m: Medicao) {
    Alert.alert('Excluir teste', `Excluir o registro de ${formatarDataHora(m.data)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluirMedicao(m.id) },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: p.nome,
          headerRight: () => (
            <Pressable
              hitSlop={10}
              onPress={() => router.push({ pathname: '/parametro/editar', params: { id: p.id } })}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Editar</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={historico}
        keyExtractor={(m) => m.id}
        contentContainerStyle={estilos.conteudo}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <Cartao style={{ gap: 10 }}>
              <View style={estilos.linha}>
                <Info rotulo="Último valor" valor={ultima ? `${formatarNumero(ultima.valor)} ${p.unidade}` : '—'} />
                <Info rotulo="Faixa ideal" valor={textoFaixa(p)} />
              </View>
              <View style={estilos.linha}>
                <Info rotulo="Frequência" valor={`A cada ${p.frequenciaDias} ${p.frequenciaDias === 1 ? 'dia' : 'dias'}`} />
                <Info
                  rotulo="Próximo teste"
                  valor={ultima ? formatarData(proximo.toISOString()) : 'Agora'}
                  destaque={pendente}
                />
              </View>
              <Text style={[estilos.status, pendente && { color: cores.perigo }]}>
                {textoProximoTeste(proximo, !!ultima)}
                {p.lembreteAtivo ? '' : ' · lembrete desligado'}
              </Text>
              <Botao
                titulo="Registrar teste"
                onPress={() => router.push({ pathname: '/medicao/[id]', params: { id: p.id } })}
              />
            </Cartao>

            {historico.length > 1 ? <Grafico parametro={p} historico={historico} /> : null}

            <Text style={estilos.secao}>Histórico</Text>
            {historico.length > 0 ? (
              <Text style={estilos.dica}>Toque e segure um registro para excluí-lo.</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={<Text style={estilos.dica}>Nenhum teste registrado ainda.</Text>}
        renderItem={({ item }) => {
          const sit = situacao(p, item.valor);
          return (
            <Pressable onLongPress={() => confirmarExclusao(item)}>
              <View style={estilos.item}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.itemData}>{formatarDataHora(item.data)}</Text>
                  {item.observacao ? <Text style={estilos.itemObs}>{item.observacao}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={estilos.itemValor}>
                    {formatarNumero(item.valor)} <Text style={estilos.itemUnidade}>{p.unidade}</Text>
                  </Text>
                  {sit !== 'sem-faixa' ? <Selo texto={textoSituacao[sit]} cor={corSituacao[sit]} /> : null}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </>
  );
}

function Info({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={estilos.infoRotulo}>{rotulo}</Text>
      <Text style={[estilos.infoValor, destaque && { color: cores.perigo }]}>{valor}</Text>
    </View>
  );
}

const ALTURA_GRAFICO = 120;

/** Barras simples com os últimos testes (mais antigo à esquerda). */
function Grafico({ parametro, historico }: { parametro: Parametro; historico: Medicao[] }) {
  const pontos = historico.slice(0, 12).reverse();
  const teto = Math.max(...pontos.map((m) => m.valor), parametro.max ?? 0) || 1;

  return (
    <Cartao>
      <Text style={[estilos.secao, { marginBottom: 12 }]}>Últimos {pontos.length} testes</Text>
      <View style={estilos.grafico}>
        {parametro.max !== undefined ? (
          <View style={[estilos.linhaLimite, { bottom: (parametro.max / teto) * ALTURA_GRAFICO }]} />
        ) : null}
        {pontos.map((m) => {
          const sit = situacao(parametro, m.valor);
          return (
            <View key={m.id} style={estilos.colunaGrafico}>
              <Text style={estilos.valorBarra} numberOfLines={1}>
                {formatarNumero(m.valor)}
              </Text>
              <View
                style={{
                  height: Math.max(3, (m.valor / teto) * ALTURA_GRAFICO),
                  backgroundColor: sit === 'sem-faixa' ? cores.primaria : corSituacao[sit],
                  borderRadius: 4,
                  alignSelf: 'stretch',
                }}
              />
            </View>
          );
        })}
      </View>
    </Cartao>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: 16, gap: 8, paddingBottom: 40 },
  linha: { flexDirection: 'row', gap: 12 },
  infoRotulo: { fontSize: 12, color: cores.textoSuave, textTransform: 'uppercase', fontWeight: '600' },
  infoValor: { fontSize: 16, color: cores.texto, fontWeight: '600', marginTop: 2 },
  status: { fontSize: 14, color: cores.textoSuave },
  secao: { fontSize: 13, fontWeight: '700', color: cores.textoSuave, textTransform: 'uppercase' },
  dica: { fontSize: 13, color: cores.textoSuave },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.cartao,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 12,
    gap: 12,
  },
  itemData: { fontSize: 15, color: cores.texto, fontWeight: '500' },
  itemObs: { fontSize: 13, color: cores.textoSuave, marginTop: 2 },
  itemValor: { fontSize: 18, fontWeight: '700', color: cores.texto },
  itemUnidade: { fontSize: 13, fontWeight: '400', color: cores.textoSuave },
  grafico: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: ALTURA_GRAFICO + 18 },
  colunaGrafico: { flex: 1, alignItems: 'center', gap: 2 },
  valorBarra: { fontSize: 9, color: cores.textoSuave },
  linhaLimite: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: cores.perigo,
  },
});
