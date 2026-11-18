"""Exercise real MkDocs builds, legacy restoration and exact compatibility bytes."""
from html.parser import HTMLParser
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
from build import build, REPO, PAGES

class ManualPage(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.palettes = []
        self.stylesheets = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'input' and attrs.get('name') == '__palette':
            self.palettes.append(attrs)
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.stylesheets.append(attrs['href'])


def check_manual(site):
    # Inspect every curated route, rather than just the configuration: a theme
    # upgrade must still emit usable palette controls and local styling assets.
    pages = ['index'] + PAGES
    for page in pages:
        for suffix in ['', '.zh-CN']:
            route = '' if page == 'index' and not suffix else page + suffix
            path = site / route / 'index.html'
            html = path.read_text()
            parsed = ManualPage(html)
            assert len(parsed.palettes) == 3, path
            assert [p.get('data-md-color-scheme', '') for p in parsed.palettes] == ['default', 'default', 'slate'], path
            assert [p['data-md-color-media'] for p in parsed.palettes] == [
                '(prefers-color-scheme)', '(prefers-color-scheme: light)',
                '(prefers-color-scheme: dark)'], path
            assert [p['aria-label'] for p in parsed.palettes] == [
                'Switch to light mode', 'Switch to dark mode',
                'Switch to system preference'], path
            assert 'data-md-component="search"' in html, path
            assert 'data-md-component="top"' in html, path
            assert 'fonts.googleapis.com' not in html, path
            assert parsed.stylesheets, path
            for asset in parsed.stylesheets:
                assert not asset.startswith(('http:', 'https:', '//')), asset
                assert (path.parent / asset).is_file(), asset
    search = json.loads((site / 'search/search_index.json').read_text())
    assert any(d['location'].startswith('index.zh-CN/') for d in search['docs'])
    assert any(d['location'].startswith('editorial-setup/') for d in search['docs'])


# The only publisher defaults to documentation; collection requires explicit refresh.
workflow = (REPO / '.github/workflows/daily-pages.yml').read_text()
assert 'default: docs' in workflow
assert "if: inputs.mode == 'refresh'" in workflow
assert 'schedule:' not in workflow
assert 'group: daily-pages-production' in workflow

with tempfile.TemporaryDirectory(prefix='editorial-manual-test-') as temporary:
    root = Path(temporary)
    state, site = root / 'state', root / 'site'
    subprocess.run(['node', str(REPO / 'scripts/daily-brief/build.ts'), '--fixture', '--out', str(state)], check=True)
    # Include a historical date and noncompact JSON; documentation must not
    # reinterpret edition freshness or compact/reformat an existing JSON archive.
    editions = json.loads((state / 'editions.json').read_text())
    historical = dict(editions[0], date='2025-01-02')
    editions.append(historical)
    (state / 'editions.json').write_text(json.dumps(editions, ensure_ascii=False, indent=1) + '\n')
    for locale in ['en', 'zh-CN']:
        current = state / f"{editions[0]['date']}.{locale}.html"
        (state / f"2025-01-02.{locale}.html").write_text(current.read_text().replace(editions[0]['date'], '2025-01-02'))
    preserved = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in state.iterdir() if p.name not in ['index.html', '.nojekyll']}
    build(state, site)
    for name, digest in preserved.items():
        assert hashlib.sha256((site / name).read_bytes()).hexdigest() == digest, name
    assert 'AI Editorial manual' in (site / 'index.html').read_text()
    check_manual(site)
    assert (site / 'index.zh-CN/index.html').exists()
    assert not list(site.rglob('AGENTS*'))
    assert not (site / 'superpowers').exists()
    legacy = root / 'legacy'
    legacy.mkdir()
    (legacy / 'editions.json').write_bytes((state / 'editions.json').read_bytes())
    build(legacy, root / 'legacy-site')
    for name, digest in preserved.items():
        assert hashlib.sha256((root / 'legacy-site' / name).read_bytes()).hexdigest() == digest, 'legacy ' + name
    empty = root / 'empty'
    empty.mkdir()
    try:
        build(empty, root / 'empty-site')
    except FileNotFoundError:
        pass
    else:
        raise AssertionError('Missing archive must stop deployment')
print('Manual builds preserve v1 bytes and legacy history; missing state fails closed')
