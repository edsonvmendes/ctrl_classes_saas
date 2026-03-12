# Arquitetura Tecnica - Portal de Boletos White-Label

## 1. Abordagem recomendada

Para o MVP, a recomendacao e um monolito modular com processamento assincrono para tarefas pesadas. Isso reduz custo cognitivo e operacional, sem bloquear evolucao futura para servicos separados.

## 2. Stack sugerida

Escolha recomendada para acelerar desenvolvimento com boa base para evolucao:

- Frontend web: Next.js ou React com SSR para portal do cliente e painel interno.
- Backend: Node.js com TypeScript e camadas bem separadas.
- Banco de dados: PostgreSQL.
- Storage privado: S3 compativel.
- Fila: Redis + worker ou Postgres job queue na primeira fase.
- OCR: Tesseract, OCRmyPDF ou provider externo plugavel.
- E-mail transacional: Resend, SendGrid, SES ou equivalente.

Esta stack e uma recomendacao, nao uma restricao. O ponto essencial e preservar as interfaces de dominio e autenticacao.

## 3. Componentes logicos

### 3.1 Aplicacao web

- Portal do cliente final.
- Painel interno.
- Camada BFF/API para ambos os frontends.

### 3.2 Modulos de dominio

- `auth`
- `tenancy`
- `companies`
- `customers`
- `documents`
- `extraction`
- `notifications`
- `tickets`
- `audit`
- `branding`

### 3.3 Processamento assincrono

- fila de extracao de metadados;
- fila de envio de notificacoes;
- tarefas de limpeza e expiracao de tokens;
- reprocessamento manual de falhas.

## 4. Diagrama textual de contexto

```text
Operador interno -> Painel -> API -> Banco
                              -> Storage privado
                              -> Fila de extracao -> Worker OCR/Parser
                              -> Fila de notificacao -> Provedor de e-mail

Cliente final -> Portal -> API -> Banco
                             -> Storage privado (link assinado)
```

## 5. Estrutura de camadas recomendada

### 5.1 Camada de apresentacao

- controllers, handlers ou route handlers;
- validacao de entrada;
- serializacao de resposta;
- enforcement de autenticacao e autorizacao.

### 5.2 Camada de aplicacao

- casos de uso;
- orquestracao de regras;
- transacoes;
- disparo de eventos internos.

### 5.3 Camada de dominio

- entidades;
- value objects;
- politicas de negocio;
- interfaces de repositorio;
- servicos de dominio.

### 5.4 Camada de infraestrutura

- ORM ou query builder;
- storage;
- envio de e-mail;
- OCR;
- hashing;
- observabilidade.

## 6. Multiempresa e isolamento de tenant

### 6.1 Modelo de tenancy

Tenant logico por `company_b_id`, com plataforma global acima disso.

### 6.2 Regras obrigatorias

- toda consulta de operador Empresa B deve ser filtrada por `company_b_id`;
- cliente final so pode acessar documentos vinculados ao seu `end_customer_id`;
- usuarios de plataforma podem operar cross-tenant com trilha reforcada;
- tokens, tickets e notificacoes devem carregar contexto do tenant.

### 6.3 Estrategia tecnica

- incluir `company_b_id` em entidades de negocio sempre que houver impacto de segregacao;
- centralizar filtros de tenancy em middleware e repositorios;
- ter testes de autorizacao por perfil e tenant.

## 7. Arquitetura de autenticacao

### 7.1 Objetivo

Entregar auth local no MVP sem acoplar o dominio ao provider.

### 7.2 Servicos recomendados

- `AuthService`: autentica usuario interno e cliente final.
- `SessionService`: cria, valida e revoga sessoes.
- `PasswordService`: hash, verificacao e politica de senha.
- `TokenService`: OTP, links magicos, expiracao e uso unico.
- `PermissionService`: RBAC e escopo por tenant.
- `IdentityProviderAdapter`: adaptador para `local` e futuro `supabase`.

### 7.3 Fluxo interno

1. Usuario envia e-mail e senha.
2. `AuthService` consulta identidade local.
3. `PasswordService` valida hash.
4. `SessionService` cria sessao com expiracao.
5. `PermissionService` resolve papeis e tenant.

### 7.4 Fluxo cliente final

1. Usuario informa documento + e-mail ou acessa link.
2. `TokenService` emite OTP ou valida magic link.
3. `AuthService` cria sessao curta vinculada ao `end_customer_id`.
4. `PermissionService` restringe acesso ao proprio conjunto de boletos.

### 7.5 Preparacao para Supabase

- manter `auth_provider` e `auth_subject_id` nas tabelas de identidade;
- persistir papeis e permissoes no proprio sistema;
- isolar criacao e validacao de sessao atras de interface;
- evitar espalhar chamadas a SDK do provider pelo codigo de negocio.

## 8. Processamento de extracao automatica

### 8.1 Pipeline recomendado

1. Upload do arquivo.
2. Validacao basica de tipo, tamanho e hash.
3. Tentativa de extracao textual do PDF.
4. Parsers por padrao de boleto.
5. Validacoes de consistencia.
6. Fallback para OCR se a extracao textual for insuficiente.
7. Consolidacao dos campos extraidos.
8. Persistencia do resultado e score de confianca.
9. Sinalizacao de `success`, `partial` ou `failed`.
10. Revisao manual obrigatoria quando necessario.

### 8.2 Campos alvo

- linha digitavel;
- codigo de barras;
- valor;
- vencimento;
- banco;
- cedente ou emissor;
- referencia;
- nome do pagador;
- qr code Pix ou payload quando presente.

### 8.3 Validacoes minimas

- formato valido da linha digitavel;
- coerencia entre linha digitavel e codigo de barras;
- valor maior que zero;
- vencimento parseavel;
- arquivo existente no storage;
- cliente vinculado.

### 8.4 Estrategia de confianca

Score entre 0 e 1 com pesos por campo critico. Exemplo:

- linha digitavel: 0,30
- valor: 0,20
- vencimento: 0,20
- banco: 0,10
- referencia: 0,10
- pagador e outros: 0,10

Sugestao:

- `>= 0.90`: sucesso sem bloqueio, mas ainda revisavel;
- `0.60 a 0.89`: parcial, exige revisao operacional;
- `< 0.60`: falha, exige correcao obrigatoria.

## 9. Notificacoes

### 9.1 Canal MVP

E-mail transacional com template por tenant.

### 9.2 Conteudo minimo

- nome da Empresa B;
- referencia do boleto;
- valor e vencimento;
- CTA para abrir portal;
- suporte da Empresa B;
- sem mencao a Empresa A.

### 9.3 Seguranca

- nao anexar PDF no e-mail por padrao;
- usar link temporario;
- registrar entrega, erro e clique.

## 10. Seguranca

### 10.1 Controles obrigatorios

- TLS em todas as rotas;
- Content Security Policy;
- protecao CSRF em sessoes baseadas em cookie;
- cookies `HttpOnly`, `Secure` e `SameSite`;
- rate limit por IP, identidade e tenant;
- WAF ou protecao equivalente em producao;
- validacao de MIME e antivirus em upload, quando possivel;
- assinatura temporaria para download;
- mascaramento parcial de documentos em logs.

### 10.2 Auditoria

Cada evento critico deve registrar:

- ator;
- tenant;
- entidade;
- acao;
- snapshot anterior e novo quando houver mudanca;
- IP;
- user-agent;
- timestamp.

## 11. Observabilidade e operacao

### 11.1 Logs

Logs estruturados com `request_id`, `tenant_id`, `user_id`, modulo e status.

### 11.2 Metricas

- boletos processados por dia;
- taxa de extracao completa;
- taxa de fallback OCR;
- tempo medio de extracao;
- notificacoes enviadas e falhas;
- autenticacoes bem-sucedidas e falhas;
- tickets abertos e backlog por status.

### 11.3 Alertas

- fila de extracao parada;
- taxa de falha de OCR acima do limite;
- taxa de falha de e-mail acima do limite;
- pico de tentativas de login.

## 12. Ambientes

- `local`: desenvolvimento com dados ficticios.
- `staging`: homologacao com provedores sandbox.
- `production`: ambiente isolado com storage e segredos dedicados.

## 13. Deploy e evolucao

### 13.1 MVP

Deploy unico da aplicacao web/API + worker separado.

### 13.2 Evolucao possivel

- separar worker de extracao;
- separar notificacoes;
- introduzir Supabase Auth sem mover dominio;
- adicionar API publica de ingestao;
- adicionar webhooks e sincronizacao externa.

## 14. Decisoes arquiteturais importantes

- Monolito modular primeiro, microservicos depois apenas se a carga justificar.
- OCR como adaptador plugavel.
- Auth e permissao separados.
- Dominios e queries sempre tenant-aware.
- Download sempre mediado por backend ou assinatura curta.
