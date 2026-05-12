# Job Application Tracker — Project Brief

A personal web app to track job applications across multiple boards (Indeed, Stepstone, Glassdoor, Xing, LinkedIn, Djinni, direct, referrals, etc.). Single user, manual entry via a form.

This brief is the source of truth. `CLAUDE.md` covers conventions for ongoing work; `schema.prisma` is the data model.

---

## Goals

- **Single source of truth** for every job applied to: where, when, which CV, what stage, what happened next.
- **Fast manual entry.** A streamlined new-application form: smart defaults, keyboard-friendly, company auto-complete from existing records.
- **Decision-grade statistics.** At any moment, answer: how many applications open, response rate by source, time-to-first-response, conversion at each stage, which CV gets the most interviews.
- **Run forever for free or near-free.** Personal tool. No infra surprises.

## Non-goals

- Multi-tenant SaaS. **Single user only** for now. The schema keeps a `User` table with one seeded row and `userId` foreign keys on every entity, so flipping to multi-user later is purely additive (no backfill needed).
- Mobile-native apps. PWA-quality on phone browser is enough.
- AI-powered import. Manual entry only — may be added in a later phase.
- Resume builder. CVs are uploaded PDFs, not generated.

## Tech stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **TypeScript** strict mode
- **PostgreSQL** on **Neon** (free tier, Frankfurt region)
- **Prisma** ORM
- **Custom auth** — single `APP_PASSWORD` env var + HMAC-signed cookie via `jose`. No Auth.js, no OAuth.
- **shadcn/ui + Tailwind v4**
- **Zod** for all input validation
- **Cloudflare R2** for CV PDF storage, accessed via `@aws-sdk/client-s3` pointed at the R2 endpoint. Private bucket, signed URLs for download.
- **Resend** for Phase 2 reminder emails
- **Vercel Hobby** for hosting, **Vercel Cron** for scheduled jobs
- **npm** package manager (`package-lock.json`)
- **Vitest** for unit tests, **Playwright** for one happy-path E2E

## Data model (overview)

Full schema in `schema.prisma`. Core entities:

- **User** — one seeded row (yourself). Kept as a real table so adding a second user later is one INSERT, not a migration.
- **Company** — one record per company, even if many applications.
- **Application** — the unit of tracking. Belongs to a Company, references one CVTemplate.
- **ApplicationEvent** — timeline entries (applied, screening, interview, offer, rejection, follow-up). The event table is the historical truth; `Application.status` is a denormalized cache of the latest event for fast filtering.
- **CVTemplate** — uploaded PDF stored in R2 (object key in DB) + metadata (language, role focus, version).
- **Contact** — recruiters, interviewers, hiring managers. Belongs to a Company; optionally tied to a specific Application.

Key enums: `ApplicationStatus`, `Source`, `EmploymentType`, `RemotePolicy`, `EventType`, `Language`.

## Features

### MVP (build in this order)

1. **Auth.** `/login` page with single password field. Server Action checks `APP_PASSWORD`, sets a 30-day HMAC-signed session cookie containing `userId` (the seeded user's id). Middleware protects all `(app)` routes. `/logout` clears the cookie.
2. **Companies CRUD.** List, detail page (with all its applications + contacts), create, edit, delete.
3. **CV Templates CRUD.** Upload PDF → server streams to R2 → store the R2 object key + metadata. List, replace, delete. Tag with language and a short description ("Senior Frontend EN", "Full-stack DE"). Download links are signed URLs valid for ~5 minutes.
4. **Applications CRUD.** Full form with:
    - Company (autocomplete from existing, or "+ Create new" inline)
    - Role, job URL, source (dropdown of all sources)
    - Location, country, remote policy, employment type, language
    - Salary range + currency
    - CV template used (dropdown of your uploaded CVs)
    - Cover letter notes
    - Initial status (defaults to APPLIED)
    - Applied date (defaults to today)
    - Free-text notes
5. **Status update from list.** Inline status dropdown on the applications list — changing it creates an `ApplicationEvent` automatically with today's date.
6. **Application detail page.** Shows all fields, the full event timeline, attached contacts, and quick actions ("Mark as interviewed", "Mark as rejected", "Add note").
7. **Dashboard / statistics.**
    - Top cards: total applications, active (not rejected/withdrawn/ghosted), interviews scheduled, offers.
    - Funnel chart: applied → screening → interview → final → offer.
    - Response rate by source.
    - Response rate by CV template (which CV is working).
    - Applications over time (line chart, weekly buckets).
    - Median time-to-first-response.
8. **Filter and search.** On applications list: by status, source, company, CV, date range, free-text on role/notes.

### Phase 2

- **Kanban view** of applications by status (`@dnd-kit/core` for drag).
- **Follow-up reminders.** `nextActionAt` field, Vercel Cron daily job, email via Resend listing overdue items.
- **CSV export** of applications.
- **Bulk status update** from the list view.

### Phase 3 (deferred — explicitly out of scope for now)

- **Multi-user.** Add a registration flow (or expand the seed), keep the same `userId`-scoped queries. No schema migration needed.
- **AI-powered quick-add.** Paste a job URL or description; LLM extracts company, role, salary, etc.
- **Browser extension** that posts to the same quick-add endpoint.
- **Inbound email parsing** of application-confirmation emails.

## UX principles

- **Fast new-application form.** Company field uses autocomplete-or-create. Sensible defaults: source remembers last used, language defaults to UI language, applied-date defaults to today, status defaults to APPLIED.
- **Server Components by default.** Client only where interactivity demands it (forms, dropdowns, kanban).
- **No skeleton fatigue.** For a single-user app, page loads should feel instant — keep queries narrow, use Prisma `select` aggressively.
- **Optimistic UI** on status changes and event creation.
- **Keyboard-first list views.** `j/k` to move, `e` to edit, `/` to search, `n` for new application.

## Build order

1. `npx create-next-app@latest .`, set up Tailwind v4, shadcn/ui, ESLint, Prettier, strict TS config.
2. Neon project (Frankfurt region), `.env`, `prisma init` from the provided schema, `npm run db:migrate`.
3. Seed the single User row (`prisma/seed.ts` reads `SEED_USER_EMAIL` and `SEED_USER_NAME`).
4. Custom auth: `/login` page, login Server Action, `lib/auth.ts` (session helpers), `middleware.ts` (protect `(app)` routes).
5. Layout shell (sidebar nav: Dashboard / Applications / Companies / CVs).
6. R2 client setup in `lib/storage.ts` (upload, getSignedUrl).
7. Companies CRUD (simplest entity — get the patterns right here).
8. CVs CRUD + R2 upload.
9. Applications CRUD — list, new, detail, edit.
10. Status update + event log.
11. Dashboard.
12. Filters on the applications list.

## Success criteria

- New-application form fillable in under 60 seconds for a familiar company (autocomplete, smart defaults).
- The dashboard answers "which CV should I use for my next German full-stack application?" in one glance.
- Zero applications lost to the void: every application has a status, every status change has a date.
- Total hosting cost: $0/month (Vercel Hobby + Neon Free + Cloudflare R2 Free + Resend Free).
