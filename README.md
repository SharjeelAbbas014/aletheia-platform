# Aletheia Platform Qwik

Qwik rewrite of the original `aletheia-platform` Next.js app.

## Includes

- Marketing landing page on `/`
- Documentation surface on `/docs`
- Blog surface on `/blog`
- Demo login on `/login`
- Cookie-backed API key dashboard on `/platform`

## Demo login

- Email: `demo@aletheia.dev`
- Password: `aletheia-demo`

Override them with:

- `ALETHEIA_DEMO_EMAIL`
- `ALETHEIA_DEMO_PASSWORD`

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run serve
```

## Blog authoring

Blog posts live in `src/content/blog/*.md`.

- The filename becomes the slug.
- Frontmatter drives title, description, dates, tags, and featured state.
- New `.md` files are picked up automatically by the blog index, post routes, sitemap, and SEO metadata.
