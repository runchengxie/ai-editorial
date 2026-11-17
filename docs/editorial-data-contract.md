# Editorial data contract

- Source: CODE_ROOT/ai-editorial; task worktrees resolve to this owning repository.
- Persistent runtime data: DATA_ROOT/ai-editorial/runtime/.
- PostgreSQL clusters: DATA_ROOT/ai-editorial/postgres/ for an explicitly provisioned internal instance; evaluation-only clusters may live inside their evaluation task directory.
- Evaluation records: DATA_ROOT/ai-editorial/evaluations/<explicit-task-id>/, containing the source revision, commands, results, corpus labels and cost observations.
- Manual exports: DATA_ROOT/ai-editorial/exports/<explicit-task-id>/ unless downloaded to an editor-selected location.
- Authoritative secrets: CONFIG_ROOT/projects/ai-editorial/, never source control or exports. Refer to the existing credential rather than duplicate it.
- Local test scratch files may use a task-specific temporary directory. Tests must refuse authoritative database names.

Do not update shared `latest`/`current` pointers implicitly. Inventory existing files, links, running jobs and downstream references before changing any existing data. Source articles and editorial history are separate: discarding a topic does not delete its evidence. Internal notes are never included in exported drafts or upstream publication records.

- Public daily v1 metadata: produced by this repository, retained in its successful `daily-public-state` workflow artifacts and served at the existing Pages data endpoint. The separate ai-editorial-pages repository consumes this published contract; it does not own or copy authoritative raw source inputs. Reader build outputs/evaluations belong under DATA_ROOT/ai-editorial-pages/.

- Magazine worker: DATA_ROOT/ai-editorial/magazine/ (private evidence packets, public library, CLI diagnostics); immutable runtime source releases under DATA_ROOT/ai-editorial/releases/<revision>/; dedicated persistent PostgreSQL under DATA_ROOT/ai-editorial/postgres/. Local worker configuration remains under CONFIG_ROOT/projects/ai-editorial/. Public v2 assets live in the project release container, separate from Git source history.
