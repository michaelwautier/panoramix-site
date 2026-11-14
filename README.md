# Panoramix – restaurant website

Static website for Restaurant Panoramix (Saint-Leu, La Réunion): hero, short menu, opening hours, access and social links.

No build step: plain HTML, CSS and JavaScript.

## Structure

```
index.html        Page markup (French content), SEO meta and schema.org data
carte.html        Full menu with all prices (linked from "Voir la carte complète")
css/styles.css    Comic / lagoon theme, responsive (breakpoints at 720px and 480px)
js/main.js        Open/closed status and today's highlight, in La Réunion's time zone
assets/hero.svg   Hero illustration (west coast view from the counter)
assets/logo.svg   Logo icon, also used as favicon
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Deployment

Merging into `main` publishes the site on GitHub Pages through `.github/workflows/pages.yml` (Settings › Pages › Source: GitHub Actions).

## Opening hours

Edit both places when hours change:

- `OPENING_HOURS` in `js/main.js` (drives the open/closed status)
- the hours list and the `openingHoursSpecification` block in `index.html`

## TODO

- Real photos (view, dining room, Panoramix burger) in place of the striped placeholders
- Facebook page URL (search for `TODO` in `index.html`)
- Confirm prices (menu screenshots date from about a year ago)
