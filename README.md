# CTRL_Classes SaaS

Aplicacao base da V1 do CTRL_Classes.

Este repositorio foi bootstrapado a partir dos documentos de consolidacao do projeto e segue a seguinte hierarquia de verdade:

1. `CTRL_Classes_FINAL_CONSOLIDATION.docx`
2. `CTRL_Classes_PreImpl_Executive_Summary.docx`
3. `CTRL_Classes_Business_Rules_V1.docx`
4. `CTRL_Classes_Architecture_Blueprint.docx`
5. `CTRL_Classes_Implementation_Playbook.docx`
6. `CTRL_Classes_Brand_Identity.jsx`
7. `CTRL_Classes_Full_Mockup.jsx`

## Stack base

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- shadcn/ui foundation
- next-intl
- Supabase-ready
- Stripe-ready

## Estrutura

- `src/app`: rotas do App Router
- `src/components`: componentes compartilhados
- `src/features`: modulos por dominio
- `src/i18n`: configuracao de locales
- `src/lib`: utilitarios, integracoes e constantes
- `src/messages`: mensagens de traducao
- `supabase/migrations`: migrations SQL
- `supabase/seed`: seeds e apoio local

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run build
npm run readiness
npm run test
npm run test:e2e
npm run db:lint
```

Para os cenarios autenticados do Playwright, defina no `.env.local`:

```bash
E2E_TEST_EMAIL=
E2E_TEST_PASSWORD=
```

## Ambiente

Variaveis esperadas em `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_STARTER_PRICE_ID=
E2E_TEST_EMAIL=
E2E_TEST_PASSWORD=
```

Observacoes de billing local:

- `STRIPE_STARTER_PRICE_ID` ja deve apontar para um `price_...` valido
- o webhook local da Stripe precisa ser encaminhado via Stripe CLI
- comando esperado:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Healthcheck

Endpoint de verificacao rapida:

```bash
GET /api/health
```

Resposta esperada:

```json
{
  "service": "ctrl-classes-saas",
  "status": "ok",
  "timestamp": "2026-03-09T00:00:00.000Z"
}
```

## Supabase local

Comandos principais:

```bash
npx supabase start
npx supabase db lint
npx supabase db reset
```

Observacoes:

- as migrations ficam em `supabase/migrations`
- o seed base fica em `supabase/seed.sql`
- `supabase/config.toml` foi alinhado ao projeto e ao fluxo local de auth
- para validar SQL com `db lint`, o ambiente local do Supabase precisa estar ativo
- o projeto agora reforca integridade multi-tenant no proprio banco para `schedules`, `classes`, `attendance` e `payments`

## Estado atual

Base atual:

- auth, bootstrap de tenant e RLS ativos
- alunos, recorrencias, agenda, presenca e pagamentos implementados
- billing SaaS preparado com Stripe
- dashboard, settings e onboarding persistente ativos
- Playwright cobrindo fluxos publicos e autenticados
- CI basica para lint, test e build em `.github/workflows/ci.yml`

## Readiness de beta

- preencher `STRIPE_WEBHOOK_SECRET` e validar checkout + webhook ponta a ponta
- revisar deploy em Vercel com variaveis de ambiente completas
- validar URLs de auth e OAuth no Supabase/Google
- revisar logs e monitoramento antes de abrir para beta externo

## Checklist operacional de beta

Infra e deploy:

- configurar `NEXT_PUBLIC_APP_URL` com a URL final da Vercel
- preencher `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`
- preencher `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_STARTER_PRICE_ID` e `STRIPE_WEBHOOK_SECRET`

Auth:

- cadastrar a URL final da Vercel em `Authentication > URL Configuration` no Supabase
- revisar a callback `/auth/callback`
- validar `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` e `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`
- conferir URLs autorizadas no Google OAuth

Billing:

- executar um checkout real do plano starter
- validar retorno em `/${locale}/settings?billing=success`
- disparar um webhook real e confirmar sync em `/api/stripe/webhook`
- conferir atualizacao de status em `subscriptions`

Observabilidade:

- usar `GET /api/health` para verificar readiness de ambiente sem expor segredos
- usar `npm run readiness` para listar URLs esperadas de Supabase, Google OAuth e Stripe antes do deploy
- acompanhar `x-ctrl-request-id` nas respostas de `health`, `auth/callback` e `stripe/webhook` para correlacionar logs
- revisar logs do webhook Stripe antes de abrir o beta
