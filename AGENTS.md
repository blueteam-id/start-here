## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## This project

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before adding or editing tracks or
  lessons: it has the content standard (plain English, short sentences,
  hands-on only in a practice folder or lab VM, no em dashes) and the
  checklist of files a new track needs.
- `npm test` and `npm run verify` must pass. Site search only works on a
  built site (`npm run build` then `npm run preview`), not in `astro dev`.
- Lab files in `public/labs/` are generated: edit
  `scripts/labs/build_labs.py` and rerun it instead of editing the files.
- Never invent facts, commands, links, or quotes in lesson content. Run the
  commands where possible and open every resource link before adding it.

