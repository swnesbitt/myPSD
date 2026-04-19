import { Button, Paper, Select, Slider, Stack, Text, Group, Title } from '@mantine/core'
import type { Band, Precip } from '../types'
import { PRESETS, matchPreset } from '../presets'

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

function SliderField({
  label,
  value,
  min,
  max,
  step,
  decimals,
  marks,
  onChange,
}: {
  label: React.ReactNode
  value: number
  min: number
  max: number
  step: number
  decimals: number
  marks?: { value: number; label?: string }[]
  onChange: (v: number) => void
}) {
  return (
    <div>
      <Group justify="space-between" mb={4} gap="xs">
        <Text size="sm" fw={500} c="dimmed">
          {label}
        </Text>
        <Text size="sm" fw={600} ff="monospace">
          {value.toFixed(decimals)}
        </Text>
      </Group>
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        marks={marks}
        color="dropCyan"
        size="md"
        label={null}
      />
    </div>
  )
}

export function Controls({ value, onChange }: Props) {
  const set = <K extends keyof ControlsState>(k: K, v: ControlsState[K]) =>
    onChange({ ...value, [k]: v })

  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Stack gap="lg">
        <Select
          label="Precipitation type"
          value={value.precip}
          onChange={(v) => v && set('precip', v as Precip)}
          data={[
            { value: 'rain', label: 'Rain' },
            { value: 'hail', label: 'Hail' },
            { value: 'snow_sector', label: 'Sector snowflake' },
            { value: 'snow_rosette', label: '6-point bullet rosette' },
            { value: 'snow_aggregate', label: 'Bullet-rosette aggregate' },
          ]}
          allowDeselect={false}
        />

        <Select
          label="Radar wavelength"
          value={value.band}
          onChange={(v) => v && set('band', v as Band)}
          data={[
            { value: 'S', label: 'S band (10 cm)' },
            { value: 'C', label: 'C band (5 cm)' },
            { value: 'X', label: 'X band (3 cm)' },
          ]}
          allowDeselect={false}
        />

        <SliderField
          label={<>D<sub>m</sub> (mm)</>}
          value={value.dm}
          min={0.5}
          max={8.0}
          step={0.1}
          decimals={1}
          marks={[
            { value: 1, label: '1' },
            { value: 3, label: '3' },
            { value: 5, label: '5' },
            { value: 7, label: '7' },
          ]}
          onChange={(v) => set('dm', v)}
        />

        <SliderField
          label={<>log<sub>10</sub> N<sub>w</sub> (mm⁻¹ m⁻³)</>}
          value={value.logNw}
          min={0.5}
          max={6.0}
          step={0.1}
          decimals={2}
          marks={[
            { value: 1, label: '1' },
            { value: 3, label: '3' },
            { value: 5, label: '5' },
          ]}
          onChange={(v) => set('logNw', v)}
        />

        <SliderField
          label={<>μ (shape)</>}
          value={value.mu}
          min={-3}
          max={80}
          step={1}
          decimals={0}
          marks={[
            { value: 0, label: '0' },
            { value: 20, label: '20' },
            { value: 40, label: '40' },
            { value: 60, label: '60' },
          ]}
          onChange={(v) => set('mu', v)}
        />

        <SliderField
          label={<>Canting σ (deg)</>}
          value={value.cantingStd}
          min={0}
          max={40}
          step={1}
          decimals={0}
          marks={[
            { value: 0, label: '0' },
            { value: 20, label: '20' },
            { value: 40, label: '40' },
          ]}
          onChange={(v) => set('cantingStd', v)}
        />
      </Stack>

      <Paper withBorder p="sm" radius="md" mt="lg" bg="gray.0">
        <Title order={5} mb="xs">
          Presets
        </Title>
        <Stack gap={6}>
          {PRESETS.map((p) => {
            const active = matchPreset(value) === p.key
            return (
              <Button
                key={p.key}
                variant={active ? 'filled' : 'light'}
                color="climasBlue"
                size="sm"
                fullWidth
                styles={{
                  root: { height: 'auto', paddingTop: 6, paddingBottom: 6 },
                  label: { whiteSpace: 'normal' },
                }}
                onClick={() => onChange({ ...value, ...p.values })}
              >
                <Stack gap={0} align="center">
                  <Text size="sm" fw={600}>
                    {p.label}
                  </Text>
                  <Text size="xs" c={active ? 'white' : 'dimmed'} fs="italic">
                    {p.source}
                  </Text>
                </Stack>
              </Button>
            )
          })}
        </Stack>
      </Paper>
    </Paper>
  )
}
