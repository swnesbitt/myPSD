"""FastAPI entry point for myPSD.

In production the compiled React SPA is baked into `app/static/` by the
Dockerfile, and this process serves both `/api/*` and the SPA. In local
dev, Vite serves the SPA from its own port and proxies `/api/*` here.
"""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import scatter
from .models import ComputeRequest, ComputeResponse


app = FastAPI(title="myPSD", version="0.1.0")

# Dev proxy hits us cross-origin; production is same-origin. Permissive CORS
# is fine for a stateless teaching tool with no auth.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    try:
        import rustmatrix

        return {"status": "ok", "rustmatrix": rustmatrix.__version__}
    except Exception as exc:  # pragma: no cover
        return {"status": "degraded", "error": str(exc)}


@app.post("/api/compute", response_model=ComputeResponse)
def compute(req: ComputeRequest) -> ComputeResponse:
    return scatter.compute(
        dm=req.dm,
        log_nw=req.log_nw,
        mu=req.mu,
        band=req.band,
        canting_std_deg=req.canting_std_deg,
        precip=req.precip,
    )


# Mount the built SPA if present. Using `html=True` makes unknown paths fall
# back to index.html so client-side routing works.
_STATIC_DIR = Path(__file__).parent / "static"
if _STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=_STATIC_DIR, html=True), name="static")
