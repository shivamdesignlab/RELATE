# RELATE project site

A static, multi-page site for *RELATE: An Evaluation Framework for Measuring Relational Orientation of Large Language Models*. Plain HTML, CSS and JavaScript, with no build step and no external requests (fonts are self-hosted).

## Pages

| File | What it holds |
|---|---|
| `index.html` | Overview: opening film with the title layered on it, the reply demo, the two dimensions, three headline findings, scale, BibTeX |
| `framework.html` | Construct, taxonomy derivation, rubric explorer, three-stage pipeline, models and settings |
| `findings.html` | All results charts: across models, turns, user styles, judge sensitivity, scope |
| `people.html` | Author cards (photo placeholders, roles, affiliations, emails), acknowledgments with links |
| `paper.html` | Abstract, contributions, code and data, reproducibility, ethics, BibTeX |

## Preview locally

Open `index.html` in a browser, or serve the folder so fonts load exactly as they will online:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Add portraits

Drop photos into `assets/people/` with these names (4:5 crop, about 800 x 1000 px):

- `shivam-shukla.jpg`
- `jihye-kim.jpg`
- `shubham-gaur.jpg`
- `mahnaz-roshanaei.jpg`
- `magy-seif-el-nasr.jpg`

Until a file exists, the page shows a watercolor tile with initials. To use another format (for example `.png` or `.webp`), change the matching `src` in `people.html`.

## Opening video

The homepage opens with a muted, looping film that runs from the very top of the page, behind a transparent navigation bar. The title, summary, buttons and authors sit as a layer on the film's empty left side. On phones and portrait tablets the film becomes a band at the top and the same content follows directly below it, so nothing covers the animation.

Files in `assets/video/`:

- `relate-loop-1080.mp4` for wide screens, `relate-loop-720.mp4` for smaller screens, `relate-loop-720.webm` as a fallback for browsers without H.264
- `relate-loop-poster.webp` shows while the video loads, and stays as a still image for visitors who have reduced motion turned on

To swap the film, replace those files using the same names. Keep it 16:9 with the left 40% or so free of important content, because that is where the title sits. There is no visible play/pause button; a pause control appears only when someone reaches it with the keyboard (Tab), and the film rests while scrolled off screen.

## Common edits

- **Numbers in charts:** `assets/js/data.js` (each block notes the paper table it came from).
- **Paper links:** the "Read the paper" button (Overview), the "View paper" button (Paper page) and the footer "Paper (arXiv)" link all point to `https://arxiv.org/pdf/2610.09569`. `relate-paper.pdf` is no longer linked from any page.
- **BibTeX:** appears on `index.html` and `paper.html`, each twice: the visible block (one `<span>` per line) and a hidden `<pre id="bibtex-src">` that the Copy button copies. Edit both.
- **Colors and type:** tokens at the top of `assets/css/style.css`. Coral marks inward-facing, cobalt marks outward-scaffolding, rose marks sentences that are both.
- **Social previews:** `og:image` uses a relative path. After deploying, change it to the full URL (for example `https://your-domain/assets/img/og-image.jpg`) in each page's `<head>`.

## Deploy

Any static host works. For GitHub Pages: push this folder to a repository, then enable Pages for the branch in Settings.

## Credits

Fonts: Hedvig Letters Serif and Ysabeau Office, both under the SIL Open Font License (see `assets/fonts/`). Hero artwork: "Quiet convergence of light".
