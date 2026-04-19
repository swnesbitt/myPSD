import { useState } from 'react'
import { Group, NumberInput, Paper, Text } from '@mantine/core'
import createPlotlyComponent from 'react-plotly.js/factory'
// @ts-expect-error plotly.js-basic-dist-min has no types
import Plotly from 'plotly.js-basic-dist-min'
import type { NDCurve } from '../types'

const Plot = createPlotlyComponent(Plotly)

interface Props {
  nd: NDCurve | null
}

const DEFAULTS = { xmin: 0, xmax: 10, ymin: -1, ymax: 6 }

export function PSDPlot({ nd }: Props) {
  const [xmin, setXmin] = useState<number>(DEFAULTS.xmin)
  const [xmax, setXmax] = useState<number>(DEFAULTS.xmax)
  const [ymin, setYmin] = useState<number>(DEFAULTS.ymin)
  const [ymax, setYmax] = useState<number>(DEFAULTS.ymax)

  const data = nd
    ? [
        {
          x: nd.d_mm,
          y: nd.n_d.map((v) => (v > 0 ? Math.log10(v) : null)),
          type: 'scatter' as const,
          mode: 'lines' as const,
          line: { color: '#1f4e79', width: 3 },
          fill: 'tozeroy' as const,
          fillcolor: 'rgba(78, 168, 220, 0.15)',
          name: 'log₁₀ N(D)',
          hovertemplate:
            'D = %{x:.2f} mm<br>log₁₀ N(D) = %{y:.2f}<extra></extra>',
        },
      ]
    : []

  const rangeInput = (
    value: number,
    onChange: (v: number) => void,
    step: number,
  ) => (
    <NumberInput
      value={value}
      onChange={(v) => typeof v === 'number' && onChange(v)}
      step={step}
      size="xs"
      styles={{ input: { width: 70, textAlign: 'right' } }}
      hideControls
    />
  )

  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Plot
        data={data}
        layout={{
          title: {
            text: 'Particle size distribution',
            font: { size: 26 },
          },
          xaxis: {
            title: {
              text: 'Particle diameter (mm)',
              font: { size: 20 },
            },
            tickfont: { size: 18 },
            range: [xmin, xmax],
          },
          yaxis: {
            title: {
              text: 'log₁₀ N(D) (mm⁻¹ m⁻³)',
              font: { size: 20 },
            },
            tickfont: { size: 18 },
            range: [ymin, ymax],
          },
          margin: { t: 60, b: 70, l: 90, r: 20 },
          height: 460,
          plot_bgcolor: '#f7f9fc',
          paper_bgcolor: '#ffffff',
          font: { family: 'system-ui, sans-serif', size: 18 },
        }}
        config={{ displaylogo: false, responsive: true }}
        style={{ width: '100%' }}
        useResizeHandler
      />
      <Group justify="space-between" mt="xs" gap="lg" wrap="wrap">
        <Group gap="xs" align="center">
          <Text size="xs" c="dimmed" fw={500}>
            log₁₀ N(D):
          </Text>
          {rangeInput(ymin, setYmin, 1)}
          <Text size="xs" c="dimmed">
            to
          </Text>
          {rangeInput(ymax, setYmax, 1)}
        </Group>
        <Group gap="xs" align="center">
          <Text size="xs" c="dimmed" fw={500}>
            D (mm):
          </Text>
          {rangeInput(xmin, setXmin, 1)}
          <Text size="xs" c="dimmed">
            to
          </Text>
          {rangeInput(xmax, setXmax, 1)}
        </Group>
      </Group>
    </Paper>
  )
}
