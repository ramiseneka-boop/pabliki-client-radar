# Деплой Pabliki Client Radar на Vercel

Этот прототип — проект **Next.js**, поэтому Vercel разворачивает его без настройки.
Ниже два пути. **Путь A (Vercel CLI)** — самый быстрый, GitHub не нужен.
**Путь B (GitHub + Vercel)** — чуть дольше, но даёт авто-деплой при каждом `git push`.

Все команды выполняются из папки `prototype`.

---

## Перед деплоем — проверьте локально

```bash
cd prototype
npm install
npm run dev      # откройте http://localhost:3000 — должен открыться дашборд
```

Если дашборд открылся, можно деплоить.

---

## Путь A — Vercel CLI (быстро, без GitHub)

```bash
npm install -g vercel     # поставить Vercel CLI (один раз)
vercel login              # вход — откроется браузер, войдите в свой аккаунт Vercel
vercel                    # первый деплой (preview). На вопросы жмите Enter — настройки по умолчанию подходят
vercel --prod             # выкатить в продакшн → получите ссылку *.vercel.app
```

На вопросы CLI:
- *Set up and deploy?* → **Y**
- *Which scope?* → ваш аккаунт
- *Link to existing project?* → **N**
- *Project name?* → `pabliki-client-radar` (Enter)
- *In which directory is your code?* → `./` (Enter)
- остальное — Enter.

Готово — CLI выведет рабочий URL.

---

## Путь B — GitHub + Vercel (авто-деплой при push)

1. Создайте пустой репозиторий на github.com (например `pabliki-client-radar`), **без** README.
2. В папке `prototype` (git уже инициализирован, первый коммит сделан):

```bash
git remote add origin https://github.com/ВАШ_АККАУНТ/pabliki-client-radar.git
git branch -M main
git push -u origin main
```

3. На vercel.com → **Add New → Project** → импортируйте этот репозиторий.
4. Vercel сам определит Next.js. Если репозиторий — именно папка `prototype`,
   **Root Directory** оставьте по умолчанию. Если вы залили весь проект
   `pabliki-client-radar`, в настройках импорта укажите **Root Directory = `prototype`**.
5. Нажмите **Deploy** → через ~1 минуту получите ссылку `*.vercel.app`.

---

## Поддомен radar.pabliki.kz

После деплоя (любой путь):

1. В проекте Vercel → **Settings → Domains** → добавьте `radar.pabliki.kz`.
2. В DNS-настройках домена `pabliki.kz` добавьте запись:
   - Тип: **CNAME**
   - Имя/Host: `radar`
   - Значение: `cname.vercel-dns.com` (точное значение Vercel покажет на экране)
3. Через несколько минут поддомен заработает, SSL-сертификат Vercel выпустит автоматически.

---

## Важно

Это визуальный прототип на демо-данных (`lib/mock.ts`) — без бэкенда и базы.
Он нужен, чтобы показать интерфейс и согласовать вид. Когда перейдёте к рабочей версии,
подключаются PostgreSQL (`../db/schema.sql`), API и AI-слой (`../docs/`). Vercel это тоже
поддерживает: Next.js API routes + Supabase, либо отдельный бэкенд-сервис.
