# syntax=docker/dockerfile:1.6
#
# Hugging Face Space Docker build for myPSD.
#
# Three stages:
#   1. node:20-alpine      → compile the Vite React SPA
#   2. rust:1.82-slim      → clone rustmatrix at v1.0.1 and build a Python wheel
#   3. python:3.11-slim    → install the wheel + FastAPI, copy the SPA, run uvicorn
#
# HF Spaces routes external traffic to whatever port the container listens
# on via `app_port` in README.md — we use 7860 (the HF default).

# ---------- stage 1: build the SPA ----------
FROM node:20-alpine AS spa
WORKDIR /spa
COPY frontend/package.json frontend/package-lock.json* frontend/.npmrc ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
# Vite outDir in our config points to ../backend/app/static — we don't want
# that path layout inside this stage, so override to /spa/dist here.
RUN npx vite build --outDir dist --emptyOutDir


# ---------- stage 2: build the rustmatrix wheel ----------
FROM rust:1.82-slim AS rustbuild

RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 python3-pip python3-venv python3-dev \
        build-essential pkg-config git \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install --break-system-packages "maturin==1.7.*"

WORKDIR /src
# Pin to the stable release so HF deploys are reproducible.
ARG RUSTMATRIX_REF=v1.0.1
RUN git clone --depth 1 --branch ${RUSTMATRIX_REF} \
        https://github.com/swnesbitt/rustmatrix.git .
RUN maturin build --release --out /wheels -i python3


# ---------- stage 3: runtime ----------
FROM python:3.11-slim

WORKDIR /app

COPY --from=rustbuild /wheels /wheels
RUN pip install --no-cache-dir /wheels/*.whl \
 && pip install --no-cache-dir \
        "fastapi>=0.110" \
        "uvicorn[standard]>=0.27" \
        "pydantic>=2.6" \
        "numpy>=1.23" \
        "scipy>=1.10" \
 && rm -rf /wheels

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
