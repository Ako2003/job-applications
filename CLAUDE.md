# CLAUDE.md

Persistent context for Claude Code sessions on this project. Read this before writing or modifying code.

## Project

Personal job-application tracker. Single user (seeded `User` row, password-gated via `APP_PASSWORD`). Next.js 15 + Postgres (Neon) + Prisma + custom cookie auth + Tailwind + shadcn/ui. CV PDFs in Cloudflare R2. Hosted on Vercel. See `PROMPT.md` for the full brief.

## Stack & versions

- Node 22+
- **npm** (lockfile is `package-lock.json`; never use pnpm or yarn here)
- Next.js 15, React 19, TypeScript 5 strict
- Prisma 6+ with Postgres
- `jose` for JWT/HMAC cookie signing (no Auth.js, no NextAuth)
- Tailwind v4 (CSS-based config, not `tailwind.config.js`)
- shadcn/ui (components copied into `components/ui`, not a package)
- Zod 3 for validation
- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` for Cloudflare R2
- Vitest for unit/integration, Playwright for one happy-path E2E

## Commands

```
npm run dev                 # next dev
npm run build               # next build
npm run lint                # next lint
npm run typecheck           # tsc --noEmit
npm test                    # vitest
npm run test:e2e            # playwright test
npm run db:migrate          # prisma migrate dev
npm run db:studio           # prisma studio
npm run db:generate         # prisma generate
npm run db:seed             # tsx prisma/seed.ts
```

Always run `npm run typecheck && npm run lint` before declaring a feature done.

## Directory structure

```
app/
  (auth)/
    login/                 # password entry page
  (app)/                   # all authenticated pages share this layout
    dashboard/
    applications/
      [id]/
      new/
    companies/
      [id]/
    cvs/
    settings/
  api/                     # used only when Server Actions are not appropriate
    cv/
      [id]/
        download/          # signed-URL redirect endpoint for CV downloads
middleware.ts              # guards (app)/* — redirects to /login if no session
components/
  ui/                      # shadcn primitives — do not hand-edit if regenerating
  app/                     # project-specific composites
lib/
  db.ts                    # singleton Prisma client
  auth.ts                  # session create/verify/get/require helpers (jose)
  storage.ts               # R2 client + upload + getSignedDownloadUrl
  env.ts                   # process.env validated with Zod at import time
  validation/              # Zod schemas per entity
  actions/                 # Server Actions, one file per entity
  utils/
prisma/
  schema.prisma
  migrations/
  seed.ts                  # creates the single User row from SEED_USER_* env vars
tests/
  unit/
  e2e/
```

## Conventions

### Code style

- Functional React. No class components.
- `export default` only for Next.js page/layout/middleware files. Everything else is named export.
- Imports ordered: react/next, third-party, `@/lib/*`, `@/components/*`, relative, types-only last.
- File names: `kebab-case.ts` for utilities, `PascalCase.tsx` for components.
- Components live in their own file when over ~30 lines or reused.
- No barrel `index.ts` files outside `components/ui`.

### Server vs client

- **Default to Server Components.** Add `"use client"` only when a hook or browser API is required.
- Data fetching happens in Server Components or Server Actions. Never call Prisma from a Client Component.
- Forms use Server Actions, not API routes. API routes only used when something else demands them (e.g. the CV download redirect endpoint).

### Auth

Single user. No registration flow, no allowlist, no OAuth. The flow:

1. `/login` shows a password form.
2. Server Action `signIn(password)` compares against `APP_PASSWORD` using `crypto.timingSafeEqual`. On success, looks up the single `User` row and issues a session.
3. Session is a `jose`-signed JWT in an HttpOnly, SameSite=Lax, Secure (in prod) cookie named `session`, 30-day expiry. Payload: `{ userId: string }`.
4. `middleware.ts` checks the cookie on every `(app)/*` route; if invalid, redirects to `/login`.
5. `/logout` Server Action clears the cookie.

Helpers in `lib/auth.ts`:

```ts
createSession(userId)        // sets the signed cookie
clearSession()               // clears it
getSession()                 // returns { userId } or null
getUser()                    // returns the User row or null
requireUser()                // returns User or throws "Unauthorized"
```

**Every Server Action must call `requireUser()` first.** Even though there's only one user, doing this consistently means future multi-user is a no-op for these call sites.

### Server Actions

Every Server Action follows this shape:

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ /* ... */ });

export async function createApplication(input: unknown) {
  const user = await requireUser();
  const data = schema.parse(input);

  const application = await db.application.create({
    data: { ...data, userId: user.id },
  });
  revalidatePath("/applications");
  return application;
}
```

- Always `requireUser()` first.
- Always validate input with Zod. Never trust `FormData` directly.
- Always `revalidatePath` or `revalidateTag` for affected routes.
- Always scope queries by `userId` even though there's currently one user. `db.application.findMany({ where: { userId: user.id, ... } })`.

### Validation

- One Zod schema per entity, in `lib/validation/`. Reuse for both Server Actions and form types where possible.
- Coerce form strings (`z.coerce.number()` etc.) at the boundary, not deeper.
- `lib/env.ts` exports a typed, validated `env` object built from `process.env` at import time. Never read `process.env` elsewhere.

### Database

- Migrations are sacred. Never edit a migration after it's been applied to a real database. Make a new one.
- Use `select` everywhere — never return a whole row when a page needs three fields.
- `Application.status` is a denormalized cache. The truth is the latest `ApplicationEvent`. The `updateStatus` action must both insert an event AND update the cached field — wrap in `db.$transaction`.
- All timestamps are `DateTime @default(now())`. Always store UTC. Format in the UI with the user's timezone (default Europe/Berlin).
- Money fields: store amount as integer minor units (cents) + ISO 4217 currency code. Do not use floats.
- Every query that returns user-owned data filters by `userId`. No exceptions.

### Storage (Cloudflare R2)

`lib/storage.ts` exposes:

```ts
uploadCv(buffer: Buffer, contentType: string): Promise<{ key: string }>
deleteCv(key: string): Promise<void>
getCvDownloadUrl(key: string): Promise<string>    // signed URL, ~5 min expiry
```

- R2 bucket is **private**. There are no public URLs. Downloads go via `/api/cv/[id]/download`, which calls `requireUser()`, verifies the CV belongs to the user, gets a fresh signed URL, and 302-redirects to it.
- Object keys are `cvs/${cuid}.pdf`. Never the original filename.
- File size limit: 5 MB. Enforce in the upload Server Action.
- Content type: `application/pdf` only. Sniff the first bytes (`%PDF-`) rather than trusting the client.
- Use `@aws-sdk/client-s3` with `endpoint: https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`, region `auto`.

### UI

- Use shadcn/ui primitives. If something isn't in shadcn, build it in `components/app/` — don't reach for another component library.
- Forms: `react-hook-form` + `@hookform/resolvers/zod` + shadcn's `Form` primitives.
- Tables: simple semantic `<table>` with Tailwind. No data-grid library for v1.
- Toasts: `sonner` (shadcn-recommended).
- Charts on the dashboard: `recharts`.
- Dark mode: respect system preference, no toggle in v1.

### Testing

- Vitest for `lib/` (validation, auth helpers, storage helpers with mocked S3 client).
- One Playwright test: log in → upload a CV → create a new application referencing it → see it on the dashboard.
- Do not write tests for shadcn components or trivial getters. Focus on logic that could break silently.

## Adding a new feature — checklist

1. Update `schema.prisma` if needed → `npm run db:migrate -- --name descriptive_name`.
2. Add/update Zod schema in `lib/validation/`.
3. Add Server Action(s) in `lib/actions/` (always start with `requireUser()`).
4. Build the UI (Server Component page → Client form component).
5. Add `revalidatePath` calls.
6. Manual smoke test in the browser.
7. `npm run typecheck && npm run lint && npm test`.

## Things to avoid

- API route handlers for things Server Actions can do (mutations from authenticated forms).
- Calling Prisma from Client Components or `useEffect`.
- Storing dates as strings.
- `any` in TypeScript — use `unknown` and narrow.
- Editing applied migrations.
- Reading `process.env` outside `lib/env.ts`.
- Hardcoding the user's email anywhere. Always read from session or the User row.
- Generating CVs. CVs are uploaded only.
- Storing R2 secrets or full R2 URLs in the database. Store only the object key; build URLs at request time.
- Skipping `requireUser()` in a Server Action because "it's just me anyway."

## Common pitfalls noted during build

(Add entries here as we discover them — leave the section even if empty.)
