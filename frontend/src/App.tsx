import { useEffect, useRef, useState } from 'react'
import { Controls, type ControlsState } from './components/Controls'
import { PSDPlot } from './components/PSDPlot'
import { MetricsTable } from './components/MetricsTable'
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
    // Debounce + abort-in-flight so slider drags don't flood the backend.
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
    <div className="app">
      <header className="header">
        <img src="/logo.svg" alt="myPSD" className="brand" />
        <div className="subtitle">
          Normalized gamma PSD · T-matrix via rustmatrix
        </div>
        <img src="/climas-icon.png" alt="CLIMAS — University of Illinois" className="climas" />
      </header>

      <main className="main">
        <Controls value={state} onChange={setState} />
        <div className="right">
          {error && <div className="error">{error}</div>}
          <PSDPlot nd={result?.nd ?? null} />
          <MetricsTable metrics={result?.metrics ?? null} />
        </div>
      </main>

      <footer className="footer">
        Based on{' '}
        <a href="https://github.com/swnesbitt/bokeh-myPSD">bokeh-myPSD</a> ·
        Scattering by{' '}
        <a href="https://github.com/swnesbitt/rustmatrix">rustmatrix</a> ·
        Source at <a href="https://github.com/swnesbitt/myPSD">swnesbitt/myPSD</a>
      </footer>
    </div>
  )
}
