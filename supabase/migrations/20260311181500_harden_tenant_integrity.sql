create or replace function public.enforce_same_partner(
  owner_partner_id uuid,
  related_partner_id uuid,
  relation_name text
)
returns void
language plpgsql
as $$
begin
  if related_partner_id is null then
    raise exception '% partner could not be resolved', relation_name;
  end if;

  if owner_partner_id <> related_partner_id then
    raise exception '% must belong to the same partner', relation_name;
  end if;
end;
$$;

create or replace function public.validate_schedule_partner_integrity()
returns trigger
language plpgsql
as $$
declare
  student_partner_id uuid;
begin
  if new.student_id is null then
    return new;
  end if;

  select s.partner_id
  into student_partner_id
  from public.students s
  where s.id = new.student_id;

  perform public.enforce_same_partner(new.partner_id, student_partner_id, 'schedule.student_id');

  return new;
end;
$$;

create or replace function public.validate_class_partner_integrity()
returns trigger
language plpgsql
as $$
declare
  schedule_partner_id uuid;
  schedule_student_id uuid;
  student_partner_id uuid;
begin
  if new.schedule_id is not null then
    select s.partner_id, s.student_id
    into schedule_partner_id, schedule_student_id
    from public.schedules s
    where s.id = new.schedule_id;

    perform public.enforce_same_partner(new.partner_id, schedule_partner_id, 'class.schedule_id');

    if schedule_student_id is not null
      and new.student_id is not null
      and schedule_student_id <> new.student_id then
      raise exception 'class.student_id must match schedule.student_id when the schedule is linked to a student';
    end if;
  end if;

  if new.student_id is not null then
    select s.partner_id
    into student_partner_id
    from public.students s
    where s.id = new.student_id;

    perform public.enforce_same_partner(new.partner_id, student_partner_id, 'class.student_id');
  end if;

  return new;
end;
$$;

create or replace function public.validate_attendance_partner_integrity()
returns trigger
language plpgsql
as $$
declare
  class_partner_id uuid;
  class_student_id uuid;
  student_partner_id uuid;
begin
  select c.partner_id, c.student_id
  into class_partner_id, class_student_id
  from public.classes c
  where c.id = new.class_id;

  perform public.enforce_same_partner(new.partner_id, class_partner_id, 'attendance.class_id');

  select s.partner_id
  into student_partner_id
  from public.students s
  where s.id = new.student_id;

  perform public.enforce_same_partner(new.partner_id, student_partner_id, 'attendance.student_id');

  if class_student_id is not null and class_student_id <> new.student_id then
    raise exception 'attendance.student_id must match class.student_id when the class is linked to a student';
  end if;

  return new;
end;
$$;

create or replace function public.validate_payment_partner_integrity()
returns trigger
language plpgsql
as $$
declare
  class_partner_id uuid;
  class_student_id uuid;
  student_partner_id uuid;
begin
  select s.partner_id
  into student_partner_id
  from public.students s
  where s.id = new.student_id;

  perform public.enforce_same_partner(new.partner_id, student_partner_id, 'payment.student_id');

  if new.class_id is null then
    return new;
  end if;

  select c.partner_id, c.student_id
  into class_partner_id, class_student_id
  from public.classes c
  where c.id = new.class_id;

  perform public.enforce_same_partner(new.partner_id, class_partner_id, 'payment.class_id');

  if class_student_id is not null and class_student_id <> new.student_id then
    raise exception 'payment.student_id must match class.student_id when the payment references a class';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_schedule_partner_integrity on public.schedules;
create trigger validate_schedule_partner_integrity
before insert or update on public.schedules
for each row
execute function public.validate_schedule_partner_integrity();

drop trigger if exists validate_class_partner_integrity on public.classes;
create trigger validate_class_partner_integrity
before insert or update on public.classes
for each row
execute function public.validate_class_partner_integrity();

drop trigger if exists validate_attendance_partner_integrity on public.attendance;
create trigger validate_attendance_partner_integrity
before insert or update on public.attendance
for each row
execute function public.validate_attendance_partner_integrity();

drop trigger if exists validate_payment_partner_integrity on public.payments;
create trigger validate_payment_partner_integrity
before insert or update on public.payments
for each row
execute function public.validate_payment_partner_integrity();

create index if not exists students_partner_id_status_billing_type_idx
on public.students(partner_id, status, billing_type);

create index if not exists classes_partner_id_starts_at_idx
on public.classes(partner_id, starts_at);

create index if not exists payments_partner_id_reference_month_idx
on public.payments(partner_id, reference_month);

create index if not exists payments_partner_id_status_reference_month_idx
on public.payments(partner_id, status, reference_month);
