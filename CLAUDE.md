@AGENTS.md

# Aquário

App mobile (Expo SDK 57 + Expo Router, Android e iOS) para acompanhar testes da água de um aquário, com lembretes para refazer cada teste. Interface e código em português.

## Estrutura
- `src/app/` — telas: `index` (lista de parâmetros, pendentes primeiro), `parametro/[id]` (detalhe, gráfico, histórico), `parametro/editar` (criar/editar; `?id=` para editar), `medicao/[id]` (registrar teste).
- `src/lib/store.tsx` — estado global (Context) persistido em AsyncStorage (`aquario:dados:v1`); reagenda lembretes a cada alteração.
- `src/lib/notificacoes.ts` — notificações locais (expo-notifications), um lembrete por parâmetro com identificador `lembrete-<id>`, às `HORA_LEMBRETE` (9h) do dia do próximo teste.
- `src/lib/aquario.ts` — regras (próximo teste, situação ideal/abaixo/acima, formatação pt-BR, modelos de parâmetros).
- `src/components/ui.tsx`, `src/lib/tema.ts` — componentes e cores.

## Notas
- Parâmetros são totalmente personalizados (nome, unidade, frequência em dias, faixa ideal opcional).
- `npx expo lint` falha ao instalar o ESLint (conflito de peer deps do template); validar com `npx tsc --noEmit` e `npx expo export --platform android`.
- Ideias futuras: horário do lembrete configurável, vários aquários, registro de trocas de água, exportar histórico, build via EAS.
