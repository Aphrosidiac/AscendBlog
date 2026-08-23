# Font substitution — decided empirically, not by eye

Measured in-page on medium.com where `sohne` is actually loaded, using
canvas measureText advance width + actualBoundingBox ascent.
Test string: "Best Mac Note-Taking Apps handgloves 0123" @ 700 42px.

| candidate | advance (px) | delta vs sohne | cap-h (Hx@100) | x-height (x@100) |
|---|---|---|---|---|
| **sohne (target)** | **868.2** | — | **72** | **52** |
| Instrument Sans | 887.9 | **+2.3%** | **72** | **51** |
| Archivo | 901.6 | +3.8% | 69 | 53 |
| Schibsted Grotesk | 912.6 | +5.1% | 70 | 53 |
| Inter | 928.5 | +6.9% | 73 | 55 |

## Decisions
| Medium font | role | Ascend substitute | licence | note |
|---|---|---|---|---|
| `sohne` | UI + story titles | **Instrument Sans** | OFL | closest on all 3 metrics; Inter would run 6.9% wide and break headline wraps |
| `source-serif-pro` | article body | **Source Serif 4** | OFL | SAME typeface — exact match, not a substitute |
| `noe` | wordmark | **Outfit** | OFL | Ascend's existing brand display face (matches ascendpeptides.my) |
| `gt-super` | display serif | **Newsreader** | OFL | only used on marketing pages |
| `opendyslexic` | a11y option | **OpenDyslexic** | OFL | already free — exact |

Brand recolour: Medium green `#1a8917` -> Ascend near-black `#0A0A0A` (from AscPeps globals.css).
Everything else in the palette is already neutral and carries over unchanged.
