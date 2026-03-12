# Portal de Boletos White-Label - Pacote de Especificacao Tecnica

Este diretorio transforma o prompt inicial em uma base de documentacao pronta para descoberta, validacao tecnica e inicio de implementacao do MVP.

## Artefatos

- `PRD_E_ESPECIFICACAO.md`: visao de produto, escopo, requisitos funcionais e nao funcionais, regras de negocio e indicadores.
- `ARQUITETURA_TECNICA.md`: arquitetura recomendada para o MVP, modulos, seguranca, autenticacao local e caminho de migracao para Supabase.
- `API_CONTRATOS.md`: contratos iniciais de API para portal do cliente, painel interno, autenticacao, boletos, notificacoes e tickets.
- `FLUXOS_E_TELAS.md`: jornadas ponta a ponta, inventario de telas, estados e comportamento esperado por perfil.
- `MODELO_DE_DADOS.md`: entidades, relacionamentos, politicas multiempresa, indexes e regras de persistencia.
- `BACKLOG_E_PLANO.md`: backlog inicial em epicos e historias, criterios de aceite e sugestao de sprints.
- `schema.sql`: schema base em PostgreSQL para acelerar a fase de implementacao.

## Premissas de projeto adotadas

- O MVP sera um monolito modular web-first.
- O banco recomendado e PostgreSQL.
- O storage recomendado e S3 compativel com bucket privado.
- O canal inicial de notificacao e e-mail.
- A autenticacao do cliente final sera passwordless com OTP e link magico.
- A autenticacao interna sera local com senha, sessoes e reset controlado.
- A logica de identidade fica abstraida para permitir migracao futura para Supabase Auth.

## Ordem de leitura recomendada

1. `PRD_E_ESPECIFICACAO.md`
2. `ARQUITETURA_TECNICA.md`
3. `FLUXOS_E_TELAS.md`
4. `MODELO_DE_DADOS.md`
5. `API_CONTRATOS.md`
6. `BACKLOG_E_PLANO.md`
7. `schema.sql`

## Resultado esperado desta entrega

Com estes arquivos, o time ja consegue:

- validar o escopo do MVP;
- alinhar UX e operacao;
- discutir tecnologia e seguranca;
- iniciar modelagem e implementacao;
- quebrar trabalho em sprints e historias;
- preparar future-proofing para Supabase sem amarrar a regra de negocio ao provider.
