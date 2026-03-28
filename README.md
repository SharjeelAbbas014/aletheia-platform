# Aletheia Platform

Product repo for:

- the marketing landing page
- developer docs
- the hosted platform shell where users log in and create API keys

## Stack

- Next.js App Router
- Tailwind CSS 4
- Fumadocs for docs
- Cookie-backed demo auth and API-key storage to keep the shell clickable without external infra

## Local development

```bash
npm install
npm run dev
```

## Demo login

- Email: `demo@aletheia.dev`
- Password: `aletheia-demo`

Override them with:

- `ALETHEIA_DEMO_EMAIL`
- `ALETHEIA_DEMO_PASSWORD`

## What to productionize next

1. Replace demo cookies with your real auth provider.
2. Move API keys from cookies into a database-backed control plane.
3. Point the code snippets and docs at the deployed engine and SDK packages.
4. Add billing, usage analytics, and audit log views.
