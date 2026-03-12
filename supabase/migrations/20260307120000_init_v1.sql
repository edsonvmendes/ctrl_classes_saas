create extension if not exists pgcrypto;

create type public.app_role as enum ('god', 'teacher_admin', 'student');
create type public.subscription_provider as enum ('stripe');
create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid'
);
create type public.student_status as enum ('active', 'inactive', 'archived');
create type public.billing_type as enum ('monthly', 'per_class');
create type public.schedule_status as enum ('active', 'paused', 'ended');
create type public.class_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type public.class_source as enum ('schedule', 'manual');
create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');
create type public.payment_status as enum ('pending', 'paid', 'overdue', 'cancelled');
create type public.payment_method as enum ('pix', 'cash', 'transfer', 'card', 'other');
create type public.audit_action as enum ('insert', 'update', 'delete');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'teacher_admin',
  email text not null unique,
  full_name text not null check (char_length(trim(full_name)) >= 2),
  avatar_url text,
  phone text,
  locale text not null default 'pt-BR' check (locale in ('pt-BR', 'en-US', 'es-ES')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.partners (
  partner_id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) >= 2),
  legal_name text,
  phone text,
  locale text not null default 'pt-BR' check (locale in ('pt-BR', 'en-US', 'es-ES')),
  timezone text not null default 'America/Sao_Paulo',
  currency text not null default 'BRL' check (currency in ('BRL', 'USD', 'EUR')),
  teaching_mode text check (teaching_mode in ('individual', 'group', 'both')),
  class_mode text check (class_mode in ('online', 'in_person', 'both')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(partner_id) on delete cascade,
  provider public.subscription_provider not null default 'stripe',
  plan_code text not null default 'starter',
  status public.subscription_status not null default 'trialing',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  trial_ends_at timestamptz not null default timezone('utc', now()) + interval '30 days',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(partner_id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) >= 2),
  email text,
  phone text,
  notes text,
  status public.student_status not null default 'active',
  billing_type public.billing_type not null default 'monthly',
  monthly_amount_cents integer check (monthly_amount_cents is null or monthly_amount_cents > 0),
  class_rate_cents integer check (class_rate_cents is null or class_rate_cents > 0),
  billing_day_of_month smallint check (billing_day_of_month between 1 and 28),
  charge_no_show boolean not null default true,
  currency text not null default 'BRL' check (currency in ('BRL', 'USD', 'EUR')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(partner_id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  title text not null,
  subject text,
  timezone text not null,
  starts_at_time time not null,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 600),
  by_weekday smallint[] not null check (
    cardinality(by_weekday) > 0
    and by_weekday <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
  ),
  start_date date not null,
  end_date date,
  status public.schedule_status not null default 'active',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint schedules_date_range check (end_date is null or end_date >= start_date)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(partner_id) on delete cascade,
  schedule_id uuid references public.schedules(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  source public.class_source not null default 'schedule',
  title text not null,
  subject text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  status public.class_status not null default 'scheduled',
  cancelled_at timestamptz,
  cancelled_reason text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint classes_time_order check (ends_at > starts_at)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(partner_id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.attendance_status not null,
  notes text,
  recorded_at timestamptz not null default timezone('utc', now()),
  recorded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint attendance_unique_class_student unique (class_id, student_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(partner_id) on delete cascade,
  student_id uuid not null references public.students(id) on delete restrict,
  class_id uuid references public.classes(id) on delete set null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'BRL' check (currency in ('BRL', 'USD', 'EUR')),
  status public.payment_status not null default 'pending',
  method public.payment_method,
  due_date date not null,
  paid_at timestamptz,
  reference_month date not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payments_reference_month_first_day check (
    reference_month = date_trunc('month', reference_month)::date
  )
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(partner_id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  entity_name text not null,
  record_id uuid,
  action public.audit_action not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index subscriptions_partner_id_idx on public.subscriptions(partner_id);
create index subscriptions_status_idx on public.subscriptions(status);
create index students_partner_id_idx on public.students(partner_id);
create index students_status_idx on public.students(status);
create index students_billing_type_idx on public.students(billing_type);
create index schedules_partner_id_idx on public.schedules(partner_id);
create index schedules_student_id_idx on public.schedules(student_id);
create index schedules_status_idx on public.schedules(status);
create index classes_partner_id_idx on public.classes(partner_id);
create index classes_schedule_id_idx on public.classes(schedule_id);
create index classes_student_id_idx on public.classes(student_id);
create index classes_status_idx on public.classes(status);
create index classes_starts_at_idx on public.classes(starts_at);
create index attendance_partner_id_idx on public.attendance(partner_id);
create index attendance_class_id_idx on public.attendance(class_id);
create index attendance_student_id_idx on public.attendance(student_id);
create index payments_partner_id_idx on public.payments(partner_id);
create index payments_student_id_idx on public.payments(student_id);
create index payments_status_idx on public.payments(status);
create index payments_due_date_idx on public.payments(due_date);
create index audit_log_partner_id_idx on public.audit_log(partner_id);
create index audit_log_entity_name_idx on public.audit_log(entity_name);
create index audit_log_created_at_idx on public.audit_log(created_at desc);

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.current_partner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.partner_id
  from public.partners p
  where p.user_id = auth.uid();
$$;

create or replace function public.is_god()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'god', false);
$$;

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log is append-only';
end;
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  audit_partner_id uuid;
  audit_record_id uuid;
  audit_payload jsonb;
begin
  audit_partner_id := coalesce(
    (to_jsonb(new) ->> 'partner_id')::uuid,
    (to_jsonb(old) ->> 'partner_id')::uuid,
    case when tg_table_name = 'partners' then coalesce(new.partner_id, old.partner_id) end
  );

  audit_record_id := coalesce(
    (to_jsonb(new) ->> 'id')::uuid,
    (to_jsonb(old) ->> 'id')::uuid,
    case when tg_table_name = 'partners' then coalesce(new.partner_id, old.partner_id) end
  );

  audit_payload := jsonb_build_object(
    'table', tg_table_name,
    'old', to_jsonb(old),
    'new', to_jsonb(new)
  );

  insert into public.audit_log (
    partner_id,
    actor_user_id,
    entity_name,
    record_id,
    action,
    payload
  )
  values (
    audit_partner_id,
    auth.uid(),
    tg_table_name,
    audit_record_id,
    lower(tg_op)::public.audit_action,
    audit_payload
  );

  return coalesce(new, old);
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_partner_id uuid;
  new_email text;
  new_full_name text;
begin
  new_email := coalesce(new.email, '');
  new_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new_email, '@', 1), 'New User');

  insert into public.profiles (
    id,
    role,
    email,
    full_name
  )
  values (
    new.id,
    'teacher_admin',
    new_email,
    new_full_name
  );

  insert into public.partners (
    user_id,
    display_name,
    locale,
    timezone,
    currency
  )
  values (
    new.id,
    new_full_name,
    'pt-BR',
    'America/Sao_Paulo',
    'BRL'
  )
  returning partner_id into new_partner_id;

  insert into public.subscriptions (
    partner_id,
    provider,
    plan_code,
    status
  )
  values (
    new_partner_id,
    'stripe',
    'starter',
    'trialing'
  );

  return new;
end;
$$;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email,
      updated_at = timezone('utc', now())
  where id = new.id
    and new.email is distinct from old.email;

  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_partners_updated_at
before update on public.partners
for each row
execute function public.set_updated_at();

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

create trigger set_students_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

create trigger set_schedules_updated_at
before update on public.schedules
for each row
execute function public.set_updated_at();

create trigger set_classes_updated_at
before update on public.classes
for each row
execute function public.set_updated_at();

create trigger set_attendance_updated_at
before update on public.attendance
for each row
execute function public.set_updated_at();

create trigger set_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create trigger on_auth_user_updated
after update of email on auth.users
for each row
execute function public.sync_profile_email();

create trigger prevent_audit_log_update
before update on public.audit_log
for each row
execute function public.prevent_audit_log_mutation();

create trigger prevent_audit_log_delete
before delete on public.audit_log
for each row
execute function public.prevent_audit_log_mutation();

create trigger audit_partners_changes
after insert or update or delete on public.partners
for each row
execute function public.write_audit_log();

create trigger audit_subscriptions_changes
after insert or update or delete on public.subscriptions
for each row
execute function public.write_audit_log();

create trigger audit_students_changes
after insert or update or delete on public.students
for each row
execute function public.write_audit_log();

create trigger audit_schedules_changes
after insert or update or delete on public.schedules
for each row
execute function public.write_audit_log();

create trigger audit_classes_changes
after insert or update or delete on public.classes
for each row
execute function public.write_audit_log();

create trigger audit_attendance_changes
after insert or update or delete on public.attendance
for each row
execute function public.write_audit_log();

create trigger audit_payments_changes
after insert or update or delete on public.payments
for each row
execute function public.write_audit_log();

alter table public.profiles enable row level security;
alter table public.partners enable row level security;
alter table public.subscriptions enable row level security;
alter table public.students enable row level security;
alter table public.schedules enable row level security;
alter table public.classes enable row level security;
alter table public.attendance enable row level security;
alter table public.payments enable row level security;
alter table public.audit_log enable row level security;

create policy "profiles_select_own_or_god"
on public.profiles
for select
using (id = auth.uid() or public.is_god());

create policy "profiles_update_own_or_god"
on public.profiles
for update
using (id = auth.uid() or public.is_god())
with check (id = auth.uid() or public.is_god());

create policy "partners_select_own_or_god"
on public.partners
for select
using (user_id = auth.uid() or public.is_god());

create policy "partners_update_own_or_god"
on public.partners
for update
using (user_id = auth.uid() or public.is_god())
with check (user_id = auth.uid() or public.is_god());

create policy "subscriptions_select_by_partner"
on public.subscriptions
for select
using (partner_id = public.current_partner_id() or public.is_god());

create policy "subscriptions_insert_by_partner"
on public.subscriptions
for insert
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "subscriptions_update_by_partner"
on public.subscriptions
for update
using (partner_id = public.current_partner_id() or public.is_god())
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "students_select_by_partner"
on public.students
for select
using (partner_id = public.current_partner_id() or public.is_god());

create policy "students_insert_by_partner"
on public.students
for insert
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "students_update_by_partner"
on public.students
for update
using (partner_id = public.current_partner_id() or public.is_god())
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "students_delete_by_partner"
on public.students
for delete
using (partner_id = public.current_partner_id() or public.is_god());

create policy "schedules_select_by_partner"
on public.schedules
for select
using (partner_id = public.current_partner_id() or public.is_god());

create policy "schedules_insert_by_partner"
on public.schedules
for insert
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "schedules_update_by_partner"
on public.schedules
for update
using (partner_id = public.current_partner_id() or public.is_god())
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "schedules_delete_by_partner"
on public.schedules
for delete
using (partner_id = public.current_partner_id() or public.is_god());

create policy "classes_select_by_partner"
on public.classes
for select
using (partner_id = public.current_partner_id() or public.is_god());

create policy "classes_insert_by_partner"
on public.classes
for insert
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "classes_update_by_partner"
on public.classes
for update
using (partner_id = public.current_partner_id() or public.is_god())
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "classes_delete_by_partner"
on public.classes
for delete
using (partner_id = public.current_partner_id() or public.is_god());

create policy "attendance_select_by_partner"
on public.attendance
for select
using (partner_id = public.current_partner_id() or public.is_god());

create policy "attendance_insert_by_partner"
on public.attendance
for insert
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "attendance_update_by_partner"
on public.attendance
for update
using (partner_id = public.current_partner_id() or public.is_god())
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "attendance_delete_by_partner"
on public.attendance
for delete
using (partner_id = public.current_partner_id() or public.is_god());

create policy "payments_select_by_partner"
on public.payments
for select
using (partner_id = public.current_partner_id() or public.is_god());

create policy "payments_insert_by_partner"
on public.payments
for insert
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "payments_update_by_partner"
on public.payments
for update
using (partner_id = public.current_partner_id() or public.is_god())
with check (partner_id = public.current_partner_id() or public.is_god());

create policy "payments_delete_by_partner"
on public.payments
for delete
using (partner_id = public.current_partner_id() or public.is_god());

create policy "audit_log_select_by_partner"
on public.audit_log
for select
using (partner_id = public.current_partner_id() or public.is_god());

comment on table public.profiles is 'User identity extension mapped 1:1 to auth.users.';
comment on table public.partners is 'Teacher tenant and gravitational center for all operational data.';
comment on table public.subscriptions is 'Platform billing state for partner -> CTRL_Classes.';
comment on table public.students is 'Partner students with billing preferences.';
comment on table public.schedules is 'Recurring scheduling rules.';
comment on table public.classes is 'Individual class instances generated from schedules or created manually.';
comment on table public.attendance is 'Attendance status per class and per student.';
comment on table public.payments is 'Manual billing register for student -> teacher in V1.';
comment on table public.audit_log is 'Append-only audit trail.';
