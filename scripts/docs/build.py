"""Build a curated manual and overlay only the existing public v1 compatibility files.

No collection, database, model or application imports. All generated files are external.
"""
import argparse
import json
import os
from pathlib import Path
import re
import sys
import subprocess
import tempfile
from urllib.parse import urlsplit

REPO = Path(__file__).resolve().parents[2]
READER = 'https://runchengxie.github.io/ai-editorial-pages/'
PAGES = ['editorial-setup', 'magazine', 'editorial-sources', 'daily-pages', 'manual-site', 'repository-layout']


def external(value):
    result = Path(value).resolve()
    if result == REPO or REPO in result.parents:
        raise ValueError('Generated output must be outside the repository')
    return result


def redirect(url):
    return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url={url}"><link rel="canonical" href="{url}"><title>AI Editorial</title></head><body><a href="{url}">{url}</a></body></html>'


def build(state, output):
    state, output = external(state), external(output)
    if output == state or output in state.parents or state in output.parents:
        raise ValueError('State and output must be separate directories')
    # Older successful artifacts contain editions.json only. Preserve its exact bytes;
    # reconstruct the deterministic compatibility files without creating a new edition.
    if output.exists() and any(output.iterdir()):
        raise ValueError('Output must be new or empty; MkDocs cleans its destination')
    archive = (state / 'editions.json').read_bytes()
    editions = json.loads(archive)
    if not isinstance(editions, list) or not editions:
        raise ValueError('A nonempty successful publication archive is required')
    for edition in editions:
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', edition['date']):
            raise ValueError('Invalid archive date')
    selected = {f'{p}{locale}.md' for p in PAGES for locale in ['', '.zh-CN']}
    selected.update(['index.md', 'index.zh-CN.md'])
    with tempfile.TemporaryDirectory(prefix='editorial-manual-') as temporary:
        stage = Path(temporary)
        for name in sorted(selected):
            source = REPO / 'docs' / name if not name.startswith('index') else REPO / 'docs/manual' / name
            def link(match):
                target = match.group(1)
                parsed = urlsplit(target)
                if parsed.scheme or target.startswith(('#', '/')):
                    return match.group(0)
                resolved = (source.parent / parsed.path).resolve()
                if resolved.name in selected and resolved.parent == REPO / 'docs':
                    replacement = resolved.name
                elif resolved in [REPO / 'docs/manual/index.md', REPO / 'docs/manual/index.zh-CN.md']:
                    replacement = resolved.name
                else:
                    replacement = 'https://github.com/runchengxie/ai-editorial/blob/main/' + resolved.relative_to(REPO).as_posix()
                if parsed.fragment:
                    replacement += '#' + parsed.fragment
                return '](' + replacement + ')'
            text = re.sub(r'\]\(([^\s)]+)\)', link, source.read_text())
            (stage / name).write_text(text)
        env = dict(os.environ, DOCS_STAGE=str(stage), DOCS_SITE=str(output))
        subprocess.run([sys.executable, '-m', 'mkdocs', 'build', '--config-file', str(REPO / 'configs/mkdocs.yml')], env=env, check=True)
    (output / 'editions.json').write_bytes(archive)
    latest = state / 'latest.json'
    (output / 'latest.json').write_bytes(latest.read_bytes() if latest.exists() else (json.dumps(editions[0], ensure_ascii=False, indent=2) + '\n').encode())
    for edition in editions:
        for locale in ['en', 'zh-CN']:
            name = f"{edition['date']}.{locale}.html"
            previous = state / name
            (output / name).write_bytes(previous.read_bytes() if previous.exists() else redirect(READER + name).encode())
    for name, fallback in [('zh-CN.html', redirect(READER + 'zh-CN.html')), ('feed.xml', f'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>AI Editorial</title><link>{READER}</link><description>{READER}feed.xml</description><item><title>AI Editorial RSS</title><link>{READER}feed.xml</link><guid>ai-editorial-pages-rss-migration</guid><description>{READER}feed.xml</description></item></channel></rss>')]:
        previous = state / name
        (output / name).write_bytes(previous.read_bytes() if previous.exists() else fallback.encode())
    (output / '.nojekyll').touch()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state', required=True, help='Successful public state directory')
    parser.add_argument('--out', required=True, help='External generated site directory')
    args = parser.parse_args()
    build(args.state, args.out)
