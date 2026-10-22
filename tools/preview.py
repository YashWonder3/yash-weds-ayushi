# Rebuilds preview.html (a single file you can open straight from disk) from the Hugo build.
import re, sys
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
for d in ['css', 'js', 'images', 'videos']:
    s = s.replace(f'"/{d}/', f'"static/{d}/').replace(f"'/{d}/", f"'static/{d}/")
s = re.sub(r'\n\s*\n+', '\n', s)
s = s.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- Generated from data/story.yaml + layouts/index.html by `make preview`. Do not edit by hand. -->', 1)
open(out, 'w', encoding='utf-8').write(s)
