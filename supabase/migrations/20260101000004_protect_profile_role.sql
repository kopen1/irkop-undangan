-- Perbaikan keamanan: cegah user menaikkan role dirinya sendiri jadi admin.
--
-- Sebelumnya policy profiles_update_self (dan profiles_insert_self) mengizinkan
-- user menulis kolom `role` pada baris miliknya sendiri, sehingga siapa pun bisa
-- memberi dirinya akses admin. Role sekarang hanya bisa diubah oleh admin asli,
-- atau lewat SQL editor / service role (auth.uid() null).

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Role hanya bisa diubah oleh admin.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- Insert sendiri hanya boleh dengan role default.
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and (role = 'user' or public.is_admin()));

-- Update sendiri tidak boleh menyentuh kolom role (dijaga trigger di atas),
-- jadi policy cukup memastikan barisnya milik sendiri.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
