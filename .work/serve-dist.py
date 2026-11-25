import http.server, os, sys
from urllib.parse import unquote, urlparse

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else 'dist/client')
PORT = int(sys.argv[2] if len(sys.argv) > 2 else 4322)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)
    def translate_path(self, path):
        clean = unquote(urlparse(path).path)
        full = os.path.join(ROOT, clean.lstrip('/'))
        if os.path.isdir(full):
            idx = os.path.join(full, 'index.html')
            if os.path.exists(idx):
                return idx
        for candidate in (full, full + '.html', os.path.join(full, 'index.html')):
            if os.path.isfile(candidate):
                return candidate
        return full
    def log_message(self, *a):
        pass

http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()