import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao, Cartao, Selo } from '@/components/ui';
import {
  estaPendente,
  formatarNumero,
  proximoTeste,
  situacao,
  textoProximoTeste,
  ultimaMedicao,
} from '@/lib/aquario';
import { useAquario } from '@/lib/store';
import { cores, corSituacao, textoSituacao } from '@/lib/tema';

export default function Inicio() {
  const { parametros, medicoes, carregado } = useAquario();
  const insets = useSafeAreaInsets();

  if (!carregado) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={cores.primaria} />;
  }

  const itens = parametros
    .map((p) => {
      const ultima = ultimaMedicao(medicoes, p.id);
      return { p, ultima, proximo: proximoTeste(p, ultima) };
    })
    .sort((a, b) => a.proximo.getTime() - b.proximo.getTime());

  const pendentes = itens.filter((i) => estaPendente(i.proximo)).length;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={itens}
        keyExtractor={(i) => i.p.id}
        contentContainerStyle={[estilos.lista, { paddingBottom: insets.bottom + 96 }]}
        ListHeaderComponent={
          itens.length > 0 ? (
            <Text style={estilos.resumo}>
              {pendentes === 0
                ? 'Tudo em dia! Nenhum teste pendente.'
                : `${pendentes} ${pendentes === 1 ? 'teste pendente' : 'testes pendentes'} para hoje.`}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <Cartao style={{ alignItems: 'center', gap: 10 }}>
            <Text style={estilos.vazioTitulo}>Nenhum parâmetro ainda</Text>
            <Text style={estilos.vazioTexto}>
              Cadastre os testes que você faz na água (pH, amônia, nitrato…) e com que frequência quer refazê-los.
            </Text>
            <Botao titulo="Adicionar parâmetro" onPress={() => router.push('/parametro/editar')} />
          </Cartao>
        }
        renderItem={({ item: { p, ultima, proximo } }) => {
          const sit = ultima ? situacao(p, ultima.valor) : undefined;
          const pendente = estaPendente(proximo);
          return (
            <Pressable onPress={() => router.push({ pathname: '/parametro/[id]', params: { id: p.id } })}>
              <Cartao style={pendente ? estilos.cartaoPendente : undefined}>
                <View style={estilos.linha}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={estilos.nome}>{p.nome}</Text>
                    <Text style={[estilos.proximo, pendente && { color: cores.perigo, fontWeight: '600' }]}>
                      {textoProximoTeste(proximo, !!ultima)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={estilos.valor}>
                      {ultima ? formatarNumero(ultima.valor) : '—'}
                      {ultima && p.unidade ? <Text style={estilos.unidade}> {p.unidade}</Text> : null}
                    </Text>
                    {sit && sit !== 'sem-faixa' ? <Selo texto={textoSituacao[sit]} cor={corSituacao[sit]} /> : null}
                  </View>
                </View>
                <Botao
                  titulo="Registrar teste"
                  variante={pendente ? 'primario' : 'secundario'}
                  style={{ marginTop: 12 }}
                  onPress={() => router.push({ pathname: '/medicao/[id]', params: { id: p.id } })}
                />
              </Cartao>
            </Pressable>
          );
        }}
      />
      {itens.length > 0 ? (
        <Pressable
          accessibilityLabel="Adicionar parâmetro"
          onPress={() => router.push('/parametro/editar')}
          style={({ pressed }) => [estilos.fab, { bottom: insets.bottom + 24, opacity: pressed ? 0.85 : 1 }]}>
          <Text style={estilos.fabTexto}>+</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: { padding: 16, gap: 12 },
  resumo: { fontSize: 15, color: cores.textoSuave, marginBottom: 4 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nome: { fontSize: 18, fontWeight: '700', color: cores.texto },
  proximo: { fontSize: 14, color: cores.textoSuave },
  valor: { fontSize: 22, fontWeight: '700', color: cores.texto },
  unidade: { fontSize: 14, fontWeight: '400', color: cores.textoSuave },
  cartaoPendente: { borderColor: cores.perigo, borderWidth: 1.5 },
  vazioTitulo: { fontSize: 18, fontWeight: '700', color: cores.texto },
  vazioTexto: { fontSize: 15, color: cores.textoSuave, textAlign: 'center', marginBottom: 6 },
  fab: {
    position: 'absolute',
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabTexto: { color: '#fff', fontSize: 32, lineHeight: 34, fontWeight: '400' },
});
