# CTRL_Classes Technical Backlog

Baseado principalmente em `CTRL_Classes_FINAL_CONSOLIDATION.docx`.

## Fonte de verdade

Hierarquia de referência do projeto:

1. `CTRL_Classes_FINAL_CONSOLIDATION.docx`
2. `CTRL_Classes_PreImpl_Executive_Summary.docx`
3. `CTRL_Classes_Business_Rules_V1.docx`
4. `CTRL_Classes_Architecture_Blueprint.docx`
5. `CTRL_Classes_Implementation_Playbook.docx`
6. `CTRL_Classes_Brand_Identity.jsx`
7. `CTRL_Classes_Full_Mockup.jsx`

Regra operacional:

- Se houver conflito entre documentos, `CTRL_Classes_FINAL_CONSOLIDATION.docx` prevalece.
- Se uma funcionalidade nao estiver explicitamente dentro da V1, ela fica fora por padrao.

## Estado consolidado em 2026-03-11

Entrega interna concluida nesta rodada:

- suite E2E estabilizada com cleanup de dados e helpers reutilizaveis
- filtros explicitos por `partner_id` reforcados em leituras criticas
- hardening de logs estruturados em actions principais
- coverage ampliada para timezone, recorrencia, overdue e helpers de agenda
- loading/error states da area privada alinhados ao locale atual
- consultas pesadas de recorrencias reduzidas
- calculo de mes e vencimento alinhado ao timezone do partner em dashboard e payments
- feedback visual de erro/aviso padronizado em forms e card de assinatura
- coverage negativa ampliada para redirect pos-auth e sincronizacao de webhook Stripe
- query sem uso removida do dashboard
- migration adicional para endurecer integridade multi-tenant entre entidades relacionadas no Postgres
- scripts `db:lint` e `db:reset` expostos no `package.json` para validacao local do schema

Riscos reduzidos:

- acumulacao de dados de teste no mesmo tenant
- leituras amplas demais em modulos operacionais
- flakes de navegacao em server actions do App Router
- erros server-side sem contexto suficiente para diagnostico

## Sequencia objetiva de execucao interna

Ordem recomendada a partir daqui:

1. revisar dashboard e payments para mais agregacoes server-side sem fan-out desnecessario
2. criar seed previsivel para E2E e, se possivel, usuario dedicado por ambiente
3. ampliar coverage de webhook Stripe e callbacks de auth com cenarios negativos
4. revisar feedback visual de erro/sucesso em forms de students, schedules, agenda e payments
5. revisar SQL local com `supabase db reset` e smoke multi-tenant manual
6. validar deploy readiness completo antes do beta externo

Checklist de continuidade sem depender de infraestrutura externa:

- consolidar mais helpers/fixtures para Playwright
- revisar dashboards com foco em consultas repetidas
- revisar mensagens de erro para ficarem consistentes entre locale, server action e UI
- manter qualquer nova query operacional com filtro explicito por `partner_id`
- continuar endurecendo testes em timezone e billing manual

## Principios de execucao

- Banco, auth e RLS sao parte do core do produto.
- Toda entidade operacional precisa carregar `partner_id`.
- UI nao pode definir regra de negocio sozinha.
- O mockup e referencia visual, nao arquitetura.
- i18n nasce no primeiro commit de aplicacao.
- Nao entrar em V2/V3 durante a implementacao da V1.

## Definicao de pronto para bootstrap

O projeto esta pronto para bootstrap quando existir:

- app Next.js rodando localmente
- TypeScript strict ativo
- Tailwind configurado
- shadcn/ui configurado
- next-intl configurado com 3 locales
- Supabase conectado
- auth funcional
- migrations versionadas
- RLS ativa nas tabelas operacionais
- layout autenticado minimo

## Stack fechada

- Frontend: Next.js 14+ App Router
- Linguagem: TypeScript strict
- UI: Tailwind + shadcn/ui
- i18n: next-intl 3.x
- Forms: react-hook-form + Zod
- Charts: Recharts
- Backend: Next.js API Routes + Supabase Edge Functions
- Banco: Supabase PostgreSQL 15+
- Auth: Supabase Auth
- Billing da plataforma: Stripe Checkout + Customer Portal
- Deploy: Vercel

## Dominio V1

Tabelas da V1:

1. `profiles`
2. `partners`
3. `subscriptions`
4. `students`
5. `schedules`
6. `classes`
7. `attendance`
8. `payments`
9. `audit_log`

Regras estruturais:

- `profiles.id = auth.users.id`
- `partners` e o centro gravitacional do tenant
- toda tabela operacional pertence a um `partner_id`
- `audit_log` e append-only
- `payments` aluno -> professor e manual na V1
- billing do professor -> plataforma usa Stripe

## O que nao bloqueia o inicio

- assets finais do logo
- favicon definitivo
- pecas de Canva
- landing page final
- materiais de marketing

## Ordem macro de implementacao

1. Fundacao do repositorio
2. Identidade base e design tokens
3. i18n e locale routing
4. Supabase e auth
5. Schema SQL
6. Triggers e funcoes de banco
7. RLS e policies
8. Shell autenticado e onboarding
9. Students
10. Schedules
11. Classes
12. Agenda
13. Attendance
14. Payments aluno -> professor
15. Subscriptions professor -> plataforma
16. Dashboard e Settings
17. Hardening para beta

## Fase 0: Fundacao do repositorio

Objetivo:

- criar uma base executavel, previsivel e limpa

Tarefas:

1. Inicializar app com Next.js App Router e TypeScript strict.
2. Configurar Tailwind.
3. Inicializar shadcn/ui.
4. Instalar next-intl.
5. Instalar react-hook-form, zod e resolvers.
6. Instalar SDKs do Supabase.
7. Instalar SDK do Stripe.
8. Instalar Recharts.
9. Configurar ESLint.
10. Configurar aliases de import.
11. Criar `.env.example`.
12. Criar `README.md`.
13. Definir convencoes de pastas e naming.

Estrutura sugerida:

- `src/app`
- `src/app/[locale]`
- `src/components/ui`
- `src/components/shared`
- `src/features/auth`
- `src/features/students`
- `src/features/classes`
- `src/features/schedules`
- `src/features/attendance`
- `src/features/payments`
- `src/features/settings`
- `src/features/dashboard`
- `src/lib`
- `src/lib/supabase`
- `src/lib/auth`
- `src/lib/i18n`
- `src/lib/validators`
- `src/lib/formatters`
- `src/lib/constants`
- `src/types`
- `src/messages`
- `supabase/migrations`
- `supabase/seed`

Critero de pronto:

- app sobe localmente
- lint passa
- estrutura existe

## Fase 1: Identidade base e design tokens

Objetivo:

- transformar o branding existente em base reutilizavel

Tarefas:

1. Extrair paleta de `CTRL_Classes_Brand_Identity.jsx`.
2. Criar tokens semanticos de cor.
3. Definir tipografia base.
4. Criar componente `Logo` reutilizavel com base no SVG atual.
5. Criar variantes do logo: `full`, `icon`, `light`, `dark`.
6. Definir escala de espacamento.
7. Definir radius e sombras.
8. Criar componentes compartilhados basicos.
9. Nao implementar dark mode.

Critero de pronto:

- logo provisoria operacional
- tokens aplicaveis em todo o app

## Fase 2: i18n e locale routing

Objetivo:

- evitar divida estrutural desde o inicio

Tarefas:

1. Configurar `pt-BR`, `en-US`, `es-ES`.
2. Definir locale default.
3. Criar middleware de locale.
4. Criar organizacao dos arquivos de mensagens.
5. Criar formatadores de data, hora e moeda.
6. Proibir strings hardcoded nas novas telas.
7. Criar locale switcher simples.

Critero de pronto:

- app navega entre 3 idiomas
- novas telas ja nascem localizaveis

## Fase 3: Supabase e auth

Objetivo:

- fechar identidade e sessao antes do dominio

Tarefas:

1. Criar projeto Supabase.
2. Configurar variaveis de ambiente.
3. Criar client server-side e client browser-side.
4. Implementar signup email/senha.
5. Implementar login email/senha.
6. Implementar login Google.
7. Implementar logout.
8. Persistir sessao.
9. Proteger rotas autenticadas.
10. Criar telas de login, signup e callback.

Critero de pronto:

- usuario cria conta, entra e sai
- rotas privadas estao protegidas

## Fase 4: Schema SQL

Objetivo:

- transformar a V1 em contrato real de dados

Tarefas:

1. Criar migrations para as 9 tabelas.
2. Definir PKs e FKs.
3. Definir enums/check constraints.
4. Aplicar `partner_id` nas tabelas operacionais.
5. Criar indices previstos.
6. Garantir colunas monetarias em centavos.
7. Garantir timestamps consistentes.
8. Versionar migrations pequenas e legiveis.

Pontos obrigatorios:

- `profiles.id = auth.users.id`
- `partners` 1:1 com `profiles`
- `attendance` unico por `class_id` + `student_id`
- `students.charge_no_show default true`
- `payments.amount_cents > 0`
- `audit_log` imutavel

Critero de pronto:

- schema sobe do zero via migrations

## Fase 5: Triggers e funcoes de banco

Objetivo:

- garantir invariantes no banco

Tarefas:

1. Trigger pos-signup para `profiles`.
2. Trigger pos-signup para `partners`.
3. Funcao utilitaria para recuperar `partner_id`.
4. Triggers de `audit_log`.
5. Bloqueio de update/delete em `audit_log`.
6. Timestamps automaticos onde necessario.

Critero de pronto:

- signup gera profile e partner automaticamente
- eventos relevantes ficam auditados

## Fase 6: RLS e policies

Objetivo:

- isolamento multi-tenant real

Tarefas:

1. Ativar RLS em tabelas operacionais.
2. Criar policies de select por `partner_id`.
3. Criar policies de insert por `partner_id`.
4. Criar policies de update por `partner_id`.
5. Criar policies de delete por `partner_id`.
6. Tratar excecoes server-only com cuidado.

Critero de pronto:

- tenant A nao acessa dados do tenant B

## Fase 7: Shell autenticado e onboarding

Objetivo:

- dar forma navegavel ao produto

Tarefas:

1. Criar layout autenticado.
2. Criar navegacao principal.
3. Criar homepage autenticada minima.
4. Implementar onboarding com:
   - nome comercial
   - telefone
   - timezone
   - idioma
   - moeda
   - tipo de aula
5. Persistir dados em `partners`.
6. Criar guard para onboarding incompleto.

Critero de pronto:

- novo usuario conclui onboarding e entra no app

## Fase 8: Students

Objetivo:

- primeiro CRUD real de negocio

Tarefas:

1. Listagem de alunos.
2. Cadastro de aluno.
3. Edicao de aluno.
4. Detalhe de aluno.
5. Filtros e busca.
6. Validacoes via Zod.
7. Persistir configuracoes de cobranca por aluno.

Campos e comportamento relevantes:

- nome
- contato
- `billing_type`
- `charge_no_show`
- moeda
- preco/referencia

Critero de pronto:

- professor gerencia alunos reais no banco

## Fase 9: Schedules

Objetivo:

- modelar recorrencia corretamente

Tarefas:

1. CRUD de `schedules`.
2. Permitir recorrencia semanal.
3. Vinculo opcional com aluno.
4. Validar dias, horario e duracao.

Critero de pronto:

- professor cria regras de recorrencia validas

## Fase 10: Classes

Objetivo:

- transformar recorrencia e aulas avulsas em instancias operacionais

Tarefas:

1. Gerar `classes` a partir de `schedules`.
2. Permitir aulas avulsas.
3. Implementar cancelamento individual.
4. Implementar cancelamento futuro por `schedule_id`.
5. Respeitar status da V1:
   - `scheduled`
   - `completed`
   - `cancelled`
   - `no_show`
6. Nao criar status `in_progress`.
7. Nao implementar reposicao automatica.

Critero de pronto:

- professor ve aulas reais geradas e consegue cancela-las

## Fase 11: Agenda

Objetivo:

- entregar modulo operacional do dia

Tarefas:

1. Visao diaria.
2. Visao semanal.
3. Navegacao por data.
4. Filtros por status.
5. Respeito ao timezone do partner.
6. Acesso ao detalhe da aula.

Critero de pronto:

- agenda funciona para operar o dia real do professor

## Fase 12: Attendance

Objetivo:

- aplicar regras de presenca por aula e por aluno

Tarefas:

1. Registrar presenca por aula.
2. Registrar presenca por aluno.
3. Suportar status:
   - `present`
   - `absent`
   - `late`
   - `excused`
4. Atualizar status da aula com base na presenca.
5. Em grupo, exigir registro individual.
6. Impedir duplicidade.

Critero de pronto:

- presenca altera corretamente o estado operacional da aula

## Fase 13: Payments aluno -> professor

Objetivo:

- implementar financeiro manual da V1

Tarefas:

1. Listar cobrancas.
2. Exibir detalhe da cobranca.
3. Gerar cobrancas automaticas quando a regra exigir.
4. Permitir marcacao manual como paga.
5. Suportar metodos:
   - `pix`
   - `cash`
   - `transfer`
   - `card`
   - `other`
6. Gerir:
   - `due_date`
   - `reference_month`
   - `paid_at`
7. Calcular pendentes, pagos e vencidos.
8. Respeitar `charge_no_show`.

Critero de pronto:

- professor controla cobrancas e recebimentos manualmente

## Fase 14: Subscriptions professor -> plataforma

Objetivo:

- monetizar o SaaS sem misturar com o financeiro do professor

Tarefas:

1. Implementar modelagem de `subscriptions`.
2. Definir trial.
3. Integrar Stripe Checkout.
4. Integrar Customer Portal.
5. Criar endpoint para iniciar checkout.
6. Criar webhook handler seguro.
7. Sincronizar estado Stripe -> banco.
8. Criar gating por trial/assinatura.
9. Tratar idempotencia.

Critero de pronto:

- professor consegue assinar o produto
- estado da assinatura fica consistente

## Fase 15: Dashboard e Settings

Objetivo:

- consolidar leitura executiva e administracao da conta

Dashboard:

- aulas de hoje
- alunos ativos
- pagamentos pendentes
- resumo semanal

Settings:

- perfil
- idioma
- timezone
- moeda
- assinatura

Critero de pronto:

- professor administra conta e entende o estado do negocio

## Fase 16: Hardening

Objetivo:

- sair de prototipo funcional para beta serio

Tarefas:

1. Revisar RLS.
2. Revisar validacoes server-side.
3. Revisar loading e error states.
4. Revisar locale formatting.
5. Revisar timezone edge cases.
6. Revisar webhooks Stripe.
7. Revisar migrations do zero.
8. Testar fluxos criticos ponta a ponta.

Fluxos criticos:

1. signup
2. login
3. onboarding
4. create/edit student
5. create schedule
6. class generation
7. cancel class
8. register attendance
9. settle payment
10. stripe checkout/webhook sync

Critero de pronto:

- produto apto para beta fechado

## Priorizacao

P0:

- scaffold
- i18n
- Supabase
- auth
- migrations
- triggers
- RLS
- onboarding
- students
- schedules
- classes

P1:

- agenda
- attendance
- payments
- subscriptions Stripe
- dashboard
- settings essenciais

P2:

- polish
- testes adicionais
- refinamentos de UX

## Fora da V1

- Stripe Connect
- reposicao automatica
- pacotes de aula
- notificacoes push/email
- dashboard GOD
- dark mode
- portal do aluno
- app nativo
- API publica
- multi-professor

## Estrategia de commits

Evitar commits gigantes. Preferir:

1. schema
2. integracao server
3. validators
4. queries/actions
5. UI leitura
6. UI escrita
7. edge cases

Exemplo de modulo:

- `feat: add students queries and validators`
- `feat: implement students list page`
- `feat: implement student create form`
- `feat: implement student edit flow`

## Riscos tecnicos principais

1. Modelar errado `schedules` vs `classes`.
2. Misturar billing SaaS com cobranca aluno -> professor.
3. Deixar i18n para depois.
4. Deixar timezone para depois.
5. Postergar RLS.
6. Contaminar a V1 com itens de V2/V3.
7. Tratar mockup como arquitetura final.

## Sequencia recomendada de execucao

1. Fundacao
2. Tokens e logo provisoria
3. i18n
4. Supabase/auth
5. schema
6. triggers/funcoes
7. RLS
8. shell/onboarding
9. students
10. schedules
11. classes
12. agenda
13. attendance
14. payments
15. subscriptions
16. dashboard/settings
17. hardening

## Conclusao operacional

O projeto ja esta suficientemente definido para sair da fase de analise e entrar em bootstrap tecnico.

O que falta agora nao e mais descoberta. E execucao disciplinada.
