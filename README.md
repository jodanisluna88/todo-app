# Next.js + Supabase Todo (Auth + RLS)

Stack: Next.js 15 (App Router) · Supabase Auth (email/password + GitHub/Google OAuth) · Postgres RLS · Server Actions · Vercel

## 1. Supabase setup
1. Create a project at https://supabase.com.
2. SQL Editor → paste and run `supabase/schema.sql` (table + RLS + 4 policies).
3. Project Settings → API → copy **Project URL** and **anon public key**.
4. Authentication → Providers → enable **Email**, and **GitHub** and/or **Google**
   (see OAuth section below). For quick testing you can turn off "Confirm email".

## 2. Run locally
```bash
cp .env.example .env.local   # fill in the two values
npm install
npm run dev                  # http://localhost:3000
```
Locally, add these under Supabase → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

## 3. OAuth provider (GitHub example)
1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Homepage URL: your site URL. **Authorization callback URL:**
   `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
3. Copy Client ID + generate Client Secret → paste into Supabase → Auth → Providers → GitHub.
(Google: same idea via Google Cloud Console → OAuth client ID; the authorized redirect URI is the same Supabase callback URL.)

## 4. Deploy to Vercel
```bash
git init && git add . && git commit -m "init"
# push to GitHub, then in Vercel: Add New → Project → import the repo
```
Environment variables (Project → Settings → Environment Variables, all environments):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Deploy, then update Supabase → Authentication → URL Configuration:
- **Site URL:** `https://YOUR-APP.vercel.app`
- **Redirect URLs:** add `https://YOUR-APP.vercel.app/auth/callback` (keep the localhost one for dev;
  optionally `https://*-YOUR-TEAM.vercel.app/auth/callback` for preview deployments)

Redeploy if you changed env vars after the first deploy.

## 5. Verify isolation
Sign up two users, add todos to each, confirm each sees only their own. In the SQL editor you can also test:
```sql
select * from public.todos;  -- run as service role: sees all; the app (anon key + JWT) sees only own
```

## How security works
- `middleware.ts` refreshes the session and redirects unauthenticated users away from `/dashboard`.
- Every Server Action re-checks `auth.getUser()` (middleware is not the only line of defense).
- RLS policies on `public.todos` enforce `auth.uid() = user_id` for SELECT/INSERT/UPDATE/DELETE at the database level, so even a bug in app code can't leak another user's rows. Only the public anon key is ever used; the service-role key is never in this app.
