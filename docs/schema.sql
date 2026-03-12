-- Schema inicial recomendado para PostgreSQL

create extension if not exists pgcrypto;

create type company_status as enum ('active', 'inactive', 'suspended');
create type customer_type as enum ('person', 'company');
create type customer_status as enum ('active', 'inactive', 'blocked');
create type auth_provider as enum ('local', 'supabase');
create type internal_role as enum (
  'platform_admin',
  'company_a_operator',
  'company_b_admin',
  'company_b_operator'
);
create type document_status as enum (
  'draft',
  'processing',
  'review_pending',
  'available',
  'viewed',
  'paid',
  'overdue',
  'cancelled',
  'replaced'
);
create type source_type as enum ('manual', 'pdf_upload', 'csv_import', 'api');
create type extraction_status as enum ('success', 'partial', 'failed');
create type extraction_method as enum ('text_parse', 'ocr', 'hybrid');
create type channel_type as enum ('email', 'sms', 'whatsapp');
create type notification_status as enum ('pending', 'sent', 'delivered', 'failed', 'opened');
create type ticket_status as enum ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type token_type as enum ('customer_otp', 'magic_link', 'password_reset');
create type actor_type as enum ('internal_user', 'end_customer', 'system');

create table companies_b (
  id uuid primary key default gen_random_uuid(),
  legal_name varchar(255) not null,
  trade_name varchar(255),
  document_number varchar(32) not null unique,
  brand_name varchar(255) not null,
  logo_url text,
  primary_color varchar(32),
  support_email varchar(255),
  support_phone varchar(32),
  timezone varchar(64) not null default 'America/Sao_Paulo',
  locale varchar(16) not null default 'pt-BR',
  notification_settings_json jsonb not null default '{}'::jsonb,
  status company_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table end_customers (
  id uuid primary key default gen_random_uuid(),
  company_b_id uuid not null references companies_b(id),
  customer_type customer_type not null,
  full_name varchar(255) not null,
  document_number varchar(32) not null,
  email varchar(255),
  phone varchar(32),
  preferred_channel channel_type not null default 'email',
  status customer_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_b_id, document_number)
);

create table internal_users (
  id uuid primary key default gen_random_uuid(),
  company_b_id uuid references companies_b(id),
  name varchar(255) not null,
  email varchar(255) not null unique,
  role internal_role not null,
  status customer_status not null default 'active',
  auth_provider auth_provider not null default 'local',
  auth_subject_id varchar(255),
  password_hash text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table end_customer_access (
  id uuid primary key default gen_random_uuid(),
  end_customer_id uuid not null unique references end_customers(id),
  auth_provider auth_provider not null default 'local',
  auth_subject_id varchar(255),
  last_login_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table billing_documents (
  id uuid primary key default gen_random_uuid(),
  company_b_id uuid not null references companies_b(id),
  end_customer_id uuid not null references end_customers(id),
  external_document_id varchar(255),
  document_reference varchar(255) not null,
  bank_name varchar(255),
  issuer_name varchar(255),
  amount numeric(14,2),
  issue_date date,
  due_date date,
  barcode varchar(255),
  digitable_line varchar(255),
  pix_qr_code text,
  pdf_storage_key text not null,
  file_hash varchar(128) not null,
  status document_status not null default 'processing',
  source_type source_type not null default 'pdf_upload',
  original_document_id uuid references billing_documents(id),
  replaced_by_document_id uuid references billing_documents(id),
  metadata_json jsonb not null default '{}'::jsonb,
  created_by_user_id uuid references internal_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_documents_not_self_replace check (id is distinct from replaced_by_document_id)
);

create table document_extraction_runs (
  id uuid primary key default gen_random_uuid(),
  billing_document_id uuid not null references billing_documents(id) on delete cascade,
  extraction_status extraction_status not null,
  extraction_method extraction_method not null,
  confidence_score numeric(5,4) not null default 0,
  raw_text text,
  extracted_json jsonb not null default '{}'::jsonb,
  validation_json jsonb not null default '{}'::jsonb,
  review_required boolean not null default false,
  reviewed_by_user_id uuid references internal_users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table document_notifications (
  id uuid primary key default gen_random_uuid(),
  billing_document_id uuid not null references billing_documents(id) on delete cascade,
  channel channel_type not null,
  recipient varchar(255) not null,
  message_template varchar(255),
  sent_at timestamptz,
  delivery_status notification_status not null default 'pending',
  provider_response jsonb,
  created_at timestamptz not null default now()
);

create table document_views (
  id uuid primary key default gen_random_uuid(),
  billing_document_id uuid not null references billing_documents(id) on delete cascade,
  end_customer_id uuid not null references end_customers(id),
  viewed_at timestamptz not null default now(),
  ip_address inet,
  device_info text,
  action_type varchar(64) not null
);

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  company_b_id uuid not null references companies_b(id),
  end_customer_id uuid not null references end_customers(id),
  billing_document_id uuid not null references billing_documents(id),
  reason varchar(100) not null,
  message text,
  status ticket_status not null default 'open',
  priority ticket_priority not null default 'medium',
  assigned_to_user_id uuid references internal_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  author_user_id uuid references internal_users(id),
  author_end_customer_id uuid references end_customers(id),
  is_internal boolean not null default false,
  message text not null,
  created_at timestamptz not null default now(),
  constraint support_ticket_messages_has_author check (
    author_user_id is not null or author_end_customer_id is not null
  )
);

create table auth_tokens (
  id uuid primary key default gen_random_uuid(),
  end_customer_id uuid references end_customers(id),
  internal_user_id uuid references internal_users(id),
  token_hash varchar(255) not null,
  token_type token_type not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_type actor_type not null,
  user_id uuid,
  company_b_id uuid references companies_b(id),
  entity_type varchar(100) not null,
  entity_id uuid,
  action varchar(100) not null,
  old_value_json jsonb,
  new_value_json jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_end_customers_company_document
  on end_customers(company_b_id, document_number);

create index idx_end_customers_company_email
  on end_customers(company_b_id, email);

create index idx_internal_users_company_role
  on internal_users(company_b_id, role);

create index idx_billing_documents_company_customer_due
  on billing_documents(company_b_id, end_customer_id, due_date desc);

create index idx_billing_documents_status_due
  on billing_documents(status, due_date);

create index idx_billing_documents_reference
  on billing_documents(document_reference);

create index idx_document_extraction_runs_document_created
  on document_extraction_runs(billing_document_id, created_at desc);

create index idx_document_notifications_document_created
  on document_notifications(billing_document_id, created_at desc);

create index idx_document_views_document_viewed
  on document_views(billing_document_id, viewed_at desc);

create index idx_support_tickets_company_status_created
  on support_tickets(company_b_id, status, created_at desc);

create index idx_auth_tokens_customer_type_expires
  on auth_tokens(end_customer_id, token_type, expires_at);

create index idx_audit_logs_entity_created
  on audit_logs(entity_type, entity_id, created_at desc);
