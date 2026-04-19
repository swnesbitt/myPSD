"""Smoke + sanity tests for the scatter path.

These don't pin values to bokeh-myPSD screenshots (those aren't captured yet),
but they exercise every branch — rain/hail × S/C/X × canted/uncanted — and
assert physical sanity: finite, in-range, monotonic where expected.
"""

from __future__ import annotations

import math

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.scatter import compute


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.mark.parametrize("band", ["S", "C", "X"])
@pytest.mark.parametrize("precip", ["rain", "hail"])
def test_compute_smoke(band, precip):
    r = compute(dm=2.0, log_nw=3.0, mu=0.0, band=band, canting_std_deg=0.0, precip=precip)
    m = r.metrics

    assert all(math.isfinite(v) for v in (
        m.zh_dbz, m.zv_dbz, m.zdr_db, m.ldr_db, m.rho_hv, m.delta_deg,
        m.kdp_deg_per_km, m.ah_db_per_km, m.adr_db_per_km, m.nt_per_m3, m.lwc_g_per_m3,
    ))
    # ρ_hv in physical range
    assert 0.0 < m.rho_hv <= 1.0
    # reasonable reflectivity for Dm=2mm, Nw=10^3
    assert 15.0 < m.zh_dbz < 60.0
    # Zh vs Zv: rain is oblate (Zh > Zv); hail at 0.99 is near-spherical so
    # |Zh - Zv| should at least be small.
    if precip == "rain":
        assert m.zh_dbz > m.zv_dbz
    else:
        assert abs(m.zh_dbz - m.zv_dbz) < 0.3
    # PSD curve shape
    assert len(r.nd.d_mm) == len(r.nd.n_d) == 199


def test_hail_is_near_isotropic():
    """Hail at axis_ratio 0.99 should give near-zero Zdr."""
    r = compute(dm=3.0, log_nw=3.0, mu=0.0, band="S", canting_std_deg=0.0, precip="hail")
    assert abs(r.metrics.zdr_db) < 0.2


def test_rain_has_positive_zdr():
    """Rain drops are oblate → Zdr > 0."""
    r = compute(dm=3.0, log_nw=3.0, mu=0.0, band="S", canting_std_deg=0.0, precip="rain")
    assert r.metrics.zdr_db > 0.5


def test_api_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "rustmatrix" in body


def test_api_compute(client):
    resp = client.post(
        "/api/compute",
        json={"dm": 2.0, "log_nw": 3.0, "mu": 0.0, "band": "S",
              "canting_std_deg": 0.0, "precip": "rain"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "metrics" in body and "nd" in body
    assert len(body["nd"]["d_mm"]) == 199


def test_api_rejects_out_of_range(client):
    resp = client.post(
        "/api/compute",
        json={"dm": 99.0, "log_nw": 3.0, "mu": 0.0, "band": "S",
              "canting_std_deg": 0.0, "precip": "rain"},
    )
    assert resp.status_code == 422


def test_canting_reduces_zdr():
    """Wider canting PDF should reduce |Zdr| toward zero."""
    r0 = compute(dm=3.0, log_nw=3.0, mu=0.0, band="S", canting_std_deg=0.0, precip="rain")
    r1 = compute(dm=3.0, log_nw=3.0, mu=0.0, band="S", canting_std_deg=20.0, precip="rain")
    assert r1.metrics.zdr_db < r0.metrics.zdr_db
