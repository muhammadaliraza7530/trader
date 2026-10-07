# Vercel entry point for the Flask application.
# The existing app.py remains the single source of route definitions.
from app import app


# Vercel's Python runtime expects a WSGI application named "app".
# The project-level vercel.json routes all requests to this function.
