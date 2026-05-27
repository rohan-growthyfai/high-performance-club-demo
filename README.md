# Micro Momentum

A simple static landing page about high-performance habits and the small actions that compound into meaningful growth.

## Local Development

```bash
npm run build
npm run dev
```

The site runs locally at `http://localhost:4173`.

## Deploy

The production bundle is generated in `dist/`:

```bash
npm run build
```

For Cloudflare Pages, use these build settings:

```text
Build command: npm run build
Build output directory: dist
Root directory: /
```

Do not set the deploy/upload directory to the repository root. The source repo may contain temporary install files during Cloudflare builds, while `dist/` contains only the static website.

If your Cloudflare project has a separate deploy command field, leave it blank for a normal Pages Git deployment. If Cloudflare requires a deploy command, use:

```text
npx wrangler pages deploy dist --project-name micro-momentum-landing --branch main
```

Do not use `npx wrangler deploy` for a Pages project unless you intentionally want to deploy it as a Workers static-assets project.
