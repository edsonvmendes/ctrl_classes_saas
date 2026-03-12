# Contratos Iniciais de API

Os contratos abaixo usam REST JSON como base do MVP. Os nomes podem ser ajustados depois, mas a segmentacao funcional deve permanecer.

## 1. Convencoes

- Base URL sugerida: `/api/v1`
- Autenticacao interna: cookie de sessao ou bearer token interno
- Autenticacao cliente final: sessao curta apos OTP ou magic link
- Todas as respostas devem incluir `request_id`
- Datas em ISO 8601 UTC

## 2. Autenticacao interna

### `POST /auth/internal/login`

Request:

```json
{
  "email": "operador@empresa.com",
  "password": "senha"
}
```

Response:

```json
{
  "user": {
    "id": "usr_123",
    "name": "Maria",
    "role": "company_b_operator",
    "company_b_id": "cmp_123"
  },
  "session_expires_at": "2026-03-12T20:00:00Z",
  "request_id": "req_123"
}
```

### `POST /auth/internal/logout`

Invalida a sessao atual.

### `POST /auth/internal/forgot-password`

Solicita reset de senha para usuario interno.

### `POST /auth/internal/reset-password`

Confirma reset com token temporario.

## 3. Autenticacao cliente final

### `POST /auth/customer/request-access`

Uso por identificacao manual.

```json
{
  "document_number": "12345678900",
  "email": "cliente@exemplo.com"
}
```

Response:

```json
{
  "delivery_channel": "email",
  "expires_in_seconds": 600,
  "request_id": "req_123"
}
```

### `POST /auth/customer/verify-otp`

```json
{
  "document_number": "12345678900",
  "otp_code": "123456"
}
```

### `POST /auth/customer/magic-link/consume`

```json
{
  "token": "opaque_token"
}
```

## 4. Empresas B

### `GET /companies`

Lista empresas visiveis ao usuario.

### `POST /companies`

Cria empresa B.

### `GET /companies/{companyId}`

Retorna detalhe da empresa.

### `PATCH /companies/{companyId}`

Atualiza branding, suporte e status.

## 5. Clientes finais

### `GET /customers`

Filtros:

- `company_b_id`
- `status`
- `document_number`
- `email`

### `POST /customers`

```json
{
  "company_b_id": "cmp_123",
  "customer_type": "person",
  "full_name": "Joao da Silva",
  "document_number": "12345678900",
  "email": "joao@exemplo.com",
  "phone": "+5511999999999",
  "preferred_channel": "email"
}
```

### `GET /customers/{customerId}`

### `PATCH /customers/{customerId}`

## 6. Boletos

### `GET /documents`

Filtros principais:

- `company_b_id`
- `end_customer_id`
- `status`
- `extraction_status`
- `due_date_from`
- `due_date_to`
- `reference`

### `POST /documents`

Criacao manual com metadados principais.

```json
{
  "company_b_id": "cmp_123",
  "end_customer_id": "cus_123",
  "document_reference": "FAT-2026-0001",
  "amount": 189.9,
  "due_date": "2026-03-30",
  "bank_name": "Banco X",
  "digitable_line": "34191...."
}
```

### `POST /documents/upload`

`multipart/form-data` com:

- `company_b_id`
- `end_customer_id`
- `file`

Retorna ID do documento e status inicial da extracao.

### `GET /documents/{documentId}`

Detalhe interno com metadados, historico, notificacoes e extracao.

### `PATCH /documents/{documentId}`

Permite revisao de campos e atualizacao de status.

### `POST /documents/{documentId}/validate-extraction`

Confirma revisao operacional da extracao.

### `POST /documents/{documentId}/replace`

Cria relacao de substituicao entre boleto anterior e novo.

### `POST /documents/{documentId}/cancel`

Marca boleto como cancelado.

### `POST /documents/{documentId}/resend-notification`

Reenvia comunicacao ao cliente final.

### `GET /documents/{documentId}/download`

Retorna URL assinada curta ou stream seguro do PDF.

## 7. Extracao

### `GET /documents/{documentId}/extraction-runs`

Lista execucoes de extracao.

### `POST /documents/{documentId}/reprocess-extraction`

Permite reprocessamento manual.

## 8. Portal do cliente final

### `GET /customer-portal/me`

Retorna dados basicos do cliente autenticado e branding da empresa.

### `GET /customer-portal/documents`

Filtros:

- `status`
- `period_start`
- `period_end`

### `GET /customer-portal/documents/{documentId}`

Retorna detalhe simplificado do boleto.

### `POST /customer-portal/documents/{documentId}/copy-digitable-line`

Registra evento de copia e devolve a linha.

### `GET /customer-portal/documents/{documentId}/download`

Download seguro do PDF para cliente autenticado.

## 9. Tickets

### `POST /tickets`

```json
{
  "billing_document_id": "doc_123",
  "reason": "valor_divergente",
  "message": "O valor nao corresponde ao combinado."
}
```

### `GET /tickets`

No painel interno lista tickets por tenant e filtros.

### `GET /tickets/{ticketId}`

### `PATCH /tickets/{ticketId}`

Atualiza status, prioridade, responsavel e observacoes.

### `POST /tickets/{ticketId}/messages`

Adiciona mensagem interna ou externa conforme permissao.

## 10. Auditoria

### `GET /audit-logs`

Filtros:

- `entity_type`
- `entity_id`
- `user_type`
- `user_id`
- `company_b_id`
- `action`
- `created_at_from`
- `created_at_to`

## 11. Codigos de status sugeridos

- `200` leitura bem-sucedida
- `201` recurso criado
- `202` processamento assincrono iniciado
- `400` validacao falhou
- `401` nao autenticado
- `403` sem permissao
- `404` recurso nao encontrado no escopo do usuario
- `409` conflito de estado
- `422` regra de negocio invalida
- `429` rate limit

## 12. Erro padrao

```json
{
  "error": {
    "code": "DOCUMENT_NOT_AVAILABLE",
    "message": "O boleto ainda nao esta disponivel para consulta."
  },
  "request_id": "req_123"
}
```
