# Abandoned but not Forgotten

**Stories from the equipment humanity left behind on the Moon and Mars.**

An immersive scrollytelling website built for the NASA Space Apps Challenge 2026.
Each lander, rover, instrument, and flag still sitting on another world gets a voice —
a first-person story built from real mission facts, an emotional arc, and a
"what happened to me" ending.

> They finished their mission. They never came home.

## Features

- **Starfield hero** with scroll cue and fully responsive layout
- **Interactive Moon/Mars map** — canvas-drawn discs with clickable pins at
  approximate landing sites; click a pin or legend entry to jump to its story
- **16 artifact story cards** driven by `data/artifacts.json` (Apollo landers,
  MET cart, golf balls, ALSEP, rovers, Surveyor 3, Viking 1/2, Pathfinder +
  Sojourner, Spirit, Opportunity, Phoenix, InSight, Ingenuity)
- **Live NASA images** — each card tries the public
  [NASA Image and Video Library API](https://images-api.nasa.gov/) at runtime
  (6 s timeout, in-memory cache); falls back to an original SVG illustration
  when offline or on failure
- **Then vs. Now timeline** (1967–2024) filterable by Moon/Mars
- **"Why it matters"** — space heritage, preservation, debris, planetary protection
- **Listen** — Web Speech API read-aloud with play/pause and graceful fallback
- **Memorial wall** — one-line tributes held in memory only (no storage, no
  personal data, length + content filtered)
- **Quiz** — 6 questions generated from the artifact data, with explanations
- **Accessible** — semantic HTML, skip link, keyboard-navigable controls,
  `prefers-reduced-motion` respected, good contrast

## Run locally

No build step, no dependencies. Either:

```powershell
# Option A: just open the file
start index.html

# Option B: serve it (recommended — fetch() of artifacts.json behaves best over HTTP)
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a repo and push this folder's contents.
2. Repo **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
3. Wait ~1 minute; site is live at `https://<user>.github.io/<repo>/`.
   (All asset paths are relative, so it works from a subpath.)

Netlify works identically: drag-and-drop the folder or connect the repo —
no build command needed.

## Tech

Plain HTML + CSS + vanilla JS. No frameworks, no npm, no backend, no API keys.
NASA data is fetched client-side from public endpoints only.

## Data sources

- **NASA Image and Video Library API** — `images-api.nasa.gov/search` for
  per-artifact imagery (with credit + link back to the asset page)
- **NASA NSSDC Master Catalog** — mission/spacecraft records for dates/locations
- **NASA LRO / LROC** — Apollo landing-site imagery context
- **NASA mission pages** — Apollo, Surveyor, Viking, Mars Pathfinder, MER,
  Phoenix, InSight, Mars 2020/Ingenuity histories

Every artifact carries a `sourceNote` field indicating what to verify against.
Pin coordinates are approximate equirectangular projections — labeled as such
in the UI.

## AI disclosure

Code and story text were drafted with AI assistance (Windsurf/Claude) and
reviewed by the team. This entry is unofficial, created for the NASA Space
Apps Challenge, and is not affiliated with or endorsed by NASA. No AI-generated
images are used; all illustrations are original SVG, and NASA imagery is
public-domain with credit.

## Limitations / future work

- Coordinates are approximate; a future version could plot true selenographic
  and areographic positions from NSSDC ephemeris data.
- NASA image results depend on search relevance — a curated `nasa_id` map per
  artifact would be more precise.
- Quiz and memorial wall are intentionally ephemeral (memory only).
- Could add audio summaries via pre-recorded TTS or Web Speech custom voices.
