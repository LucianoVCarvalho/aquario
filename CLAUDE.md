@AGENTS.md

# Aquário

App mobile (Expo SDK 57 + Expo Router, Android e iOS) para acompanhar testes da água de um aquário, com lembretes para refazer cada teste. Interface e código em português.

## Estrutura
- `src/app/` — telas: `index` (lista de parâmetros, pendentes primeiro), `parametro/[id]` (detalhe, gráfico, histórico), `parametro/editar` (criar/editar; `?id=` para editar), `medicao/[id]` (registrar teste), `configuracoes` (horário dos lembretes; botão "Ajustes" no cabeçalho da tela inicial).
- `src/lib/store.tsx` — estado global (Context) persistido em AsyncStorage (`aquario:dados:v1`); reagenda lembretes a cada alteração.
- `src/lib/notificacoes.ts` — notificações locais (expo-notifications), um lembrete por parâmetro com identificador `lembrete-<id>`, no dia do próximo teste, no `horario` global salvo no store (padrão `HORARIO_PADRAO` = 09:00; cálculo em `momentoLembrete`). Mudar o horário reagenda todos os lembretes.
- `src/lib/aquario.ts` — regras (próximo teste, situação ideal/abaixo/acima, formatação pt-BR, modelos de parâmetros).
- `src/components/ui.tsx`, `src/lib/tema.ts` — componentes e cores.

## Notas
- Parâmetros são totalmente personalizados (nome, unidade, frequência em dias, faixa ideal opcional).
- Validar com `npm test` (Jest + jest-expo; testes em `src/lib/__tests__/`), `npx expo lint`, `npx tsc --noEmit` e `npx expo export --platform android`.
- TypeScript 6 não inclui `@types/*` automaticamente: tipos globais ficam em `compilerOptions.types` (hoje `["jest"]`).
- Tipos de rota (`.expo/types/router.d.ts`) só são regenerados pelo `npx expo start`; após criar uma rota nova, rode-o antes do `tsc`.
- Ideias futuras: vários aquários, registro de trocas de água, exportar histórico, build via EAS.
