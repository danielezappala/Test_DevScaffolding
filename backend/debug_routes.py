import sys
import os
from fastapi import FastAPI

# Add the current directory to sys.path to make imports work
sys.path.append(os.getcwd())

from app.main import app

print("Registered Routes:")
for route in app.routes:
    if hasattr(route, "path"):
        print(f"{route.methods} {route.path}")
    else:
        print(f"Mounted: {route.path}")
