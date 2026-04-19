import { useEffect, useRef, useState } from 'react'
import { Alert, AppShell, Grid, Stack, Text } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { Controls, type ControlsState } from './components/Controls'
import { PSDPlot } from './components/PSDPlot'
import { MetricsTable } from './components/MetricsTable'
import { Assumptions } from './components/Assumptions'
import { compute } from './api'
import type { ComputeResponse } from './types'

const INITIAL: ControlsState = {
  dm: 2.0,
  logNw: 3.0,
  mu: 0,
  band: 'S',
  cantingStd: 0,
  precip: 'rain',
}

export default function App() {
  const [state, setState] = useState<ControlsState>(INITIAL)
  const [result, setResult] = useState<ComputeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current?.abort()
    abortRef.current = controller
    const id = setTimeout(() => {
      compute(
        {
          dm: state.dm,
          log_nw: state.logNw,
          mu: state.mu,
          band: state.band,
          canting_std_deg: state.cantingStd,
          precip: state.precip,
        },
        controller.signal,
      )
        .then((r) => {
          setResult(r)
          setError(null)
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name !== 'AbortError') {
            setError(err.message)
          }
        })
    }, 150)
    return () => {
      clearTimeout(id)
      controller.abort()
    }
  }, [state])

  return (
    <AppShell header={{ height: { base: 150, sm: 100 } }} padding={{ base: 'sm', sm: 'lg' }}>
      <AppShell.Header className="header">
        <img src="/logo.svg" alt="myPSD" className="brand" />
        <div className="subtitle">
          <Text size="sm" c="dimmed" lh={1.4}>
            Normalized gamma PSD · T-matrix via rustmatrix
          </Text>
          <Text size="xs" c="dimmed" lh={1.4}>
            A tool accompanying{' '}
            <a
              href="https://courses.illinois.edu/schedule/terms/ATMS/410"
              style={{ color: 'var(--mantine-color-climasBlue-6)' }}
            >
              ATMS 410
            </a>{' '}
            at UIUC and{' '}
            <a
              href="https://onlinelibrary.wiley.com/doi/book/10.1002/9781118432662"
              style={{ color: 'var(--mantine-color-climasBlue-6)' }}
            >
              Radar Meteorology: A First Course
            </a>
          </Text>
        </div>
        <a
          href="https://onlinelibrary.wiley.com/doi/book/10.1002/9781118432662"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="/book-cover.png"
            alt="Radar Meteorology: A First Course — Rauber & Nesbitt"
            className="book"
          />
        </a>
        <img
          src="/climas-icon.png"
          alt="CLIMAS — University of Illinois"
          className="climas"
        />
      </AppShell.Header>

      <AppShell.Main>
        <Grid gutter="lg" align="flex-start">
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Controls value={state} onChange={setState} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            <Stack gap="lg">
              {error && (
                <Alert
                  color="red"
                  icon={<IconAlertCircle size={18} />}
                  title="Compute error"
                  variant="light"
                >
                  {error}
                </Alert>
              )}
              <PSDPlot nd={result?.nd ?? null} />
              <MetricsTable metrics={result?.metrics ?? null} />
              <Assumptions data={result?.assumptions ?? null} />
            </Stack>
          </Grid.Col>
        </Grid>

        <Text size="xs" c="dimmed" mt="xl" ta="center">
          Based on{' '}
          <a
            href="https://github.com/swnesbitt/bokeh-myPSD"
            style={{ color: 'var(--mantine-color-climasBlue-6)' }}
          >
            bokeh-myPSD
          </a>{' '}
          · Scattering by{' '}
          <a
            href="https://github.com/swnesbitt/rustmatrix"
            style={{ color: 'var(--mantine-color-climasBlue-6)' }}
          >
            rustmatrix
          </a>{' '}
          · Source at{' '}
          <a
            href="https://github.com/swnesbitt/myPSD"
            style={{ color: 'var(--mantine-color-climasBlue-6)' }}
          >
            swnesbitt/myPSD
          </a>
        </Text>
      </AppShell.Main>
    </AppShell>
  )
}
