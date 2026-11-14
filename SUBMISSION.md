# SUBMISSION.md — NASA Space Apps Challenge 2026

Ready-to-paste text for each submission form field. Replace bracketed placeholders.

---

## Project Name

**Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars**

---

## High-Level Project Summary (~100 words)

Every mission to the Moon and Mars has left something behind — landers, rovers,
instruments, even golf balls. "Abandoned but not Forgotten" is an immersive
scrollytelling website that gives each of these artifacts a voice. Visitors explore
an interactive map of landing sites, read first-person stories built from real
mission facts, listen to them read aloud, leave tributes on a memorial wall, and
test their knowledge in a quiz. By combining public NASA imagery and mission data
with emotional storytelling, the project turns distant hardware into human
stories — and asks what responsible exploration means for the future.

---

## Detailed Project Description

**What it does.** The site is a single-page scrollytelling experience. A hero
drops visitors onto a starfield; an interactive Moon/Mars map shows clickable pins
at approximate landing sites; sixteen artifact cards (Apollo descent stages and
rovers, ALSEP stations, Surveyor 3, the MET cart, golf balls, Viking landers,
Pathfinder/Sojourner, Spirit, Opportunity, Phoenix, InSight, and Ingenuity) each
tell a first-person story with key facts, a last-signal timestamp, and links to
NASA sources. A filterable "Then vs. Now" timeline spans 1967–2024. A "Why it
matters" section covers space heritage, site preservation, debris, and planetary
protection. Visitors can hear stories read aloud (Web Speech API), write one-line
epitaphs on an in-memory memorial wall, and take a six-question quiz generated
from the same dataset.

**How it works.** Pure HTML/CSS/vanilla JS — no build step, no backend, no API
keys. At runtime the app fetches `data/artifacts.json`, then queries the public
NASA Image and Video Library API for each artifact (6-second timeout, in-memory
cache, credit + link back). When offline or on failure it falls back to original
SVG illustrations. The map is drawn on canvas; pins use approximate
coordinates clearly labeled as such.

**Benefits.** Makes space exploration tangible and emotional for students and the
public; teaches mission history through narrative rather than datasheets; models
responsible data use (public APIs, attribution, graceful degradation); is fully
offline-capable and accessible.

**Goals.** Inspire curiosity about past missions, foster respect for off-world
heritage sites, and prompt reflection on what future explorers should leave
behind.

**Tools used.** Hand-written HTML5, CSS3 (custom properties, responsive grid),
vanilla JavaScript (ES2020), Canvas 2D, Web Speech API, NASA public APIs.
Developed with AI-assisted drafting (disclosed); reviewed by the team.

---

## Use of Super Intelligence (SI)

The project concept, structure, and editorial direction came from the team. AI
(Windsurf/Claude) was used to assist with: drafting the first-person story text
from factual bullet points the team supplied, generating the initial code scaffold
for the static site, and helping phrase quiz questions and explanations from the
artifact dataset. All AI-assisted content was reviewed, edited, and fact-checked
by the team against the cited NASA sources before inclusion. No AI-generated
images were used; all visuals are original SVG or credited NASA public-domain
imagery.

---

## NASA Data

Data used, exactly as described:

1. **NASA Image and Video Library API** —
   `https://images-api.nasa.gov/search?q=<term>&media_type=image` queried at
   runtime for each artifact; images displayed with credit and a link to the
   corresponding `images.nasa.gov` asset page. Results cached in memory only.
2. **NASA NSSDC Master Catalog** — used to verify mission dates, spacecraft
   identities, and general location context for the artifact entries.
3. **NASA LRO / LROC** — Apollo landing-site imagery referenced for location
   context (linked, not hotlinked beyond the Image Library).
4. **NASA mission pages** — Apollo program, Surveyor, Viking, Mars Pathfinder,
   Mars Exploration Rovers (Spirit/Opportunity), Phoenix, InSight, and Mars
   2020/Ingenuity project histories, used to verify facts and write stories.

No credentials, scraping, or non-public endpoints were used. Where a fact could
not be confirmed with high confidence, the story text was phrased generally and
the artifact's `sourceNote` flags it for verification.

---

## Space Agency Partner Data and Other References

- NASA Image and Video Library API (images-api.nasa.gov)
- NASA NSSDC Master Catalog (nssdc.gsfc.nasa.gov)
- NASA Lunar Reconnaissance Orbiter / LROC
- NASA mission history pages (nasa.gov)
- Fonts: system font stack only (no external fonts)
- Libraries/frameworks: none — plain HTML, CSS, vanilla JS
- All illustrations: original SVG created for this project

---

## Links

- **Link to Project Demo:** [PASTE GITHUB PAGES / NETLIFY URL HERE]
- **Link to Final Project:** [PASTE REPO OR FINAL URL HERE]

---

## Pre-submission checklist

- [ ] Links are public — no login required to view the demo
- [ ] Site tested in a private/incognito window (caches cleared)
- [ ] English only across all content
- [ ] No images, voices, or likenesses of people under 18
- [ ] No NASA logos, insignia, or mission patches anywhere
- [ ] Disclaimer present: "Unofficial, created for the NASA Space Apps
      Challenge. Not affiliated with or endorsed by NASA."
- [ ] AI-assistance disclosure present in README and site footer
- [ ] Clicked **"Submit for Judging"** before Sunday Nov 15, 11:59 pm local
      event time
- [ ] (Optional) Requested FortiGuard web-filter classification for the new
      website so judges can reach it
