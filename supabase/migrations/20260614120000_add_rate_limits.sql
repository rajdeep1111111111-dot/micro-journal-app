create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;

revoke all on table public.rate_limits from anon;
revoke all on table public.rate_limits from authenticated;

create or replace function public.check_rate_limit(
  key text,
  max_count integer,
  window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_record public.rate_limits%rowtype;
  now_value timestamptz := now();
begin
  if key is null or length(trim(key)) = 0 then
    return false;
  end if;

  if max_count < 1 or window_seconds < 1 then
    return false;
  end if;

  insert into public.rate_limits as rl (key, count, window_start)
  values (key, 1, now_value)
  on conflict (key) do update
    set
      count = case
        when rl.window_start <= now_value - make_interval(secs => window_seconds)
          then 1
        else rl.count + 1
      end,
      window_start = case
        when rl.window_start <= now_value - make_interval(secs => window_seconds)
          then now_value
        else rl.window_start
      end
  returning * into current_record;

  return current_record.count <= max_count;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public;
revoke all on function public.check_rate_limit(text, integer, integer) from anon;
grant execute on function public.check_rate_limit(text, integer, integer) to anon;
grant execute on function public.check_rate_limit(text, integer, integer) to authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
