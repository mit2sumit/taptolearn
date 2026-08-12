# Tap & Say

Picture flashcards for ages 2–6. 13 topics, 228 cards, three play modes.
No build step, no framework, no dependencies. Total payload: **~90 KB** for the
first page, ~2 KB per page after that (the CSS and JS are cached).

## What's in here

```
index.html              home page
alphabet/index.html     one real page per topic — 13 of them
numbers/ colours/ shapes/ animals/ birds/ fruits/
vegetables/ body/ family/ instruments/ vehicles/ rhymes/
404.html
assets/style.css        all styles
assets/app.js           all card data + all logic
assets/audio/           empty — put your MP3 recordings here
manifest.webmanifest    installable-app metadata
sw.js                   service worker (offline support)
sitemap.xml  robots.txt
favicon.svg  favicon.ico  apple-touch-icon.png
icon-192.png  icon-512.png  og-image.png
preview.html            everything inlined in one file, opens by double-click
build.py                regenerates every file above
```

## Before you deploy

The canonical URLs, sitemap and robots.txt all contain a placeholder domain.
Point them at your real one:

```bash
python3 build.py https://yourdomain.com
```

That rewrites all 15 pages, `sitemap.xml` and `robots.txt`. You can also edit
the `SITE` constant near the top of `build.py` so you don't have to pass it
each time. `build.py` needs Python 3 and Pillow (`pip install Pillow`) — only
for regenerating the icons.

## Deploying

Everything is static, so any host works. Upload the whole folder **except**
`build.py`, `README.md` and `preview.html`.

- **Cloudflare Pages / Netlify / Vercel** — drag the folder in, or connect the
  repo with no build command and the folder as the output directory.
- **GitHub Pages** — push to a repo, enable Pages on the branch root. If you're
  using a project page (`user.github.io/repo`), the absolute `/assets/...`
  paths will break; use a custom domain or a user page instead.
- **Any nginx/Apache host** — copy to the web root. The topic folders each
  contain an `index.html`, so `/colours/` resolves with no config needed.

Two server-side things worth setting:

1. Serve `404.html` for missing paths.
2. Cache headers — `assets/*` and the PNGs can be cached for a year;
   HTML and `sw.js` should be `no-cache` so updates land.

## After you deploy

- Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Check the install prompt works on an Android phone (Chrome → menu → *Install app*).
- Run Lighthouse. It should pass PWA and come in near 100 on performance.

## Adding rhyme audio

The Rhymes topic is wired for real recordings but ships with none. Open
`/rhymes/` and look in the browser console — it prints the exact filenames it
expects, e.g. `/assets/audio/twinkle-twinkle-little-star.mp3`. Drop matching
files in and the cards play. Until then each card says "Recording not added yet."

The traditional verses themselves are public domain, but **specific recordings
and arrangements are not** — a lot of what circulates online is owned by
children's media companies. Record your own, commission them, or buy a licence.

The same `audio` field works on any item in any topic. If you add one, the word
plays from the file instead of the speech synthesiser, which is a real quality
upgrade if you ever want to do it properly.

## Adding or editing cards

All the data is in one table at the top of `assets/app.js`. Most topics use the
compact `pairs()` helper:

```js
vehicles: {
  name: "Vehicles", glyph: "🚌", blurb: "Things that go.",
  items: pairs("Car 🚗,Bus 🚌,Truck 🚚")
}
```

Label first, emoji last. Multi-word labels are fine (`Sweet potato 🍠`).
Items can also carry `sub`, `color`, `svg`, `dots` or `audio` — see the
alphabet, colours, shapes and numbers entries for each.

To add a whole topic: add it to that table, then add a matching row to the
`TOPICS` list in `build.py` (slug, name, `<h1>`, meta description) and rebuild.
The tiles, nav, sitemap and service worker all update themselves.

## When you change anything

Bump `CACHE` in `sw.js` (`tapandsay-v1` → `-v2`). Otherwise returning visitors
keep the old cached version. `build.py` does not do this for you — it's a
deliberate decision each time you ship.

## Known trade-offs

**Emoji instead of images.** No image requests, perfect scaling, works offline.
The cost is that emoji look different on iOS, Android and Windows, and a few
newer ones (goose 🪿, flute 🪈, ginger 🫚, peas 🫛) show as a blank box on
devices older than ~2022. Swapping in an SVG sprite sheet later is a one-field
change per item.

**Web Speech API instead of audio files.** Free, offline, zero hosting. The
costs: voice quality varies a lot by device, iOS only speaks after a tap (every
`say()` here is tap-triggered, so this is handled), and a few Android devices
ship with no English voice at all — those users get pictures and no sound. The
`audio` field is the escape hatch.

**No analytics, no ads, no third-party scripts.** Deliberate, given the
audience. Adding any of them will change your privacy obligations — children's
data is regulated much more tightly than adults' (COPPA in the US, GDPR-K in
the EU, the UK Age Appropriate Design Code). Worth reading before you add a
tracker or a consent banner.

## Next step: the mobile app

`manifest.webmanifest` + `sw.js` already make this installable from the browser
on Android and iOS — full screen, offline, own icon, no app store. That covers
most of what people want from a "kids app" and costs nothing. Try it before
committing to React Native or Flutter; if you do go native later, the card data
in `app.js` ports over as plain JSON.
