"""
Vercel Serverless Function entry point for KisanMarg.
"""

import sys
import os

# Add root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.app import app

# Vercel looks for 'app' or handler
handler = app
