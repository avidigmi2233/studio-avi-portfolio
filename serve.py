import functools, http.server, socketserver, os
ROOT = "/Users/avidigmi/Desktop/Claude/Projects/אתר תיק עבודות אבי/site"
os.chdir(ROOT)
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class S(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
S(("127.0.0.1", 4321), H).serve_forever()
