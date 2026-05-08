# syntax=docker/dockerfile:1.6
#
# Hugging Face Space Docker build for myPSD.
#
# Two stages:
#   1. node:20-alpine   → compile the Vite React SPA
#   2. python:3.11-slim → install rustmatrix from PyPI + FastAPI, run uvicorn
#
# HF Spaces routes external traffic to whatever port the container listens
# on via `app_port` in README.md — we use 7860 (the HF default).

# ---------- stage 1: build the SPA ----------
FROM node:20-alpine AS spa
WORKDIR /spa
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
# Vite outDir in our config points to ../backend/app/static — we don't want
# that path layout inside this stage, so override to /spa/dist here.
RUN npx vite build --outDir dist --emptyOutDir


# ---------- stage 2: runtime ----------
FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir \
        "rustmatrix>=2.1.1" \
        "fastapi>=0.110" \
        "uvicorn[standard]>=0.27" \
        "pydantic>=2.6" \
        "numpy>=1.23" \
        "scipy>=1.10"

# HF Spaces runs the container as uid 1000 with /tmp as the only writable
# directory by default.
ENV HOME=/tmp \
    XDG_CACHE_HOME=/tmp/.cache

COPY backend/app /app/app
COPY --from=spa /spa/dist /app/app/static
# Also make the repo-level assets discoverable (logo/icon) for non-bundled use.
COPY assets /app/app/static/assets

EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
