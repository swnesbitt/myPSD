export type Band = 'S' | 'C' | 'X'
export type Precip = 'rain' | 'hail'

export interface ComputeRequest {
  dm: number
  log_nw: number
  mu: number
  band: Band
  canting_std_deg: number
  precip: Precip
}

export interface Metrics {
  zh_dbz: number
  zv_dbz: number
  zdr_db: number
  ldr_db: number
  rho_hv: number
  delta_deg: number
  kdp_deg_per_km: number
  ah_db_per_km: number
  adr_db_per_km: number
  nt_per_m3: number
  lwc_g_per_m3: number
}

export interface NDCurve {
  d_mm: number[]
  n_d: number[]
}

export interface ComputeResponse {
  metrics: Metrics
  nd: NDCurve
}
