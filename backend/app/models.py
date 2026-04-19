from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


Band = Literal["S", "C", "X"]
Precip = Literal["rain", "hail"]


class ComputeRequest(BaseModel):
    dm: float = Field(ge=0.1, le=8.0, description="Mass-weighted mean diameter [mm]")
    log_nw: float = Field(ge=0.5, le=6.0, description="log10(Nw) [mm^-1 m^-3]")
    mu: float = Field(ge=-3.0, le=80.0, description="Gamma shape parameter")
    band: Band = "S"
    canting_std_deg: float = Field(default=0.0, ge=0.0, le=40.0)
    precip: Precip = "rain"


class Metrics(BaseModel):
    zh_dbz: float
    zv_dbz: float
    zdr_db: float
    ldr_db: float
    rho_hv: float
    delta_deg: float
    kdp_deg_per_km: float
    ah_db_per_km: float
    adr_db_per_km: float
    nt_per_m3: float
    lwc_g_per_m3: float


class NDCurve(BaseModel):
    d_mm: list[float]
    n_d: list[float]


class ComputeResponse(BaseModel):
    metrics: Metrics
    nd: NDCurve
