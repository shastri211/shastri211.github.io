# Portfolio

Source for [shastri211.github.io](https://shastri211.github.io): the portfolio of Chavi Shastri, a software engineering student working on backend and retrieval systems around language models.

The site is built around one rule: nothing is published without the evidence for it. Every number carries its source and its limits, every claim about code links to a file at a pinned commit, and the build fails when a case study skips a required section or a skill has no project behind it.

## Stack

| Piece                                      | Why it is here                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| [Astro](https://astro.build) 7, TypeScript | Static HTML with no client-side framework. The site is mostly reading, so it should load fast and work without JavaScript. |
| `@astrojs/mdx`                             | Case studies are long-form prose with a few components inside.                                                             |
| `@astrojs/sitemap`                         | `sitemap-index.xml` for search engines.                                                                                    |
| zod (bundled with Astro)                   | Typed schemas for every content collection.                                                                                |
| `sharp`, dev only                          | Resizes the touch icon in `scripts/make-assets.mjs`.                                                                       |
| `@astrojs/check`, `typescript`, `prettier` | Type checking and formatting.                                                                                              |

There is no UI framework, CSS framework, animation library or icon package. Page transitions and scroll reveals are plain CSS and are disabled under `prefers-reduced-motion`. Three small inline scripts (about 1 KB in total) handle the theme toggle and the contents highlight.

Fonts are Newsreader and IBM Plex Mono, self-hosted as Latin-only `woff2` files in `public/fonts/` with their licences. They were copied from the Fontsource packages, which are not needed at build time.

## Structure

```
src/
  content/
    projects/        one MDX file per case study, with typed frontmatter
    data/            skills, experience and certifications as JSON
  content.config.ts  the schemas that decide what can be published
  data/              identity, links, education and the journey
  components/        case-study building blocks, home page pieces, header and footer
  layouts/           base layout and the case-study layout
  lib/               case-study rules, skills grouping, GitHub activity, resume check
  pages/             home, work, about, 404 and the case-study route
  styles/            tokens.css, base.css, prose.css
scripts/             contrast check, link check, asset and snapshot generators
.github/workflows/   CI and deployment
```

## Run it locally

Node 22.12 or newer.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # type check, then static build into dist/
npm run preview    # serve dist/ locally
```

## Checks

```bash
npm run build           # astro check, then the build, which also enforces the content rules
npm run check:contrast  # WCAG AA contrast for every text colour pair, in both themes
npm run check:links     # run after a build: internal links, external links, and GitHub permalinks
```

The link check does more than test for a 200. For a link such as `.../blob/<sha>/path#L21-L74` it fetches the file at that commit and confirms it really has that many lines. Set `GITHUB_TOKEN` to avoid the unauthenticated rate limit.

CI runs the build and both checks on every push and pull request, and once a week.

## Adding or editing content

**A project** is a file in `src/content/projects/`. Its frontmatter is validated by `src/content.config.ts`, and its body is split into `<Section id="..." title="...">` blocks.

- Every entry in `metrics` needs a `source` and a `caveat` of real length.
- Every entry in `evidence` pairs a claim with what backs it, ideally a permalink to a file at a commit.
- `notClaimed` must not be empty.
- A `flagship`, `project` or `meta` entry needs all ten sections: context, objective, approach, architecture, engineering, challenges, trade-offs, result, evidence, reflection. A `collaboration` entry needs six. See `src/lib/case-study.ts`.
- YAML trap: a colon followed by a space inside an unquoted value turns it into a key. Quote any value that contains one.

**A skill** is an entry in `src/content/data/skills.json`. Its `usedIn` must reference at least one project, so a technology cannot be listed without a project that used it.

**Identity, links and the journey** live in `src/data/site.ts` and `src/data/profile.ts`.

**The resume link** appears only if `public/Chavi-Shastri-Resume.pdf` exists.

## Generated assets

```bash
npm run make:assets        # social card and touch icon, rendered with headless Chrome
npm run snapshot:activity  # refresh the offline copy of the "latest commits" list
```

`make:assets` needs Chrome or Edge, or `CHROME_PATH` pointing at one.

## Deployment

The `Deploy` workflow publishes `dist/` to GitHub Pages on every push to `main` and weekly. In the repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**. The weekly run refreshes the latest-commits list, which is read from the GitHub API at build time and falls back to the committed snapshot if the API is unreachable.

## Privacy

No phone number, no photo and no analytics. The contact address is the only personal detail on the pages. Screenshots, when added, must come from synthetic data.
