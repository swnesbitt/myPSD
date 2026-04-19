---
title: myPSD
emoji: 🌧️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

<p align="center">
  <img src="assets/logo.svg" alt="myPSD" width="640" />
</p>

# myPSD

Interactive explorer for polarimetric radar observables derived from a
normalized-gamma particle-size distribution (Testud et al. 2001). Drag the
sliders to vary `Dm`, `log₁₀Nw`, and `μ`; pick a radar wavelength (S / C / X),
canting-angle standard deviation, and precipitation type (rain or hail) to see
the resulting N(D) curve and 11-metric polarimetric table update live.

This is a port of [`swnesbitt/bokeh-myPSD`](https://github.com/swnesbitt/bokeh-myPSD)
rebuilt on:

- **[rustmatrix](https://github.com/swnesbitt/rustmatrix)** — Rust-backed
  T-matrix scattering (drop-in `pytmatrix` replacement)
- **FastAPI** — thin JSON API over the scatterer
- **React + Vite + Plotly.js** — interactive single-page frontend
- **Docker on Hugging Face Spaces** — deployment

Branded with the [CLIMAS](https://climas.illinois.edu/) group icon.

## Local development

### Backend

```bash
cd backend
uv venv
uv pip install -e .
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

The Vite dev server proxies `/api` to `localhost:8000`. Production builds
output to `backend/app/static/`, which FastAPI serves from the same origin.

### Docker (simulates HF Spaces)

```bash
docker build -t mypsd .
docker run --rm -p 7860:7860 -e HOME=/tmp mypsd
# open http://localhost:7860
```

## Attribution

- **myPSD** concept & original Bokeh app: Steve Nesbitt, University of
  Illinois Urbana-Champaign.
- **pytmatrix** (the original T-matrix Python wrapper): Jussi Leinonen,
  MeteoSwiss.
- **rustmatrix**: Rust port of the pytmatrix numerical core.
