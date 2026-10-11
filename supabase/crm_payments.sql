-- תשלומים שעברו בקישורי התשלום של אקו מדיה (/pay/<מוצר>), לפי סוכן וליד.
-- כותב רק השרת (api/pay-hook.ts עם SUPABASE_SERVICE_ROLE_KEY). RLS פעיל בלי מדיניות: אין גישה ציבורית.
-- החדר של אקו מדיה קורא את הטבלה דרך מחבר ה-Supabase של המנהל, כמו את crm_leads.
create table if not exists public.crm_payments (
  lowprofile_id   text primary key,
  return_value    text,
  agent_code      text,
  lead_id         text,
  product         text,
  amount          numeric(10, 2),
  payer_name      text,
  document_number text,
  paid_at         timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

alter table public.crm_payments enable row level security;

create index if not exists crm_payments_agent_paid_idx on public.crm_payments (agent_code, paid_at desc);
