# Modelo de Dados

## 1. Visao geral

O modelo de dados foi desenhado para:

- suportar multiempresa;
- separar identidade interna e externa;
- armazenar historico e auditoria;
- manter trilha de extracao automatica;
- permitir migracao futura de provider de autenticacao.

## 2. Entidades principais

### 2.1 `companies_b`

Representa o tenant corporativo exibido ao cliente final.

Campos principais:

- identidade juridica;
- nome de exibicao;
- branding;
- contatos de suporte;
- status;
- timezone e locale recomendados;
- configuracoes de notificacao.

### 2.2 `end_customers`

Representa o usuario final vinculado a uma Empresa B.

Regras:

- `document_number` deve ser unico por empresa, nao globalmente;
- um cliente pode ter varios boletos;
- canal preferido e uma preferencia, nao garantia de entrega.

### 2.3 `billing_documents`

Entidade central de boletos.

Observacoes:

- `original_document_id` e `replaced_by_document_id` tratam substituicoes;
- `metadata_json` permite armazenar dados complementares sem quebrar schema;
- `file_hash` ajuda integridade e deduplicacao.

### 2.4 `document_extraction_runs`

Historico de execucoes do pipeline de extracao.

Boas praticas:

- manter `raw_text` para troubleshooting com politica de retencao;
- armazenar `extracted_json` e `validation_json` para analise posterior;
- registrar `review_required` e usuario revisor.

### 2.5 `document_notifications`

Historico de notificacoes por boleto.

Necessario para:

- reenvio;
- troubleshooting;
- metricas de entrega;
- auditoria de comunicacao.

### 2.6 `document_views`

Historico de acesso do cliente ao documento.

Eventos recomendados:

- `portal_view`;
- `pdf_download`;
- `digitable_line_copy`;
- `magic_link_open`.

### 2.7 `support_tickets`

Representa a solicitacao principal de ajuda.

Regras:

- nasce vinculada a boleto;
- `status` e `priority` controlam fila;
- `assigned_to_user_id` e opcional no momento da criacao.

### 2.8 `support_ticket_messages`

Mensagens e observacoes do ticket.

Campos recomendados alem da base:

- `author_type`;
- `author_end_customer_id` nullable;
- `visibility` para diferenciar mensagem interna e externa.

### 2.9 `internal_users`

Usuarios internos com provider de identidade desacoplado.

Campos importantes:

- `auth_provider`;
- `auth_subject_id`;
- `password_hash` nullable quando provider externo;
- `company_b_id` nullable para perfis globais.

### 2.10 `end_customer_access`

Camada de identidade do cliente final.

Uso:

- mapear provider atual;
- controlar ultimo login;
- preservar futura migracao para provider externo.

### 2.11 `auth_tokens`

OTP, magic links e reset tokens.

Regras:

- guardar somente hash;
- registrar expiracao e uso;
- permitir revogacao por status se necessario.

### 2.12 `audit_logs`

Tabela append-only para eventos criticos.

Recomendacao:

- particionar por data quando o volume crescer;
- definir politica de retencao e arquivamento.

## 3. Tabelas adicionais recomendadas

Para maior maturidade, considerar tambem:

- `internal_user_sessions`
- `customer_sessions`
- `email_templates`
- `branding_settings`
- `ticket_reason_catalog`
- `webhook_events` para futuro
- `integration_import_batches`

## 4. Relacionamentos

```text
companies_b 1---N end_customers
companies_b 1---N billing_documents
end_customers 1---N billing_documents
billing_documents 1---N document_extraction_runs
billing_documents 1---N document_notifications
billing_documents 1---N document_views
billing_documents 1---N support_tickets
support_tickets 1---N support_ticket_messages
internal_users 1---N billing_documents(created_by)
internal_users 1---N support_tickets(assigned_to)
```

## 5. Estados e enumeracoes sugeridas

### 5.1 `company_status`

- `active`
- `inactive`
- `suspended`

### 5.2 `customer_status`

- `active`
- `inactive`
- `blocked`

### 5.3 `document_status`

- `draft`
- `processing`
- `review_pending`
- `available`
- `viewed`
- `paid`
- `overdue`
- `cancelled`
- `replaced`

### 5.4 `extraction_status`

- `success`
- `partial`
- `failed`

### 5.5 `notification_status`

- `pending`
- `sent`
- `delivered`
- `failed`
- `opened`

### 5.6 `ticket_status`

- `open`
- `in_progress`
- `waiting_customer`
- `resolved`
- `closed`

## 6. Indices recomendados

- `companies_b(document_number)`
- `end_customers(company_b_id, document_number)` unique
- `end_customers(company_b_id, email)`
- `billing_documents(company_b_id, end_customer_id, due_date desc)`
- `billing_documents(status, due_date)`
- `billing_documents(document_reference)`
- `document_extraction_runs(billing_document_id, created_at desc)`
- `document_notifications(billing_document_id, created_at desc)`
- `document_views(billing_document_id, viewed_at desc)`
- `support_tickets(company_b_id, status, created_at desc)`
- `auth_tokens(end_customer_id, token_type, expires_at)`
- `audit_logs(entity_type, entity_id, created_at desc)`

## 7. Regras de integridade

- `billing_documents.company_b_id` deve coincidir com `end_customers.company_b_id`;
- `replaced_by_document_id` nao pode apontar para si mesmo;
- um boleto cancelado nao pode voltar a `available` sem novo evento de negocio;
- token consumido nao pode ser reutilizado;
- hard delete deve ser evitado em tabelas de negocio;
- auditoria deve ser append-only.

## 8. Politica de retencao recomendada

- `auth_tokens`: limpeza apos expiracao + janela curta de seguranca;
- `raw_text` de extracao: revisar necessidade regulatoria e operacao;
- `audit_logs`: reter conforme politica juridica e contratual;
- `document_views`: manter para metricas e prova de acesso.

## 9. Observacoes para Supabase futuro

- O schema em PostgreSQL continua valido.
- O que muda e o provider de identidade e talvez o mecanismo de sessao.
- `auth_provider` e `auth_subject_id` evitam migracoes destrutivas.
- Permissoes, papeis e escopo continuam no dominio da aplicacao.
