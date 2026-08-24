# Software Auction CRM — setup and operating playbook

## What was added

Route: `/auction`

The module is intentionally isolated from the existing Client Radar. It provides:

- private Supabase email/password login;
- RLS-protected data per `auth.uid()`;
- four market-auction segments: ATS, Corporate LMS, Helpdesk/CX, CDP;
- starter hit-list with evidence links and confidence levels;
- strict gated funnel from research to WON;
- current-software evidence, decision maker, TCO, renewal date and must-have fields;
- next-action queue for daily execution;
- market Auction Score and winner conditions;
- activity log;
- CSV export;
- installable PWA manifest/service worker for phone and desktop.

## 1. Create / choose a Supabase project

In Supabase create a project or use a dedicated existing project.

Open **SQL Editor** and run the full file:

`supabase/migrations/202608240001_software_auction_crm.sql`

It creates only these tables:

- `software_auction_segments`
- `software_auction_companies`
- `software_auction_activities`

The migration enables Row Level Security and allows a logged-in user to access only rows with their own `user_id`.

## 2. Configure Supabase Auth

Supabase → Authentication → Providers → Email.

For the fastest personal setup you can temporarily turn off mandatory email confirmation, create the first account in `/auction`, then turn registrations off / restrict them.

Important: the browser uses only the public anon key. Never place a `service_role` key in `NEXT_PUBLIC_*` variables.

## 3. Add environment variables to hosting

Copy `.env.example` values from Supabase Project Settings → API:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

For Vercel: Project → Settings → Environment Variables → add both variables → redeploy.

The existing repository is already a Next.js project, so no new npm dependency is required for this module.

## 4. First launch

Open:

`https://YOUR_DEPLOYMENT/auction`

Choose **Первый аккаунт**, enter your email and a password of at least 8 characters.

On first successful login the CRM automatically inserts the four market segments and the starter hit-list into your own rows in Supabase.

After creating your account, disable public new-user signups if this CRM is only for you.

## 5. Install as an app

### iPhone / iPad

Open `/auction` in Safari → Share → **Add to Home Screen**.

### Android

Open `/auction` in Chrome → menu → **Install app / Add to Home screen**.

### Mac

Safari: File → **Add to Dock** on supported macOS versions. Chrome/Edge can also install the PWA from the address bar/menu.

The manifest starts directly at `/auction`.

## Sales funnel — do not skip gates

1. **Исследование** — public signal only. Capture source URL and what it actually proves.
2. **ЛПР найден** — real name + direct contact. A target role alone does not count.
3. **Первый контакт** — outreach happened and next action is scheduled.
4. **Discovery с ЛПР** — live conversation; capture pain and must-have functionality.
5. **TCO / renewal подтверждены** — actual spend and renewal date, ideally invoice/contract evidence.
6. **Demo согласовано** — customer explicitly agreed to see a solution after competitor + TCO are known.
7. **Тест миграции** — customer agrees to provide an export/data sample.
8. **КП отправлено** — only after pain, must-have and proposed price are known.
9. **Депозит** — amount + explicit commitment.
10. **Пилот** — parallel operation; do not force an immediate cut-over.
11. **WON** — record actual contracted/collected value.

The UI blocks saving an advanced stage when its factual gates are missing.

## Market-auction rules

Initial resource split:

- ATS: 30%
- LMS: 30%
- CX: 25%
- CDP: 15%

Do not treat this split as a belief. It is only the starting test allocation.

A segment wins the 5–7 day auction only after it reaches all of these:

- 10 decision-maker discovery conversations;
- 5 customers confirming the competitor in use;
- 3 demo commitments;
- 2 commitments to provide migration data/export;
- 1 deposit commitment.

Auction Score is weighted by:

- decision-maker conversations — 30%;
- confirmed current TCO — 20%;
- demo commitments — 20%;
- competitor confirmations — 15%;
- migration ease — 10%;
- build ease — 5%.

## Pricing rule

Do not blindly advertise “50% cheaper” before seeing the actual contract.

Use the **Show me the invoice** rule:

1. obtain current annual TCO;
2. identify paid add-ons and migration risks;
3. calculate the customer’s real switching value;
4. usually target a first-year price around 45–60% of current TCO when unit economics allow it;
5. include migration, onboarding and a parallel-run period in the offer.

A price that is 80–90% cheaper can reduce enterprise trust rather than increase conversion.

## Evidence discipline

The starter hit-list contains three evidence levels:

- `high` — direct vendor/client case, official partner client list or explicit current vacancy statement;
- `medium` — technology detection or public signal that must be reconfirmed before outreach;
- `low` — hypothesis only.

Never mark “actual TCO” from a public price calculator. Put public-price calculations into estimated TCO; actual TCO is reserved for information confirmed by the target customer.

## Current market basis checked in August 2026

- Mastercard/KPMG Kazakhstan SME study: technology cost is a major barrier; marketing automation, CRM/ERP and HR/back-office integration show substantial demand.
- Huntflow Kazakhstan 2026 pricing: Professional 480,000 KZT/recruiter/year; Maximum 660,000 KZT/recruiter/year; annual payment; migration/export are normal supported workflows.
- SOHO.LMS Kazakhstan current corporate pricing publicly scales from small companies through 5,000+ employees.
- Official Kazakhstan iSpring partner publicly lists AB Restaurants, Freedom Mobile, Kaspi.kz, Bereke Bank, ForteBank, Kazakhmys and Kazakh Tourism among iSpring users/customers.

Public evidence is a prospecting signal, not proof that a company is currently overpaying.
