# Aquário 🐠

App mobile para acompanhar os testes da água do seu aquário e lembrar quando é hora de refazer cada um.

Feito com [Expo](https://expo.dev) (SDK 57) e [Expo Router](https://docs.expo.dev/router/introduction/), para Android e iOS (também roda na web, sem lembretes).

## Funcionalidades

- **Parâmetros personalizados** — crie os testes que você faz (pH, amônia, nitrito, nitrato, KH, GH, temperatura…) com nome, unidade, frequência em dias e faixa ideal opcional.
- **Registro de testes** — anote o valor, a data e uma observação. Cada valor é classificado como *ideal*, *abaixo* ou *acima* da faixa.
- **Histórico e gráfico** — veja a evolução de cada parâmetro ao longo do tempo.
- **Pendentes primeiro** — a tela inicial mostra no topo os testes atrasados ou do dia.
- **Lembretes** — notificação local às 9h no dia do próximo teste de cada parâmetro (pode ser desativada por parâmetro).
- **Dados no aparelho** — tudo fica salvo localmente (AsyncStorage); não há conta nem servidor.

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) LTS e, para testar no celular, o app [Expo Go](https://expo.dev/go).

```bash
npm install
npx expo start
```

No terminal do Expo:

- escaneie o QR code com o Expo Go (Android) ou a câmera (iOS);
- `a` abre no emulador Android, `i` no simulador iOS;
- `w` abre no navegador.

Se o bundler mostrar erros estranhos de módulo não encontrado após instalar pacotes, reinicie limpando o cache:

```bash
npx expo start --clear
```

### Lembretes

As notificações só funcionam em aparelho físico e não funcionam na web. Se não aparecerem no Expo Go, gere uma build de desenvolvimento:

```bash
npx eas-cli@latest build --profile development
# ou, com Android Studio / Xcode instalados:
npx expo run:android
npx expo run:ios
```

## Verificação

```bash
npx tsc --noEmit                       # checagem de tipos
npx expo export --platform android     # garante que o bundle compila
```

> `npx expo lint` ainda não funciona: a instalação do ESLint esbarra num conflito de dependências do template.

## Estrutura

```
src/
├── app/                      # telas (Expo Router)
│   ├── _layout.tsx           # navegação em pilha, provider e permissão de notificações
│   ├── index.tsx             # lista de parâmetros (pendentes primeiro)
│   ├── parametro/[id].tsx    # detalhe: gráfico e histórico
│   ├── parametro/editar.tsx  # criar/editar parâmetro (?id= para editar)
│   └── medicao/[id].tsx      # registrar um teste
├── components/ui.tsx         # componentes visuais
└── lib/
    ├── aquario.ts            # regras: próximo teste, situação, formatação pt-BR
    ├── notificacoes.ts       # agendamento dos lembretes (expo-notifications)
    ├── store.tsx             # estado global persistido em AsyncStorage
    ├── tema.ts               # cores
    └── types.ts              # tipos Parametro e Medicao
```

Para instalar novas dependências, use sempre `npx expo install <pacote>` para obter versões compatíveis com o SDK.

## Próximos passos

- Horário do lembrete configurável
- Vários aquários
- Registro de trocas de água
- Exportar o histórico
- Build e publicação via EAS

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE).
