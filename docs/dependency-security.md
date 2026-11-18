# Dependency security status

[简体中文](dependency-security.zh-CN.md)

As of 19 November 2026, the full development audit and the production-only audit both report zero findings. The [official picomatch advisory GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) was withdrawn on 18 November 2026. The previous five high-severity dependency nodes in the Vite chain no longer appear in npm's audit response. This is an advisory status change, not a dependency patch.

The registry still reports picomatch 4.0.7 as its latest release; the advisory lists no patched release. The installed chain remains Vite 8.3.3, tinyglobby 0.2.17, fdir 6.5.0 and picomatch 4.0.7. No downgrade, dependency override or audit suppression was added. The [maintainer discussion](https://github.com/micromatch/picomatch/pull/235) disputes the vulnerability classification and warns against accepting untrusted regular-expression patterns. Withdrawal does not establish that every possible glob pattern is safe.

Verification on 19 November 2026 used Node.js 24.22.2 and the lockfile at source revision `64c3e75f1541c361e79fc92aaabff7545cdc015b`:

- `npm view picomatch version dist-tags --json`: latest 4.0.7.
- `npm ls picomatch vite tinyglobby fdir --all`: the versions above.
- `npm audit --json`: exit 0, zero findings across all severity levels.
- `npm audit --omit=dev --json`: exit 0, zero findings across all severity levels.

The local magazine installer omits development dependencies. An earlier isolated archive installation proved the worker generation modules import successfully without Vite or picomatch; CI repeats the production-only audit. Keep running both audit scopes when reviewing dependency security: installation success alone does not establish security status, and a zero-finding audit reflects the advisory database at the time of the check. The separate static reader had zero audit findings in the preceding audit; it was not re-audited in this engine-only follow-up.
