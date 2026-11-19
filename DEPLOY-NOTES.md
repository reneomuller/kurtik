# Deploy notes (for the orchestrator)

State: `~/kurtik` is committed locally (branch `main`, tags `p0 p1 p2 p3 streams final`), **not pushed, not deployed**.
Repo-local git identity: `Oliver Staehelin <290878081+reneomuller@users.noreply.github.com>` (the noreply e-mail of GitHub `reneomuller`, which Vercel Hobby needs as the commit author for Git deploys).
`.env.local` (git-ignored, never uploaded: see `.vercelignore`) holds the three values below; `ADMIN_PIN` is a random 12-digit PIN and exists only there.

| Variable | Value | Secret |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wauomxljnyciqfgmlnbl.supabase.co` | no |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_PP2Rz1klMmN1E5I1y8PCDQ_1LtvLIV9` | no (publishable) |
| `ADMIN_PIN` | read from `.env.local` | yes, never on screen |

There is no `SUPABASE_SECRET_KEY`; the app doesn't use one.
`NEXT_PUBLIC_*` values are inlined **at build time**: set them before the first deploy (or Redeploy after changing them).

## 1. Push to GitHub (empty public repo `reneomuller/kurtik`)

```bash
cd ~/kurtik
git remote add origin https://github.com/reneomuller/kurtik.git
git push -u origin main --tags
```

## 2. Vercel project `kurtik` (framework Next.js, pinned in `vercel.json`)

```bash
cd ~/kurtik
vercel project add kurtik                 # skip if it already exists
vercel link --yes --project kurtik
vercel env add NEXT_PUBLIC_SUPABASE_URL production,preview --value "https://wauomxljnyciqfgmlnbl.supabase.co" --yes
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production,preview --value "sb_publishable_PP2Rz1klMmN1E5I1y8PCDQ_1LtvLIV9" --yes
vercel env add ADMIN_PIN production,preview --value "$(sed -n 's/^ADMIN_PIN=//p' .env.local)" --sensitive --yes
vercel env ls                             # expect 3 variables × production + preview
vercel git connect https://github.com/reneomuller/kurtik.git   # needed for the "live push" moment
vercel deploy --prod --yes
```

If `vercel env add … production,preview` is refused by this CLI version, run each variable twice (`production`, then `preview`).
If `vercel git connect` fails (Vercel GitHub app not installed for `reneomuller`), connect it in the dashboard: Project → Settings → Git → Connect Git Repository → `reneomuller/kurtik`. Without it, step 4 below won't trigger a build.

Measured locally: `npm ci` 4 s, cold `next build` 6–8 s (Next.js 16.4.6, Turbopack). Expect about 45–75 s on Vercel from push to Ready (the RUNBOOK budgets 1–2 min).

## 3. Verify after deploy

Use the **production alias** (`https://kurtik….vercel.app` shown by `vercel deploy --prod`), not the per-deployment URL; only the production alias is public.

1. `curl -s -o /dev/null -w "%{http_code}\n" https://<prod>/` → `200` (not `401`: then Deployment Protection is on for production; turn it off for the alias).
2. `curl -s https://<prod>/ | grep -c "Ukázkový režim"` → `0`. If `1`, the `NEXT_PUBLIC_*` variables were missing at build: add them and Redeploy.
3. Phone, incognito: grid for **Dnes** (Kurt 1–3, 7 days in the picker), then day **st 25. 11.** → Kurt 3 at 21:00 shows **Obsazeno** (the night's test booking; proves the RPC read on Vercel).
4. Safe write-path check that writes nothing: open `https://<prod>/rezervace?kurt=3&den=2026-11-25&cas=21:00`, fill a nickname + `x@example.com`, Rezervovat → **„Tento termín si právě zarezervoval někdo jiný. Vyberte si prosím jiný.“** (unique violation 23505 means the insert reached the database and passed RLS and grants). A generic „Rezervaci se nepodařilo uložit…“ means a wrong key or URL in Vercel: check the Logs for the error code.
5. `/sprava`: wrong PIN → „Nesprávný PIN.“; `ADMIN_PIN` (type it on the phone) → „Dnešní rezervace“, today's grid and „Jména vidí jen správce v Supabase.“
6. `https://<prod>/rezervace/kalendar?kurt=2&den=2026-11-19&cas=18:00` downloads `kurt-tk-mickovice.ics`.

Don't make further real bookings for testing; check 4 covers the write path without adding rows.

## 4. "Live push" moment in class (after `final` is deployed and Git is connected)

A one-line, safe, visible change: a second line in the footer, at the bottom of every page.

```bash
cd ~/kurtik
# In the editor: src/app/layout.tsx, inside <footer>, add a line under the existing <p>:
#   <p>Tuhle větu jsme přidali živě v hodině.</p>
# Or the same change in one command:
sed -i '' 's#<p>Kurtík · výuková ukázka · {CLUB_NAME}</p>#<p>Kurtík · výuková ukázka · {CLUB_NAME}</p><p>Tuhle větu jsme přidali živě v hodině.</p>#' src/app/layout.tsx
git diff                                   # exactly one changed line
git commit -am "Patička: věta přidaná živě v hodině"
git push
```

Then: Vercel → Deployments: **Building → Ready** (about 1 min). Students reload, scroll to the bottom and see the new sentence. Tested locally: the change builds clean in 6 s.
Undo, if needed: `git revert --no-edit HEAD && git push`.

## 5. Optional: replay the steps on production

The tags are deployable states, each tested with `npm run build` and lint. To show the app growing step by step, start the remote at an earlier step and fast-forward:

```bash
git push -u origin p1:main --tags          # instead of pushing main in step 1
git push origin p2:main                     # later: p3, streams, then main (= final)
```

- `p1` ignores the database on purpose (banner „Ukázkový režim“), even with the variables set.
- The unique constraint is **already** in the database, so from `p2` on a double booking can't create two rows. At `p2` the second player sees the generic „Rezervaci se nepodařilo uložit. Zkuste to prosím znovu.“; from `p3` on, the friendly message. The RUNBOOK story "N rows on Kurt 2 at 18:00" (slide 55) can't happen on this database. Tell it as "the database already refused the duplicate".
- `supabase/p3-jeden-termin.sql` documents P3; **don't run it** in the shared project (the constraint already exists).
- The footer from step 4 exists only from `final` on.

## 6. After class
- Delete students' data (only this table, the project is shared): `delete from public.kurtik_bookings;`
- Rotate `ADMIN_PIN` if it was ever shown: `vercel env rm ADMIN_PIN production --yes`, add a new one, Redeploy.
