# CTRL_Classes Sprint Plan

Baseado em `CTRL_Classes_FINAL_CONSOLIDATION.docx` e em `CTRL_Classes_Technical_Backlog.md`.

Objetivo:

- colocar a V1 em beta fechado em 8 semanas, sem contaminar o escopo com itens de V2/V3

Regra de governanca:

- se uma feature nao estiver explicitamente dentro da V1, ela nao entra no sprint
- se um ajuste comprometer tenancy, auth, billing ou schema, ele tem prioridade sobre refinamento visual

## Visao geral

Semana 1:

- fundacao do repositorio
- stack base
- i18n
- identidade base

Semana 2:

- Supabase
- auth
- onboarding inicial

Semana 3:

- schema SQL
- triggers
- RLS

Semana 4:

- students
- shell autenticado consolidado

Semana 5:

- schedules
- classes
- agenda base

Semana 6:

- attendance
- regras operacionais da aula

Semana 7:

- payments aluno -> professor
- subscriptions professor -> plataforma

Semana 8:

- dashboard
- settings
- hardening
- beta readiness

## Sprint 1

Objetivo:

- deixar o projeto bootstrapado e pronto para integrar backend real

Escopo:

1. Inicializar Next.js App Router com TypeScript strict.
2. Configurar Tailwind.
3. Inicializar shadcn/ui.
4. Instalar next-intl.
5. Instalar react-hook-form, zod, Supabase SDKs, Stripe SDK e Recharts.
6. Definir estrutura de pastas.
7. Configurar aliases.
8. Criar `.env.example`.
9. Criar `README.md` inicial.
10. Extrair tokens do branding.
11. Criar componente `Logo` com base no SVG existente.
12. Configurar locales `pt-BR`, `en-US`, `es-ES`.
13. Criar middleware de locale.

Entregaveis:

- app sobe localmente
- 3 idiomas configurados
- design tokens configurados
- logo provisoria operacional
- estrutura base pronta

Dependencias:

- nenhuma

Riscos:

- gastar tempo demais tentando resolver branding final
- criar estrutura de pastas sem relacao com os modulos reais

Mitigacao:

- usar o logo existente como provisiorio
- organizar por feature desde o inicio

Criterio de aceite:

- projeto roda
- locale switch funciona
- layout base simples renderiza

## Sprint 2

Objetivo:

- autenticar usuario real e abrir o caminho de onboarding

Escopo:

1. Criar projeto Supabase.
2. Configurar clients server/browser.
3. Implementar signup com email/senha.
4. Implementar login com email/senha.
5. Implementar login com Google.
6. Implementar logout.
7. Configurar sessao persistente.
8. Criar middleware para rotas autenticadas.
9. Criar telas de login, signup e callback.
10. Criar shell autenticado minimo.
11. Implementar onboarding inicial do partner.

Entregaveis:

- usuario cria conta
- usuario loga
- usuario conclui onboarding minimo

Dependencias:

- Sprint 1

Riscos:

- callbacks OAuth mal configurados
- sessao quebrada entre server e client

Mitigacao:

- validar auth via fluxo feliz e refresh de pagina
- testar login local antes de estilizar

Criterio de aceite:

- novo usuario entra no app via email/senha ou Google
- usuario autenticado acessa area privada
- usuario sem sessao e redirecionado

## Sprint 3

Objetivo:

- fechar o contrato de dados e isolamento multi-tenant

Escopo:

1. Criar migrations para as 9 tabelas.
2. Aplicar PKs, FKs, checks, enums e indices.
3. Criar triggers para `profiles` e `partners`.
4. Criar `audit_log` append-only.
5. Ativar RLS em todas as tabelas operacionais.
6. Criar policies por `partner_id`.
7. Criar helpers/funcoes SQL para contexto do tenant.
8. Validar signup real gerando `profiles` e `partners`.

Entregaveis:

- schema completo da V1
- RLS ativa
- signup cria tenant automaticamente

Dependencias:

- Sprint 2

Riscos:

- modelar errado `schedules` e `classes`
- policies permissivas demais

Mitigacao:

- seguir o consolidation literalmente
- testar tenant A vs tenant B manualmente

Criterio de aceite:

- migrations sobem do zero
- usuario autenticado ve so o proprio tenant

## Sprint 4

Objetivo:

- colocar o primeiro modulo de negocio de pe

Escopo:

1. Implementar modulo `students`.
2. Criar listagem de alunos.
3. Criar formulario de cadastro.
4. Criar formulario de edicao.
5. Implementar busca e filtros.
6. Persistir configuracoes financeiras por aluno.
7. Criar estados vazios e erros do modulo.
8. Refinar shell autenticado para navegacao principal.

Entregaveis:

- CRUD funcional de alunos
- listagem com leitura real do banco

Dependencias:

- Sprint 3

Riscos:

- tentar suportar cobrancas complexas cedo demais
- misturar estado de UI com regra de negocio

Mitigacao:

- manter V1 restrita ao que esta no documento
- validar tudo com Zod e constraints do banco

Criterio de aceite:

- professor consegue cadastrar, editar e visualizar alunos reais

## Sprint 5

Objetivo:

- transformar recorrencia em aulas operacionais visiveis

Escopo:

1. Implementar modulo `schedules`.
2. Implementar criacao de recorrencia semanal.
3. Implementar aulas avulsas.
4. Criar geracao de `classes`.
5. Implementar cancelamento individual.
6. Implementar cancelamento de futuras por `schedule_id`.
7. Criar agenda diaria e semanal base.
8. Respeitar timezone do partner.

Entregaveis:

- professor cria recorrencias
- aulas sao geradas
- agenda mostra dados reais

Dependencias:

- Sprint 4

Riscos:

- gerar classes em excesso
- bugs de timezone

Mitigacao:

- usar janela controlada de geracao
- testar com datas reais e comparacao visual

Criterio de aceite:

- agenda mostra aulas corretas por data
- cancelamento altera status esperado

## Sprint 6

Objetivo:

- fechar o fluxo operacional de presenca e conclusao de aula

Escopo:

1. Implementar modulo `attendance`.
2. Registrar presenca por aula.
3. Registrar presenca por aluno.
4. Suportar `present`, `absent`, `late`, `excused`.
5. Atualizar status da aula com base na presenca.
6. Suportar regra de aula em grupo.
7. Impedir duplicidade de presenca.
8. Exibir historico por aula.

Entregaveis:

- presenca funcional ponta a ponta
- status da aula coerente com regra de negocio

Dependencias:

- Sprint 5

Riscos:

- conflitar status de aula com status de presenca
- edge cases em aula em grupo

Mitigacao:

- manter estado da aula separado do estado da presenca
- validar fluxo individual e em grupo

Criterio de aceite:

- professor registra presenca real e o sistema reflete corretamente

## Sprint 7

Objetivo:

- fechar o financeiro da V1 e monetizacao da plataforma

Escopo:

1. Implementar modulo `payments` aluno -> professor.
2. Gerar cobrancas de acordo com as regras da V1.
3. Permitir marcacao manual como pago.
4. Suportar metodos de pagamento.
5. Calcular pendencias e vencimentos.
6. Integrar Stripe Checkout.
7. Integrar Customer Portal.
8. Criar webhook handler.
9. Sincronizar `subscriptions`.
10. Aplicar gating de trial/assinatura.

Entregaveis:

- financeiro manual da V1 funcional
- billing SaaS funcional

Dependencias:

- Sprint 6

Riscos:

- misturar cobranca do aluno com assinatura do professor
- falha de idempotencia em webhook

Mitigacao:

- separar claramente `payments` de `subscriptions`
- armazenar e tratar eventos Stripe de forma segura

Criterio de aceite:

- professor consegue registrar recebimentos
- professor consegue assinar a plataforma

## Sprint 8

Objetivo:

- consolidar leitura executiva, configuracoes e preparar beta fechado

Escopo:

1. Implementar dashboard operacional.
2. Implementar settings essenciais:
   - perfil
   - idioma
   - timezone
   - moeda
   - assinatura
3. Revisar loading, empty e error states.
4. Revisar i18n nas telas principais.
5. Revisar timezone e moeda.
6. Revisar RLS e seguranca basica.
7. Rodar fluxo de smoke test da V1.
8. Corrigir bugs criticos.
9. Preparar checklist de beta.

Entregaveis:

- V1 operacional pronta para beta fechado

Dependencias:

- Sprint 7

Riscos:

- usar a sprint final para adicionar feature em vez de estabilizar
- subestimar bugs de integracao entre modulos

Mitigacao:

- congelar escopo
- priorizar bugfix e confiabilidade

Criterio de aceite:

- produto pode ser usado por beta testers sem bloqueios criticos

## Metricas de acompanhamento por sprint

Toda sprint deve acompanhar:

1. build passando
2. migrations aplicando do zero
3. nenhuma regressao de auth
4. nenhum vazamento de tenant
5. fluxo principal do modulo funcionando ponta a ponta

## Definicao de pronto por modulo

Um modulo so conta como entregue quando tiver:

- schema validado
- integracao real com banco
- validacao client e server
- tratamento de erro
- loading state
- empty state
- locale aplicado
- acesso protegido por tenant

## Fora do sprint por padrao

Nao entra sem decisao formal:

- Stripe Connect
- reposicao automatica
- pacotes de aula
- notificacoes automativas
- dashboard GOD
- dark mode
- portal do aluno
- app nativo
- API publica
- multi-professor

## Riscos executivos principais

1. Expandir escopo cedo demais.
2. Adiar RLS ou testes de isolamento.
3. Modelar classes de forma errada.
4. Ignorar timezone.
5. Misturar financeiro do professor com billing do SaaS.
6. Tentar refinar marketing antes de fechar o core operacional.

## Conclusao

Se a ordem acima for respeitada, a V1 chega a beta de forma controlada.

Se a ordem for quebrada, o projeto tende a acumular retrabalho em auth, schema, agenda e billing.
