import type { Band, Precip } from '../types'

export interface ControlsState {
  dm: number
  logNw: number
  mu: number
  band: Band
  cantingStd: number
  precip: Precip
}

interface Props {
  value: ControlsState
  onChange: (next: ControlsState) => void
}

export function Controls({ value, onChange }: Props) {
  const set = <K extends keyof ControlsState>(k: K, v: ControlsState[K]) =>
    onChange({ ...value, [k]: v })

  return (
    <div className="panel controls">
      <div className="field">
        <label>
          Precip type
        </label>
        <select
          value={value.precip}
          onChange={(e) => set('precip', e.target.value as Precip)}
        >
          <option value="rain">rain</option>
          <option value="hail">hail</option>
        </select>
      </div>

      <div className="field">
        <label>
          Wavelength
        </label>
        <select
          value={value.band}
          onChange={(e) => set('band', e.target.value as Band)}
        >
          <option value="S">S band (10 cm)</option>
          <option value="C">C band (5 cm)</option>
          <option value="X">X band (3 cm)</option>
        </select>
      </div>

      <div className="field">
        <label>
          Dm (mm) <span className="value">{value.dm.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={0.5}
          max={8.0}
          step={0.1}
          value={value.dm}
          onChange={(e) => set('dm', parseFloat(e.target.value))}
        />
      </div>

      <div className="field">
        <label>
          log₁₀ Nw (mm⁻¹ m⁻³) <span className="value">{value.logNw.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min={0.5}
          max={6.0}
          step={0.1}
          value={value.logNw}
          onChange={(e) => set('logNw', parseFloat(e.target.value))}
        />
      </div>

      <div className="field">
        <label>
          μ (shape) <span className="value">{value.mu.toFixed(0)}</span>
        </label>
        <input
          type="range"
          min={-3}
          max={80}
          step={1}
          value={value.mu}
          onChange={(e) => set('mu', parseFloat(e.target.value))}
        />
      </div>

      <div className="field">
        <label>
          Canting σ (deg) <span className="value">{value.cantingStd.toFixed(0)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={40}
          step={4}
          value={value.cantingStd}
          onChange={(e) => set('cantingStd', parseFloat(e.target.value))}
        />
      </div>
    </div>
  )
}
