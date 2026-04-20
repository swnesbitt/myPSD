"""PSD-integrated polarimetric radar metrics via rustmatrix.

Scatter-table build is the expensive step; cache it keyed by
(band, precip, canting_std). Dm / log_Nw / mu sweeps reuse the same table.

Snow conversions (sector snowflakes, bullet rosettes, rosette aggregates)
follow Honeyager (2013), FSU M.S. thesis — see `snow.py` for details.
"""

from __future__ import annotations

from functools import lru_cache

import numpy as np
from scipy.special import gamma as gamma_fn

from rustmatrix import orientation, radar, refractive, tmatrix_aux
from rustmatrix.psd import GammaPSD, PSDIntegrator
from rustmatrix.scatter import ldr as scatter_ldr
from rustmatrix.scatterer import Scatterer

from .models import Assumptions, Band, ComputeResponse, Metrics, NDCurve, Precip
from .snow import SNOW_TYPES, snow_fixed_m, snow_m_func


_BAND_WL = {"S": tmatrix_aux.wl_S, "C": tmatrix_aux.wl_C, "X": tmatrix_aux.wl_X}

_HAIL_M = complex(1.78, 7.9e-4)

_D_PLOT = np.arange(0.05, 20.0, 0.05)  # mm


def _drop_ar(d_eq: float) -> float:
    """Beard-Chuang-style axis ratio for raindrops (from pytmatrix examples)."""
    if d_eq < 0.7:
        return 1.0
    if d_eq < 1.5:
        return (
            1.173
            - 0.5165 * d_eq
            + 0.4698 * d_eq**2
            - 0.1317 * d_eq**3
            - 8.5e-3 * d_eq**4
        )
    return (
        1.065
        - 6.25e-2 * d_eq
        - 3.99e-3 * d_eq**2
        + 7.66e-4 * d_eq**3
        - 4.095e-5 * d_eq**4
    )


def _rain_axis_ratio(d: float) -> float:
    return 1.0 / _drop_ar(d)


def _hail_axis_ratio(_d: float) -> float:
    return 0.99


def _constant_axis_ratio(value: float):
    def _f(_d: float) -> float:
        return value

    return _f


@lru_cache(maxsize=64)
def _build_scatterer(band: Band, precip: Precip, canting_std_deg: float) -> Scatterer:
    """Build a scatterer and pre-compute its PSD scatter table.

    Result is cached across requests because the table build dominates latency.
    """
    wavelength = _BAND_WL[band]

    is_snow = precip in SNOW_TYPES
    if is_snow:
        snow_type = SNOW_TYPES[precip]
        m = snow_fixed_m(snow_type, wavelength)
        axis_ratio_fn = _constant_axis_ratio(snow_type.axis_ratio)
        d_max = snow_type.d_max
    elif precip == "hail":
        m = _HAIL_M
        axis_ratio_fn = _hail_axis_ratio
        d_max = 75.0
    else:  # rain
        m = refractive.m_w_10C[wavelength]
        axis_ratio_fn = _rain_axis_ratio
        d_max = 10.0

    scatterer = Scatterer(wavelength=wavelength, m=m)
    scatterer.psd_integrator = PSDIntegrator()
    scatterer.psd_integrator.axis_ratio_func = axis_ratio_fn
    scatterer.psd_integrator.D_max = d_max
    scatterer.psd_integrator.geometries = (
        tmatrix_aux.geom_horiz_back,
        tmatrix_aux.geom_horiz_forw,
    )

    if is_snow:
        # Per-D effective refractive index from Maxwell-Garnett mixing.
        scatterer.psd_integrator.m_func = snow_m_func(
            SNOW_TYPES[precip], wavelength
        )

    if canting_std_deg > 0.0:
        scatterer.or_pdf = orientation.gaussian_pdf(canting_std_deg)
    scatterer.orient = orientation.orient_averaged_fixed

    scatterer.psd_integrator.init_scatter_table(scatterer)
    return scatterer


def _nd(d_mm: np.ndarray, dm: float, log_nw: float, mu: float) -> np.ndarray:
    """Normalized gamma PSD, Testud et al. 2001 convention."""
    f_u = (6.0 / 4.0**4) * ((4.0 + mu) ** (mu + 4.0)) / gamma_fn(mu + 4.0)
    return (
        10.0**log_nw
        * f_u
        * (d_mm / dm) ** mu
        * np.exp(-(4.0 + mu) * (d_mm / dm))
    )


_RAIN_ASSUMPTIONS = Assumptions(
    title="Rain",
    bullets=[
        "Oblate raindrops with Beard & Chuang (1987) equilibrium axis ratio.",
        "Refractive index of liquid water at 10 °C (rustmatrix.refractive.m_w_10C).",
        "PSD integrated out to D_max = 10 mm.",
        "Testud et al. (2001) normalized-gamma PSD: N(D) = N_w·f(μ)·(D/D_m)^μ·exp[-(4+μ)D/D_m].",
    ],
)

_HAIL_ASSUMPTIONS = Assumptions(
    title="Hail",
    bullets=[
        "Near-spherical dry hail (axis ratio 0.99).",
        "Fixed refractive index m = 1.78 + 7.9×10⁻⁴ i (solid ice at 0 °C).",
        "PSD integrated out to D_max = 75 mm (giant-hail tail).",
        "No melting or wet-ice handling — treats hail as solid ice.",
    ],
)


def _assumptions_for(precip: Precip) -> Assumptions:
    if precip == "rain":
        return _RAIN_ASSUMPTIONS
    if precip == "hail":
        return _HAIL_ASSUMPTIONS
    snow_type = SNOW_TYPES[precip]
    return Assumptions(title=snow_type.label, bullets=list(snow_type.assumptions))


def compute(
    dm: float,
    log_nw: float,
    mu: float,
    band: Band,
    canting_std_deg: float,
    precip: Precip,
) -> ComputeResponse:
    scatterer = _build_scatterer(band, precip, float(canting_std_deg))

    d0 = (3.67 + mu) / (4.0 + mu) * dm
    nw = 10.0**log_nw
    scatterer.psd = GammaPSD(D0=d0, Nw=nw, mu=mu)

    scatterer.set_geometry(tmatrix_aux.geom_horiz_back)
    zh = 10.0 * np.log10(radar.refl(scatterer))
    zv = 10.0 * np.log10(radar.refl(scatterer, False))
    zdr = 10.0 * np.log10(radar.Zdr(scatterer))
    ldr_db = 10.0 * np.log10(scatter_ldr(scatterer))
    rho_hv = float(radar.rho_hv(scatterer))
    delta = float(radar.delta_hv(scatterer))

    scatterer.set_geometry(tmatrix_aux.geom_horiz_forw)
    kdp = float(radar.Kdp(scatterer))
    ah = float(radar.Ai(scatterer))
    av = float(radar.Ai(scatterer, h_pol=False))
    adr = ah - av

    # Nt from numerical integration of the PSD on the plot grid, so it stays
    # finite for μ ≤ -1 where the analytic ∫D^μ e^(-λD) dD → Γ(μ+1) diverges.
    # Integration range matches the rendered curve (D = 0.1–20 mm).
    n_d = _nd(_D_PLOT, dm, log_nw, mu)
    nt = float(np.trapezoid(n_d, _D_PLOT))
    # Nominal density for LWC/IWC: rain uses 1.0 g/cm^3; all ice variants use
    # pure-ice density (917 kg/m^3). For snow, this yields an equivalent IWC
    # assuming the Dm/Nw are specified in the ice-equivalent sense.
    density = 1000.0 if precip == "rain" else 917.0
    lwc = (np.pi * nw * dm**4) / (4.0**4 * density)

    metrics = Metrics(
        zh_dbz=float(zh),
        zv_dbz=float(zv),
        zdr_db=float(zdr),
        ldr_db=float(ldr_db),
        rho_hv=rho_hv,
        delta_deg=delta,
        kdp_deg_per_km=kdp,
        ah_db_per_km=ah,
        adr_db_per_km=adr,
        nt_per_m3=float(nt),
        lwc_g_per_m3=float(lwc),
    )

    nd = NDCurve(d_mm=_D_PLOT.tolist(), n_d=n_d.tolist())

    return ComputeResponse(
        metrics=metrics, nd=nd, assumptions=_assumptions_for(precip)
    )
