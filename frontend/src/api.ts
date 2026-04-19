import type { ComputeRequest, ComputeResponse } from './types'

export async function compute(req: ComputeRequest, signal?: AbortSignal): Promise<ComputeResponse> {
  const resp = await fetch('/api/compute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`compute failed: ${resp.status} ${text}`)
  }
  return resp.json() as Promise<ComputeResponse>
}
