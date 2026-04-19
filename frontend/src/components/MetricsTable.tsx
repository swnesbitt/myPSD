import { Paper, Skeleton, Stack, Table, Text, Title } from '@mantine/core'
import type { Metrics } from '../types'
import { HelpTip } from './HelpTip'

interface Props {
  metrics: Metrics | null
}

function fmt(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return '—'
  if (Math.abs(v) !== 0 && (Math.abs(v) < 1e-2 || Math.abs(v) >= 1e4)) {
    return v.toExponential(2)
  }
  return v.toFixed(digits)
}

const TIPS = {
  zh: (
    <>
      Equivalent reflectivity factor at horizontal polarization (dBZ). In
      the Rayleigh limit it is proportional to the sixth moment of the
      drop-size distribution; at C/X and for hail the full T-matrix
      solution deviates from the D⁶ law due to Mie resonances.
    </>
  ),
  zv: (
    <>
      Equivalent reflectivity factor at vertical polarization (dBZ). For
      oblate particles Z<sub>v</sub> &lt; Z<sub>h</sub> because the
      vertical axis is shorter than the horizontal.
    </>
  ),
  zdr: (
    <>
      Differential reflectivity, 10·log₁₀(Z<sub>h</sub>/Z<sub>v</sub>) in
      dB. Positive for horizontally-oriented oblate particles (large rain
      drops, aggregates), near zero for spheres (small rain, hail
      tumbling), negative for vertically-aligned prolate shapes
      (conical graupel, some crystals).
    </>
  ),
  ldr: (
    <>
      Linear depolarization ratio (dB) — ratio of cross-polar to co-polar
      return when transmitting one polarization. Elevated by canting,
      irregular or mixed-phase particles. Spheres with zero canting give
      LDR → −∞.
    </>
  ),
  rhohv: (
    <>
      Co-polar correlation coefficient between H and V returns. Close to 1
      for uniform populations; depressed by size, shape, or phase
      diversity — useful for detecting mixed-phase layers, debris, and
      non-meteorological targets.
    </>
  ),
  delta: (
    <>
      Backscatter differential phase shift (°). Non-zero when scattering
      is in the Mie regime — e.g., large drops at C/X band, wet hail.
      Contaminates Φ<sub>DP</sub> and can bias K<sub>dp</sub> estimates
      if not removed.
    </>
  ),
  kdp: (
    <>
      Specific differential phase (° km⁻¹) — propagation-based, half the
      range derivative of Φ<sub>DP</sub>. Proportional to the product of
      water content and drop oblateness. Immune to attenuation and
      calibration biases; the workhorse for rainfall estimation in heavy
      rain.
    </>
  ),
  ah: (
    <>
      Specific attenuation at horizontal polarization (dB km⁻¹). Small at
      S band, significant at C and X. K<sub>dp</sub>-based attenuation
      correction (e.g., ZPHI) relies on the near-linear A<sub>h</sub>–
      K<sub>dp</sub> relationship.
    </>
  ),
  adr: (
    <>
      Specific differential attenuation (dB km⁻¹) — A<sub>h</sub> minus
      A<sub>v</sub>. Biases Z<sub>dr</sub> in heavy-rain paths at C/X;
      commonly corrected using A<sub>dr</sub> ∝ K<sub>dp</sub>.
    </>
  ),
  nt: (
    <>
      Total number concentration (m⁻³) — the zeroth moment of the PSD,
      ∫N(D) dD. Equals the area under the PSD curve (in linear, not
      log, space).
    </>
  ),
  lwc: (
    <>
      Liquid (or ice-mass-equivalent) water content (g m⁻³) — third
      moment of the PSD weighted by hydrometeor density. For snow
      presets this is the ice-mass content using the habit-specific
      ρ(D).
    </>
  ),
}

export function MetricsTable({ metrics }: Props) {
  const rows: Array<[React.ReactNode, string, React.ReactNode]> = metrics
    ? [
        [<>Z<sub>h</sub> (dBZ)</>, fmt(metrics.zh_dbz, 2), TIPS.zh],
        [<>Z<sub>v</sub> (dBZ)</>, fmt(metrics.zv_dbz, 2), TIPS.zv],
        [<>Z<sub>dr</sub> (dB)</>, fmt(metrics.zdr_db, 3), TIPS.zdr],
        ['LDR (dB)', fmt(metrics.ldr_db, 2), TIPS.ldr],
        [<>ρ<sub>hv</sub></>, fmt(metrics.rho_hv, 5), TIPS.rhohv],
        [<>δ<sub>hv</sub> (deg)</>, fmt(metrics.delta_deg, 3), TIPS.delta],
        [<>K<sub>dp</sub> (° km⁻¹)</>, fmt(metrics.kdp_deg_per_km, 4), TIPS.kdp],
        [<>A<sub>h</sub> (dB km⁻¹)</>, fmt(metrics.ah_db_per_km, 4), TIPS.ah],
        [<>A<sub>dr</sub> (dB km⁻¹)</>, fmt(metrics.adr_db_per_km, 5), TIPS.adr],
        [<>N<sub>T</sub> (m⁻³)</>, fmt(metrics.nt_per_m3, 2), TIPS.nt],
        ['LWC (g m⁻³)', fmt(metrics.lwc_g_per_m3, 4), TIPS.lwc],
      ]
    : []

  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Title order={4} mb="sm">
        Polarimetric metrics
      </Title>
      {metrics ? (
        <Table striped highlightOnHover withRowBorders={false} verticalSpacing={6}>
          <Table.Tbody>
            {rows.map(([label, v, tip], i) => (
              <Table.Tr key={i}>
                <Table.Td style={{ width: '55%' }}>
                  <Text size="sm" component="span">
                    {label}
                    <HelpTip label={tip} />
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={600} ff="monospace">
                    {v}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Stack gap="xs">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={20} radius="sm" />
          ))}
        </Stack>
      )}
    </Paper>
  )
}
