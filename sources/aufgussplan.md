# The Aufguss plans

**Source:** <https://www.baederland.de/wellness/aufgussplaene/> and the eight PDFs it links
**Fetched:** 8 September 2026 (the plans themselves are stamped "Stand: 05/2026")
**Result:** `src/data/themes.js` — 62 themes

## The one the brief named

<https://www.baederland.de/media/kaifu-bad_aufgussplan_web.pdf>

It is a single A0 poster and it covers **one day**: Kaifubad, Sauna 90 °C,
**Dienstag**, marked *Frauensauna*. Seven slots:

| time | theme | kind | intensity |
|---|---|---|---|
| 12:00 | Auffrischende Brise | Ätherische Öle | mittel |
| 14:00 | Aufkommende Winde | Ätherische Öle | mittel |
| 16:00 | Fruchtbasar | Ätherische Öle | mittel |
| 18:00 | Aroma | Inhalation | sanft |
| 19:00 | Waldfunkeln | Intensiv heisser Aufguss | **stark** |
| 20:00 | Plauderwind | Klönschnack-Aufguss | mittel |
| 21:00 | Aroma | Inhalation | sanft |

Footnote on the poster: *"Bei sehr guter Wetterlage und verstärktem
Personaleinsatz im Sommerfreibad können Aufgüsse zeitweilig entfallen."*

**No plan for the other six days is published anywhere on baederland.de.** The
brief says "we have them every full hour", which this one day does not show, so
the app treats a theme as a name you pick and a time as any full hour you like —
the plan supplies the vocabulary, not the timetable.

## How the intensity was read

The intensity is not text. It is a coloured icon at the end of each row, and the
legend at the foot of every plan reads:

- 🟡 yellow, one wave — **Sanfter Aufguss**
- 🟠 orange, two waves — **Mittlerer Aufguss**
- 🔴 red, three waves — **Starker Aufguss**

The text on these posters is partly converted to outlines, so `pdftotext` gets
about 570 characters out of the Kaifubad one and no icons at all. What worked:
render the page and read it, then — having seen what the answer should be —
extract the filled circles with their fill colours through PyMuPDF's
`get_drawings()`, match each against the three legend colours

```
(0.976, 0.823, 0.025) → sanft
(0.951, 0.562, 0.000) → mittel
(0.913, 0.310, 0.035) → stark
```

and pair each with the nearest time label to its left. The Kaifubad rows the
extractor produced are identical to the rows read off the rendered image, which
is why the same extractor was then trusted for the other seven houses.

## The other seven houses

Bäderland publishes a plan per sauna and they share a house style, a legend and
a vocabulary, so all of them are in the catalogue — a theme is a good name for a
scent whichever sauna thought of it. Each theme carries the house it came from.

| house | PDF | themes |
|---|---|---|
| Alsterschwimmhalle | `88-1-26-13_alsterschwimmhalle_aufgussplan_3840x2160px.pdf` | 7 |
| Bartholomäustherme | `88-1-26-13_bartholomaeustherme_aufgussplan_a1_hf.pdf` | 8 |
| Billebad | `88-1-26-13_bille-bad_aufgussplan_a0_qf.pdf` | 9 |
| Blankenese | `88-1-26-13_blankenese_aufgussplan_a2_hf.pdf` | 9 |
| Bondenwald | `88-1-26-13_bondenwald_aufgussplan_a0_qf.pdf` | 9 |
| Festland | `88-1-26-13_festland_aufgussplan_a1_qf_ansicht.pdf` | 8 |
| Parkbad | `88-1-26-13_parkbad_aufgussplan_a1_qf.pdf` | 6 |

All under `https://www.baederland.de/media/`.

## The four themes that name their own oil family

Blankenese labels its slots by aroma family rather than by kind, and those four
labels are the only place in any of these plans where a theme says what goes in
it. They are carried into `themes.js` as `families`, and the app uses them to
pre-filter the oil search when that theme is picked:

| theme | label on the plan | families |
|---|---|---|
| Waldspaziergang | HOLZAROMEN | Woody, Conifers |
| Obstmarkt | FRUCHTAROMEN | Citrus |
| Kräutergarten | KRÄUTERAROMEN | Herbal |
| Frische Brise | MINZAROMEN | Fresh |
| Sommerabend | FRUCHT- ODER KRÄUTERAROMEN | Citrus, Herbal |

Every other theme gets an empty `families`. **Nothing was inferred from a
theme's name** — "Waldfunkeln" sounds like wood and the plan does not say so, so
the app is quiet about it and lets the history do the suggesting instead.

## Kinds seen across the eight plans

`ÄTHERISCHE ÖLE` · `DUFTREISE MIT ÄTHERISCHEN ÖLEN` · `INTENSIV HEISSER AUFGUSS` ·
`INHALATION` · `KLÖNSCHNACK-AUFGUSS` · `NATURSUDE` · `NATURSUD BIRKE` ·
`AUFGUSS-PEELING-KOMBINATION` · `EVENTAUFGUSS` · `KLANGAUFGUSS` ·
`MEDITATIVER SOUNDMIX` · `HOLZAROMEN` · `FRUCHTAROMEN` · `KRÄUTERAROMEN` ·
`MINZAROMEN` · `VARIIERENDE AROMEN` · `FRUCHT- ODER KRÄUTERAROMEN`

## Re-checking

A plan is stamped with a month and will move. `node tools/check-sources.mjs`
re-fetches the Kaifubad PDF and reports whether its rows still match.
