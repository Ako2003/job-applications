# Job Application Tracker

Personal web app to track job applications across boards (Indeed, Stepstone, Glassdoor, Xing, LinkedIn, Djinni, etc.). Single user, manual entry, CV files in Cloudflare R2.

See `PROMPT.md` for the full project brief and `CLAUDE.md` for code conventions.

## Quick start

```bash
# 1. Install
npm install

# 2. Set up Neon (Frankfurt region recommended)
# Create a project at neon.tech, copy both pooled and direct URLs to .env

# 3. Set up Cloudflare R2
# Cloudflare dashboard → R2 → Create bucket (e.g. "job-tracker")
# Cloudflare dashboard → R2 → Manage API tokens → Create token
#   Permissions: Object Read & Write
#   Specify bucket: your bucket
# Copy account id, access key id, and secret to .env

# 4. Configure environment
cp .env.example .env
# Fill in:
#   - DATABASE_URL + DIRECT_URL (Neon)
#   - APP_PASSWORD (your login password)
#   - SESSION_SECRET (openssl rand -base64 32)
#   - SEED_USER_EMAIL + SEED_USER_NAME
#   - R2_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY + R2_BUCKET

# 5. Database
npm run db:generate
npm run db:migrate
npm run db:seed         # creates your single User row

# 6. Run
npm run dev
```

Visit `http://localhost:3000`, log in with `APP_PASSWORD`, you're in.

## Deployment

Push to GitHub, import on Vercel, paste the same env vars, deploy. Database migrations: run `npx prisma migrate deploy` as a Vercel build step or manually after schema changes.

Cost target: $0/month on Vercel Hobby + Neon Free + Cloudflare R2 Free.

## Workflow

- **New application:** **Applications → New**, fill the form (company autocomplete, sensible defaults), pick which CV you sent, save.
- **Update status:** change the dropdown on the applications list — an event is logged automatically.
- **See what's working:** **Dashboard** breaks down response rate by source and by CV template.

## Tech

Next.js 15 · TypeScript · PostgreSQL (Neon) · Prisma · custom cookie auth (`jose`) · Tailwind v4 · shadcn/ui · Cloudflare R2 (`@aws-sdk/client-s3`).
