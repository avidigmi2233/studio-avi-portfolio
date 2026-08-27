"""שרת סטטי קל לאתר סטודיו אבי — עם תמיכה ב-HTTP Range (חובה לווידאו)."""
import functools, http.server, socketserver, os, re, sys, mimetypes

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4455
# 0.0.0.0 → נגיש גם מהנייד ברשת המקומית. להגבלה למחשב בלבד: 127.0.0.1
HOST = sys.argv[2] if len(sys.argv) > 2 else "0.0.0.0"
os.chdir(ROOT)

RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)")


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".mp4": "video/mp4",
        ".webp": "image/webp",
        ".woff2": "font/woff2",
        ".svg": "image/svg+xml",
        ".js": "text/javascript",
        ".css": "text/css",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def send_head(self):
        """כמו המקור, אבל מכבד Range כדי שהדפדפן יוכל לדלג בתוך הווידאו."""
        rng = self.headers.get("Range")
        if not rng:
            return super().send_head()

        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        size = os.fstat(f.fileno()).st_size
        m = RANGE_RE.match(rng.strip())
        if not m:
            f.close()
            self.send_error(400, "Bad Range")
            return None

        start_s, end_s = m.group(1), m.group(2)
        if start_s == "":                      # bytes=-N  → N האחרונים
            length = int(end_s or 0)
            start = max(0, size - length)
            end = size - 1
        else:
            start = int(start_s)
            end = int(end_s) if end_s else size - 1
        end = min(end, size - 1)
        if start > end or start >= size:
            f.close()
            self.send_response(416)
            self.send_header("Content-Range", "bytes */%d" % size)
            self.end_headers()
            return None

        ctype = self.guess_type(path)
        self.send_response(206)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        f.seek(start)
        self._range_remaining = end - start + 1
        return _Limited(f, self._range_remaining)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


class _Limited:
    """עוטף קובץ כך ש-copyfile ישלח רק את טווח הבתים המבוקש."""

    def __init__(self, fp, remaining):
        self.fp = fp
        self.remaining = remaining

    def read(self, n=-1):
        if self.remaining <= 0:
            return b""
        if n is None or n < 0 or n > self.remaining:
            n = self.remaining
        data = self.fp.read(n)
        self.remaining -= len(data)
        return data

    def close(self):
        self.fp.close()


H = functools.partial(Handler, directory=ROOT)


class S(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def lan_ip():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


if __name__ == "__main__":
    mimetypes.add_type("video/mp4", ".mp4")
    print("serving %s" % ROOT, flush=True)
    print("  מחשב:  http://127.0.0.1:%d" % PORT, flush=True)
    if HOST == "0.0.0.0":
        print("  נייד:  http://%s:%d" % (lan_ip(), PORT), flush=True)
    S((HOST, PORT), H).serve_forever()
