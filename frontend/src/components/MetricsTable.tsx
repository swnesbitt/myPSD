import type { Metrics } from '../types'

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

export function MetricsTable({ metrics }: Props) {
  const rows: Array<[string, string]> = metrics
    ? [
        ['Zh (dBZ)', fmt(metrics.zh_dbz, 2)],
        ['Zv (dBZ)', fmt(metrics.zv_dbz, 2)],
        ['Zdr (dB)', fmt(metrics.zdr_db, 3)],
        ['LDR (dB)', fmt(metrics.ldr_db, 2)],
        ['ρ_hv', fmt(metrics.rho_hv, 5)],
        ['δ_hv (deg)', fmt(metrics.delta_deg, 3)],
        ['Kdp (° km⁻¹)', fmt(metrics.kdp_deg_per_km, 4)],
        ['Ah (dB km⁻¹)', fmt(metrics.ah_db_per_km, 4)],
        ['Adr (dB km⁻¹)', fmt(metrics.adr_db_per_km, 5)],
        ['NT (m⁻³)', fmt(metrics.nt_per_m3, 2)],
        ['LWC (g m⁻³)', fmt(metrics.lwc_g_per_m3, 4)],
      ]
    : []

  return (
    <div className="panel">
      <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>Polarimetric metrics</h3>
      {metrics ? (
        <table className="table">
          <tbody>
            {rows.map(([label, v]) => (
              <tr key={label}>
                <th>{label}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ color: '#5a6578' }}>Computing…</div>
      )}
    </div>
  )
}
