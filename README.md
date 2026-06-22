# Cinegma Films — Astro Rebuild

A full rebuild of [cinegmafilms.com](https://cinegmafilms.com) on Astro 5 + Sanity CMS + Vercel.

**Design system 1:1 preserved.** Off-black, off-white, gold, the three cinematic fonts (Bebas Neue, Cormorant Garamond, DM Sans), grain overlay, custom cursor, scroll-reveal — all intact. This is an architecture rebuild, not a redesign.

---

## What's new vs the old static site

| Old site                       | New stack                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| 6 hand-edited HTML files       | Astro components + dynamic routes. Edit content in Sanity, not code.                     |
| Static OG images per page      | Dynamic OG image generation per page via `@vercel/og` — every URL has a unique branded card. |
| Manual film cards in HTML      | Films are CMS documents. Add a new film in Sanity → it appears on `/watch`, RSS, sitemap, schema. |
| `mailto:` contact              | Real `/api/contact` route via Resend, hits `info@cinegmafilms.com`.                      |
| No newsletter                  | Footer signup → Resend audience. Privacy-safe analytics via Plausible.                  |
| Per-film URLs lived only in JSON-LD | `/films/janjaal`, `/films/zawaal`, etc. — real case-study pages with their own SEO.   |
| Lighthouse already great       | Lighthouse stays great. SSR + ISR + image optimization out of the box.                  |

Old `.html` URLs (`/watch.html`, `/about.html`, etc.) all 301-redirect to clean URLs via `vercel.json`. SEO preserved.

---

## Quick start (local dev)

```bash
npm install
cp .env.example .env.local   # leave it blank for now — site works with fallback data
npm run dev                  # → http://localhost:4321
```

The site renders fully on first run using `src/lib/fallback.ts`, so you can iterate on layout before connecting any services.

---

## Connect the services

### 1. Sanity CMS (15 min)

1. Go to <https://sanity.io/manage> and create a project.
2. Copy your Project ID into `.env.local`:
   ```
   PUBLIC_SANITY_PROJECT_ID=abc12345
   PUBLIC_SANITY_DATASET=production
   ```
3. Run the Studio locally:
   ```bash
   SANITY_STUDIO_PROJECT_ID=abc12345 npm run sanity:dev
   ```
   → http://localhost:3333
4. Migrate your content: create Film documents for Janjaal, Zawaal, A Soldier Beside Me, Portrait of Life, Payam e Dil, Main Aur Achu, and Urdu Bazaar Karachi. All the fields match what's already in `src/lib/fallback.ts` — copy from there.
5. Once content is in Sanity, the site automatically uses it instead of the fallback.
6. (Optional) Deploy the Studio publicly at `yourname.sanity.studio`:
   ```bash
   SANITY_STUDIO_PROJECT_ID=abc12345 npm run sanity:deploy
   ```

### 2. Resend (newsletter + contact form)

1. Sign up at <https://resend.com>, create an API key.
2. Add and verify the **cinegmafilms.com** domain (DNS records — TXT + DKIM + SPF). Without this, the contact form's `from: noreply@cinegmafilms.com` won't work; until verified you can change `FROM_EMAIL` in `src/pages/api/contact.ts` to a Resend test domain.
3. Create an Audience for the newsletter, copy its ID.
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxx
   RESEND_AUDIENCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

### 3. Plausible (analytics)

1. Add the site at <https://plausible.io>.
2. Add to `.env.local`:
   ```
   PUBLIC_PLAUSIBLE_DOMAIN=cinegmafilms.com
   ```
   The Plausible script is conditionally injected by `BaseLayout.astro` only when this is set.

### 4. Fonts — drop these into `/public/fonts/`

Self-hosted (faster than Google Fonts, no third-party request). Download `.woff2` for:

- `bebas-neue.woff2` — Bebas Neue Regular ([download](https://fonts.google.com/specimen/Bebas+Neue))
- `cormorant-garamond.woff2` — Cormorant Garamond Variable
- `cormorant-garamond-italic.woff2` — Cormorant Garamond Italic
- `dm-sans.woff2` — DM Sans Variable ([download](https://fonts.google.com/specimen/DM+Sans))

Use a converter like [google-webfonts-helper](https://gwfh.mranftl.com/fonts) to grab the woff2 files directly.

---

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import to Vercel. It auto-detects Astro.
3. Add the env vars from `.env.local` to **Settings → Environment Variables**.
4. Set the custom domain `cinegmafilms.com` (and let Vercel handle the www → apex redirect; `vercel.json` already redirects host-level).
5. Deploy.

ISR is set to 24h in `astro.config.mjs` so content pages cache aggressively but pick up Sanity updates the next day. To force-revalidate, add a Sanity webhook → Vercel "Deploy Hook".

---

## Project structure

```
cinegma-astro/
├── public/
│   ├── fonts/              ← drop .woff2 here
│   └── robots.txt
├── sanity/                 ← Sanity Studio (run with `npm run sanity:dev`)
│   ├── sanity.config.ts
│   ├── sanity.cli.ts
│   └── schemas/
│       ├── index.ts        ← registers all types
│       ├── siteSettings.ts ← singleton (logo, socials, awards counts)
│       ├── film.ts         ← the main content type
│       ├── award.ts
│       ├── pressItem.ts
│       ├── service.ts
│       └── teamMember.ts
└── src/
    ├── layouts/
    │   └── BaseLayout.astro    ← <head>, OG, schema, fonts, Lenis, GSAP — every page
    ├── components/
    │   ├── Nav.astro           ← fixed nav with scroll-shrink + mobile menu
    │   ├── Footer.astro        ← 4-col with newsletter form
    │   ├── Grain.astro         ← film grain overlay
    │   ├── Cursor.astro        ← custom magnetic cursor
    │   ├── Preloader.astro     ← cinematic intro (one-shot per session)
    │   ├── AwardMarquee.astro  ← scrolling banner
    │   ├── FilmCard.astro      ← poster + hover video
    │   └── Schema.astro        ← JSON-LD injection
    ├── pages/
    │   ├── index.astro         ← home
    │   ├── about.astro
    │   ├── watch.astro         ← filmography w/ filter
    │   ├── films/[slug].astro  ← dynamic per-film case study pages
    │   ├── services.astro
    │   ├── press.astro
    │   ├── contact.astro
    │   ├── 404.astro
    │   ├── rss.xml.ts          ← RSS feed of films
    │   └── api/
    │       ├── og.png.ts       ← dynamic OG image generator
    │       ├── subscribe.ts    ← Resend newsletter
    │       └── contact.ts      ← Resend contact email
    ├── lib/
    │   ├── sanity.ts           ← client + safeFetch
    │   ├── queries.ts          ← GROQ queries + TS types
    │   └── fallback.ts         ← content used before CMS is connected
    └── styles/
        └── global.css          ← design tokens + @font-face + primitives
```

---

## Adding a new film (after CMS is connected)

1. Open Sanity Studio → **Films** → **Create new**.
2. Fill: title, slug, tagline, synopsis, release year, runtime, genre, language, director.
3. Upload poster + thumbnail video (silent 16:9 loop, MP4).
4. Pick **Access**:
   - `Free` → "Watch Now" badge, public stream.
   - `Screener` → password-gated, requires request.
   - `Unreleased` → "Coming Soon" badge, no playback.
5. Add crew, awards, festival selections, press quotes as needed.
6. Toggle **Featured** to show on homepage (max 3).
7. Publish. The film appears on `/watch`, gets its own `/films/<slug>` page, ends up in RSS + sitemap automatically.

---

## Migration checklist (cutover from old site)

- [ ] Run `npm install && npm run dev`, confirm site renders identically to old one (fallback data matches existing content)
- [ ] Drop font woff2 files into `/public/fonts/`
- [ ] Create Sanity project, paste IDs into `.env.local`
- [ ] Migrate all 7 films into Sanity Studio (data already in `fallback.ts` as reference)
- [ ] Migrate Site Settings (counts, socials, contact)
- [ ] Set up Resend, verify domain, add API key + audience
- [ ] Set up Plausible
- [ ] Push to a new GitHub repo OR replace contents of `LogoOrbit/Cinegma-Films-Website`
- [ ] Import to Vercel, add env vars, deploy to a preview URL
- [ ] Smoke-test: homepage, every film page, all forms, OG images (paste a film URL into Twitter card validator)
- [ ] Verify `.html` redirects: visit `/watch.html` → should 301 to `/watch`
- [ ] Update DNS to point at new Vercel deployment (if not already)
- [ ] Verify sitemap.xml + RSS feed render
- [ ] Resubmit `cinegmafilms.com/sitemap-index.xml` in Google Search Console

---

## Asset hosting

Video and poster URLs currently point at `cinegmafilms.com/assets/posters/` and `CinegmaFilms.b-cdn.net` — preserved from your existing setup. You have two options going forward:

1. **Keep current CDN.** No change needed — just paste the existing URLs into Sanity's URL fields where the schema accepts URLs (trailerUrl, screenerUrl). For poster + thumbnail video, you can either upload to Sanity or keep referencing the existing URLs by adjusting the schema.
2. **Migrate to Sanity CDN.** Upload posters and thumbnail videos into Sanity. Big files (full screeners, trailers) should stay on Bunny CDN — Sanity isn't priced for that.

I'd recommend keeping Bunny for big video, moving posters + thumbnail loops to Sanity for editorial convenience.

---

## Tech

- **Astro 5** — islands, file-routing, view transitions, server endpoints
- **@astrojs/vercel** — server adapter with ISR
- **Sanity v3** — headless CMS with custom Studio
- **@vercel/og** — runtime OG image generation
- **Resend** — transactional email + audiences
- **Plausible** — privacy-friendly analytics
- **GSAP + ScrollTrigger** — scroll-reveal + magnetic interactions
- **Lenis** — smooth scroll (respects `prefers-reduced-motion`)
- **TypeScript** — strict, path aliases (`~/*`, `@components/*`, etc.)

---

## License

© Cinegma Films LLC. All rights reserved.
