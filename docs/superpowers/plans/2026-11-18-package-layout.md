# Package layout implementation plan

Goal: group backend fonts, engine migrations and editorial features under their owning packages.

Approved scope: the directory layout proposed in the conversation; keep root npm manifests and English/Chinese README entries. Remove the obsolete README.en.md forwarding entry, with its link break documented.

- [x] Move fonts to packages/backend/assets/og-fonts and engine SQL to packages/backend/migrations without changing bytes.
- [x] Move editorial features to packages/editorial-*, preserving npm names and public contracts; update workspace links, TypeScript, routes, styles and composition.
- [x] Preserve migration history across only the established path mapping; reject changed/deleted SQL, wrong destinations and duplicate filenames.
- [x] Update English canonical layout and corresponding Chinese guidance; retain historical records.
- [ ] Run standalone, type, build, backend, web and daily contract checks, strict documentation build and independent review.
- [ ] Integrate a check-green reviewed PR and clean only this task's branch/worktree. Do not reinstall the worker, migrate production or publish sites.
