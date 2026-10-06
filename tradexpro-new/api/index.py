# Vercel entry point for the Flask application.
# The existing app.py remains the single source of route definitions.
from pathlib import Path
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app import app


# Vercel's Python runtime expects a WSGI application named "app".
# The project-level vercel.json routes all requests to this function.
