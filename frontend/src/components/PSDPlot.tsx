import { Paper } from '@mantine/core'
import createPlotlyComponent from 'react-plotly.js/factory'
// @ts-expect-error plotly.js-basic-dist-min has no types
import Plotly from 'plotly.js-basic-dist-min'
import type { NDCurve } from '../types'

const Plot = createPlotlyComponent(Plotly)

interface Props {
  nd: NDCurve | null
}

export function PSDPlot({ nd }: Props) {
  const data = nd
    ? [
        {
          x: nd.d_mm,
          y: nd.n_d,
          type: 'scatter' as const,
          mode: 'lines' as const,
          line: { color: '#1f4e79', width: 3 },
          fill: 'tozeroy' as const,
          fillcolor: 'rgba(78, 168, 220, 0.15)',
          name: 'N(D)',
          hovertemplate:
            'D = %{x:.2f} mm<br>N(D) = %{y:.3e} mm⁻¹ m⁻³<extra></extra>',
        },
      ]
    : []

  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Plot
        data={data}
        layout={{
          title: { text: 'Particle size distribution' },
          xaxis: { title: { text: 'Particle diameter (mm)' }, range: [0, 10] },
          yaxis: {
            title: { text: 'N(D) (mm⁻¹ m⁻³)' },
            type: 'log',
            range: [-1, 6],
          },
          margin: { t: 40, b: 50, l: 70, r: 20 },
          height: 380,
          plot_bgcolor: '#f7f9fc',
          paper_bgcolor: '#ffffff',
          font: { family: 'system-ui, sans-serif' },
        }}
        config={{ displaylogo: false, responsive: true }}
        style={{ width: '100%' }}
        useResizeHandler
      />
    </Paper>
  )
}
