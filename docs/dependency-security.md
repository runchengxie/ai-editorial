# Dependency security status

[简体中文](dependency-security.zh-CN.md)

On 18 November 2026, npm's latest published picomatch was 4.0.7. The [official advisory](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) lists versions through 4.0.7 as affected and no patched release. Current Vite/tinyglobby/fdir ranges accept this major but cannot select a nonexistent fixed version. The full development install reports five high-severity dependency nodes in that chain. Suggested automatic fixes cross major versions backwards; no downgrade, override or audit suppression was applied.

This finding remains open for development tooling. Update the lockfile in a task branch once a compatible patched version exists, then rerun type/build/browser and publication checks. Do not equate a successful install with a clean audit.

The local magazine installer omits development dependencies. An isolated archive installation proved the worker generation modules import successfully without Vite or picomatch, and `npm audit --omit=dev` reported zero findings. CI repeats this production-only check. This reduces the installed worker's dependency exposure; it does not claim the source development toolchain advisory has been fixed. The separate static reader also had zero audit findings in the preceding audit.
