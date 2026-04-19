import { Paper, Skeleton, Stack, Table, Text, Title } from '@mantine/core'
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
  const rows: Array<[React.ReactNode, string]> = metrics
    ? [
        [<>Z<sub>h</sub> (dBZ)</>, fmt(metrics.zh_dbz, 2)],
        [<>Z<sub>v</sub> (dBZ)</>, fmt(metrics.zv_dbz, 2)],
        [<>Z<sub>dr</sub> (dB)</>, fmt(metrics.zdr_db, 3)],
        ['LDR (dB)', fmt(metrics.ldr_db, 2)],
        [<>ρ<sub>hv</sub></>, fmt(metrics.rho_hv, 5)],
        [<>δ<sub>hv</sub> (deg)</>, fmt(metrics.delta_deg, 3)],
        [<>K<sub>dp</sub> (° km⁻¹)</>, fmt(metrics.kdp_deg_per_km, 4)],
        [<>A<sub>h</sub> (dB km⁻¹)</>, fmt(metrics.ah_db_per_km, 4)],
        [<>A<sub>dr</sub> (dB km⁻¹)</>, fmt(metrics.adr_db_per_km, 5)],
        [<>N<sub>T</sub> (m⁻³)</>, fmt(metrics.nt_per_m3, 2)],
        ['LWC (g m⁻³)', fmt(metrics.lwc_g_per_m3, 4)],
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
            {rows.map(([label, v], i) => (
              <Table.Tr key={i}>
                <Table.Td style={{ width: '55%' }}>
                  <Text size="sm">{label}</Text>
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
