import type { ControlsState } from './components/Controls'

export interface Preset {
  key: string
  label: string
  source: string
  values: Pick<ControlsState, 'dm' | 'logNw' | 'mu' | 'cantingStd' | 'precip'>
}

export const PRESETS: Preset[] = [
  {
    key: 'drizzle',
    label: 'Drizzle',
    source: 'Bringi et al. 2003',
    values: { dm: 0.5, logNw: 4.5, mu: 2, cantingStd: 3, precip: 'rain' },
  },
  {
    key: 'stratiform_light',
    label: 'Light stratiform rain',
    source: 'Bringi et al. 2003',
    values: { dm: 1.2, logNw: 3.3, mu: 3, cantingStd: 5, precip: 'rain' },
  },
  {
    key: 'convective_continental',
    label: 'Heavy continental convective rain',
    source: 'Bringi et al. 2003 (continental centroid)',
    values: { dm: 2.3, logNw: 4.0, mu: 4, cantingStd: 8, precip: 'rain' },
  },
  {
    key: 'convective_maritime',
    label: 'Heavy maritime warm rain',
    source: 'Bringi et al. 2003 (maritime-like)',
    values: { dm: 1.5, logNw: 4.75, mu: 3, cantingStd: 6, precip: 'rain' },
  },
  {
    key: 'snow_sector_light',
    label: 'Light sector-plate snow',
    source: 'Heymsfield 2008; Borque 2019 μ–Dm',
    values: { dm: 1.2, logNw: 3.0, mu: 1, cantingStd: 7, precip: 'snow_sector' },
  },
  {
    key: 'snow_aggregates_heavy',
    label: 'Heavy snow aggregates',
    source: 'Heymsfield 2008 (exponential PSD)',
    values: { dm: 5.0, logNw: 3.2, mu: 0, cantingStd: 12, precip: 'snow_aggregate' },
  },
  {
    key: 'hail_70dbz',
    label: '70+ dBZ hail core',
    source: 'Cheng & English 1983; Ulbrich & Atlas 1982',
    values: { dm: 15.0, logNw: 1.0, mu: 0, cantingStd: 30, precip: 'hail' },
  },
]

export function matchPreset(state: ControlsState): string | null {
  const match = PRESETS.find(
    (p) =>
      p.values.dm === state.dm &&
      p.values.logNw === state.logNw &&
      p.values.mu === state.mu &&
      p.values.cantingStd === state.cantingStd &&
      p.values.precip === state.precip,
  )
  return match?.key ?? null
}
