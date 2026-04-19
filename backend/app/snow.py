"""Snow-hydrometeor parameters for T-matrix scattering.

Shape conversions follow Honeyager (2013), "Investigating the use of the
T-matrix method as a proxy for the discrete dipole approximation",
M.S. thesis, Florida State University. Each snow type is approximated
as a homogeneous spheroid whose effective refractive index is obtained
by Maxwell-Garnett mixing of ice and air; volume fraction f is derived
from a type-specific bulk density, which for aggregates depends on D.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

from rustmatrix.refractive import ice_density, mi


@dataclass(frozen=True)
class SnowType:
    key: str
    label: str
    # Horizontal/vertical axial ratio (rustmatrix convention: >1 oblate, <1 prolate).
    axis_ratio: float
    # Fixed bulk density in g/cm^3 if density_fn is None.
    density: Optional[float]
    # D-dependent bulk density in g/cm^3 (D in mm). Overrides `density`.
    density_fn: Optional[Callable[[float], float]]
    # Upper integration bound for the PSD, mm.
    d_max: float
    # One-sentence bullets describing modelling assumptions (rendered in the UI).
    assumptions: tuple[str, ...]


def _brandes_density(d_mm: float) -> float:
    """Brandes et al. (2007) size-density for snow aggregates: rho = 0.178 D^-0.922.

    Clamped to [0.005, ice_density] g/cm^3 so Maxwell-Garnett stays bounded
    at very small/large D.
    """
    if d_mm <= 0.0:
        return 0.005
    rho = 0.178 * d_mm ** (-0.922)
    if rho > ice_density:
        return ice_density
    if rho < 0.005:
        return 0.005
    return rho


SNOW_TYPES: dict[str, SnowType] = {
    "snow_sector": SnowType(
        key="snow_sector",
        label="Sector snowflake",
        axis_ratio=1.67,  # 1/0.6 (plate-like, oblate)
        density=0.50 * ice_density,  # f_ice ≈ 0.5 per Honeyager §3.7.1
        density_fn=None,
        d_max=8.0,
        assumptions=(
            "Shape: oblate spheroid, axial ratio 0.6 (horizontal/vertical).",
            "Ice volume fraction f = 0.5; a sector snowflake fills ~half of its "
            "circumscribing ellipsoid (Honeyager 2013, §3.7.1).",
            "Effective refractive index: Maxwell-Garnett (ice-in-air) mixing at "
            "this fixed density; pure-ice m from Warren & Brandt (2008).",
            "Liu (2008) pristine-flake database size range ≈ 0.1–5 mm.",
            "Source: Honeyager (2013), FSU M.S. thesis, §2.1 & §3.7.1.",
        ),
    ),
    "snow_rosette": SnowType(
        key="snow_rosette",
        label="6-point bullet rosette",
        axis_ratio=1.0,  # near-spherical envelope per Honeyager §3.7.2
        density=0.10 * ice_density,  # f_ice ≈ 0.10 (sparse 6-arm packing)
        density_fn=None,
        d_max=6.0,
        assumptions=(
            "Shape: near-spherical equivalent (axial ratio 1.0); six hexagonal "
            "prisms intersecting at 90° form an envelope close to a sphere "
            "(Honeyager 2013, §3.7.2).",
            "Ice volume fraction f = 0.10 — rosette arms are sparse inside the "
            "circumscribing ellipsoid (Honeyager §2.1, Liu 2004).",
            "Effective refractive index: Maxwell-Garnett ice-in-air.",
            "Valid for pristine D ≈ 0.1–3 mm; T-matrix underpredicts scattering "
            "at 5–6 arm arm counts relative to DDSCAT (Honeyager §3.7.2).",
            "Source: Honeyager (2013), §2.1 & §3.7.2; Liu (2004).",
        ),
    ),
    "snow_aggregate": SnowType(
        key="snow_aggregate",
        label="Bullet-rosette aggregate",
        axis_ratio=1.25,  # 1/0.8 (oblate aggregate, Garrett et al. 2012)
        density=None,
        density_fn=_brandes_density,
        d_max=15.0,
        assumptions=(
            "Shape: oblate spheroid, axial ratio 0.8 (Garrett et al. 2012; "
            "Honeyager §2.2).",
            "Size-dependent bulk density from Brandes et al. (2007): "
            "ρ(D) = 0.178·D^(-0.922) g cm⁻³, with D in mm.",
            "Refractive index is computed per-D via Maxwell-Garnett ice-in-air "
            "(PSDIntegrator.m_func), so each scatter-table entry uses the "
            "correct effective medium for its diameter.",
            "Valid D ≈ 1–12 mm (Nowell 2010/2013 aggregate database).",
            "Source: Honeyager (2013), §2.2 & §3.7.3; Brandes et al. (2007); "
            "Heymsfield et al. (2004).",
        ),
    ),
}


def snow_m_func(snow_type: SnowType, wavelength_mm: float) -> Callable[[float], complex]:
    """Return the D→m callable to hand to PSDIntegrator.m_func."""
    if snow_type.density_fn is not None:
        fn = snow_type.density_fn

        def _m(d_mm: float) -> complex:
            return complex(mi(wavelength_mm, fn(d_mm)))

        return _m

    rho = snow_type.density  # fixed
    fixed_m = complex(mi(wavelength_mm, rho))

    def _m_const(_d_mm: float) -> complex:
        return fixed_m

    return _m_const


def snow_fixed_m(snow_type: SnowType, wavelength_mm: float) -> complex:
    """A single scalar m for initializing Scatterer. For density_fn types
    this is evaluated at the median D=3mm (only used for the pre-init check;
    PSDIntegrator then overrides per-D via m_func)."""
    if snow_type.density is not None:
        return complex(mi(wavelength_mm, snow_type.density))
    return complex(mi(wavelength_mm, snow_type.density_fn(3.0)))
