"""קיצור דרך: מריץ את שרת האתר שיושב ב-local-site/serve.py.

השרת האמיתי (כולל תמיכת HTTP Range, שחובה לניגון וידאו) נמצא שם.
    python3 serve.py [port] [host]
"""
import os
import runpy
import sys

TARGET = os.path.join(os.path.dirname(os.path.abspath(__file__)), "local-site", "serve.py")
sys.argv = [TARGET] + sys.argv[1:]
runpy.run_path(TARGET, run_name="__main__")
